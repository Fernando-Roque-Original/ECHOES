from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import math
import re
import subprocess
import time
import wave
from dataclasses import dataclass
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
CAPTIONS_FILE = ROOT / "src" / "data" / "captions.ts"
PUBLIC_AUDIO = ROOT / "public" / "audio"
WORK_DIR = ROOT / ".cache" / "narration"
FPS = 30
TOTAL_SECONDS = 180
SAMPLE_RATE = 48_000
VOICE = "pt-BR-ThalitaMultilingualNeural"


@dataclass(frozen=True)
class Cue:
    index: int
    cue_id: str
    start_frame: int
    end_frame: int
    text: str

    @property
    def start(self) -> float:
        return self.start_frame / FPS

    @property
    def end(self) -> float:
        return self.end_frame / FPS

    @property
    def available(self) -> float:
        return self.end - self.start


def run(command: list[str], *, capture: bool = False) -> str:
    result = subprocess.run(
        command,
        check=True,
        capture_output=capture,
        text=True,
    )
    return result.stdout.strip() if capture else ""


def parse_cues() -> list[Cue]:
    source = CAPTIONS_FILE.read_text(encoding="utf-8")
    pattern = re.compile(
        r"id:\s*'(?P<id>[^']+)',"
        r"\s*movementId:\s*'[^']+',"
        r"\s*startFrame:\s*(?P<start>\d+),"
        r"\s*endFrame:\s*(?P<end>\d+),"
        r"\s*text:\s*'(?P<text>(?:\\.|[^'])*)'",
        re.MULTILINE,
    )
    cues: list[Cue] = []
    for index, match in enumerate(pattern.finditer(source), start=1):
        text = match.group("text").replace("\\'", "'").replace("\\\\", "\\")
        cues.append(
            Cue(
                index=index,
                cue_id=match.group("id"),
                start_frame=int(match.group("start")),
                end_frame=int(match.group("end")),
                text=text,
            )
        )
    if len(cues) != 35:
        raise RuntimeError(f"Esperava 35 cues, encontrei {len(cues)}.")
    return cues


def tts_text(cue: Cue) -> str:
    """Keep screen copy exact while avoiding a known TTS punctuation failure."""
    if cue.cue_id == "c35":
        return "O sinal termina, a luz continua."
    return cue.text


def cache_path(cue: Cue, rate_percent: int) -> Path:
    digest = hashlib.sha1(
        f"{VOICE}\0{rate_percent}\0{tts_text(cue)}".encode("utf-8")
    ).hexdigest()[:12]
    return WORK_DIR / f"{cue.index:02d}-{cue.cue_id}-{rate_percent:+d}-{digest}.mp3"


async def synthesize(text: str, output: Path, rate_percent: int) -> None:
    import edge_tts

    output.parent.mkdir(parents=True, exist_ok=True)
    rate = f"{rate_percent:+d}%"
    last_error: Exception | None = None
    for attempt in range(8):
        try:
            communicate = edge_tts.Communicate(
                text=text,
                voice=VOICE,
                rate=rate,
            )
            await communicate.save(str(output))
            return
        except Exception as error:  # edge-tts can drop a stream transiently.
            last_error = error
            if output.exists():
                output.unlink()
            if attempt == 7:
                break
            delay = min(16.0, 2.5 * (attempt + 1))
            print(
                f"  tentativa {attempt + 1} falhou; repetindo em {delay:.1f}s",
                flush=True,
            )
            await asyncio.sleep(delay)
    raise RuntimeError(f"Falha ao gerar áudio para: {text}") from last_error


def synthesize_sync(cue: Cue, rate_percent: int) -> Path:
    output = cache_path(cue, rate_percent)
    if output.exists() and output.stat().st_size > 1000:
        return output
    print(
        f"[{cue.index:02d}/{35}] gerando {cue.cue_id} "
        f"({rate_percent:+d}%): {tts_text(cue)}",
        flush=True,
    )
    asyncio.run(synthesize(tts_text(cue), output, rate_percent))
    time.sleep(0.45)
    return output


def media_duration(path: Path) -> float:
    output = run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        capture=True,
    )
    return float(output)


def convert_to_wav(source: Path, output: Path, tempo: float = 1.0) -> None:
    filters = [
        "highpass=f=70",
        "lowpass=f=12000",
        "acompressor=threshold=-20dB:ratio=2:attack=8:release=100",
    ]
    if abs(tempo - 1.0) > 0.002:
        filters.append(f"atempo={tempo:.6f}")
    filters.extend(
        [
            "afade=t=in:st=0:d=0.04",
            f"aformat=sample_fmts=s16:sample_rates={SAMPLE_RATE}:channel_layouts=mono",
        ]
    )
    run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(source),
            "-vn",
            "-af",
            ",".join(filters),
            "-c:a",
            "pcm_s16le",
            str(output),
        ]
    )


def read_wav_mono(path: Path) -> np.ndarray:
    with wave.open(str(path), "rb") as audio:
        channels = audio.getnchannels()
        width = audio.getsampwidth()
        rate = audio.getframerate()
        frames = audio.readframes(audio.getnframes())
    if width != 2:
        raise RuntimeError(f"WAV inesperado ({width * 8} bits): {path}")
    data = np.frombuffer(frames, dtype="<i2").astype(np.float32) / 32768.0
    if channels > 1:
        data = data.reshape(-1, channels).mean(axis=1)
    if rate != SAMPLE_RATE:
        raise RuntimeError(f"Taxa inesperada ({rate} Hz): {path}")
    return data


def write_wav_stereo(path: Path, samples: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = np.clip(samples, -1.0, 1.0)
    pcm = (pcm * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as audio:
        audio.setnchannels(2)
        audio.setsampwidth(2)
        audio.setframerate(SAMPLE_RATE)
        audio.writeframes(pcm.tobytes())


def add_at(track: np.ndarray, sample: np.ndarray, start: float) -> None:
    start_index = int(round(start * SAMPLE_RATE))
    if start_index >= track.shape[0]:
        return
    sample = sample[: track.shape[0] - start_index]
    track[start_index : start_index + len(sample)] += sample


def smooth_envelope(value: np.ndarray, seconds: float) -> np.ndarray:
    radius = max(1, int(seconds * SAMPLE_RATE))
    kernel = np.ones(radius * 2 + 1, dtype=np.float32)
    kernel /= kernel.sum()
    padded = np.pad(value, radius, mode="edge")
    return np.convolve(padded, kernel, mode="valid").astype(np.float32)


def section_gain(time: np.ndarray) -> np.ndarray:
    points = np.array(
        [0.0, 16.0, 24.0, 44.0, 50.0, 72.0, 80.0, 122.0, 132.0, 166.0, 180.0],
        dtype=np.float32,
    )
    gains = np.array(
        [0.16, 0.20, 0.34, 0.38, 0.54, 0.66, 0.56, 0.70, 0.78, 0.88, 0.12],
        dtype=np.float32,
    )
    return np.interp(time, points, gains).astype(np.float32)


def note(frequency: float, time: np.ndarray, phase: float = 0.0) -> np.ndarray:
    return np.sin(2.0 * math.pi * frequency * time + phase).astype(np.float32)


def create_music_bed(narration: np.ndarray) -> np.ndarray:
    total_samples = TOTAL_SECONDS * SAMPLE_RATE
    time = np.arange(total_samples, dtype=np.float32) / SAMPLE_RATE
    gain = section_gain(time)

    # Original, copyright-free score: slow modal pad, restrained pulse and
    # high shimmer. It supports the narration without imitating a trailer.
    drone = (
        0.32 * note(73.416, time)
        + 0.20 * note(110.000, time, 0.7)
        + 0.12 * note(146.832, time, 1.8)
        + 0.08 * note(220.000, time, 2.4)
    )
    breath = 0.78 + 0.22 * np.sin(2 * math.pi * 0.055 * time + 0.4)
    pad = drone * breath

    high = (
        0.12 * note(587.330, time, 0.2)
        + 0.09 * note(880.000, time, 1.1)
        + 0.06 * note(1174.659, time, 2.0)
    )
    shimmer_lfo = np.maximum(0.0, np.sin(2 * math.pi * 0.035 * time - 0.6)) ** 3
    shimmer = high * shimmer_lfo

    # Low, soft pulse through the investigation section.
    pulse = np.zeros_like(time)
    beat_period = 2.0
    for beat in np.arange(18.0, 126.0, beat_period):
        start = int(beat * SAMPLE_RATE)
        length = int(0.55 * SAMPLE_RATE)
        local = np.arange(length, dtype=np.float32) / SAMPLE_RATE
        envelope = np.exp(-local * 10.0)
        sound = (
            np.sin(2 * math.pi * (54.0 - 12.0 * local) * local) * envelope * 0.22
        )
        pulse[start : start + length] += sound[: max(0, total_samples - start)]

    # Data ticks and signal-like pings at meaningful beats.
    events = np.zeros_like(time)
    for event_time, frequency in (
        (9.0, 1046.5),
        (13.8, 783.99),
        (57.0, 659.25),
        (72.0, 987.77),
        (107.0, 523.25),
        (108.2, 783.99),
        (171.2, 659.25),
        (173.5, 987.77),
    ):
        start = int(event_time * SAMPLE_RATE)
        length = int(1.6 * SAMPLE_RATE)
        local = np.arange(length, dtype=np.float32) / SAMPLE_RATE
        envelope = np.exp(-local * 3.8)
        sound = np.sin(2 * math.pi * frequency * local) * envelope * 0.055
        events[start : start + length] += sound[: max(0, total_samples - start)]

    # Gentle sub-bass lift into the final legacy section.
    rise_start = int(128.0 * SAMPLE_RATE)
    rise_length = int(10.0 * SAMPLE_RATE)
    local = np.arange(rise_length, dtype=np.float32) / rise_length
    rise = (
        np.sin(2 * math.pi * (36.71 + 18.0 * local) * local)
        * np.sin(np.pi * local) ** 2
        * 0.10
    )
    events[rise_start : rise_start + rise_length] += rise

    music = (pad * 0.20 + shimmer * 0.10 + pulse + events) * gain

    # Duck the score gently under speech using a smoothed voice envelope.
    absolute_voice = np.abs(narration)
    voice_envelope = smooth_envelope(absolute_voice, 0.08)
    duck = 1.0 - np.clip(voice_envelope * 6.0, 0.0, 0.52)
    music *= duck

    fade_in = np.clip(time / 2.5, 0.0, 1.0)
    fade_out = np.clip((TOTAL_SECONDS - time) / 4.0, 0.0, 1.0)
    music *= (fade_in * fade_out).astype(np.float32)
    return music


def build_narration(cues: list[Cue]) -> tuple[np.ndarray, list[dict[str, object]]]:
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    narration = np.zeros(TOTAL_SECONDS * SAMPLE_RATE, dtype=np.float32)
    manifest: list[dict[str, object]] = []

    for cue in cues:
        target_speech = max(1.0, cue.available - 0.34)
        rate = -2
        source = synthesize_sync(cue, rate)
        duration = media_duration(source)

        if duration > target_speech:
            needed_percent = math.ceil((duration / target_speech - 1.0) * 100)
            adjusted_rate = min(24, max(rate + 4, needed_percent))
            source = synthesize_sync(cue, adjusted_rate)
            duration = media_duration(source)

        tempo = 1.0
        if duration > target_speech:
            tempo = duration / target_speech
            if tempo > 1.38:
                raise RuntimeError(
                    f"{cue.cue_id} não cabe na janela: "
                    f"{duration:.2f}s para {target_speech:.2f}s "
                    f"(atempo necessário {tempo:.2f}x)."
                )

        rendered = WORK_DIR / f"{cue.index:02d}-{cue.cue_id}-render.wav"
        convert_to_wav(source, rendered, tempo=tempo)
        speech = read_wav_mono(rendered)
        actual = len(speech) / SAMPLE_RATE
        lead = min(0.14, max(0.04, cue.available - actual - 0.06))
        start = cue.start + lead
        add_at(narration, speech * 0.94, start)
        manifest.append(
            {
                "id": cue.cue_id,
                "startFrame": cue.start_frame,
                "endFrame": cue.end_frame,
                "audioStart": round(start, 4),
                "audioEnd": round(start + actual, 4),
                "duration": round(actual, 4),
                "ratePercent": adjusted_rate if duration > target_speech else rate,
                "tempo": round(tempo, 5),
                "text": cue.text,
            }
        )
        print(
            f"[{cue.index:02d}/35] {cue.cue_id}: "
            f"{actual:.2f}s / {cue.available:.2f}s",
            flush=True,
        )

    peak = float(np.max(np.abs(narration))) if narration.size else 0.0
    if peak > 0:
        narration *= min(1.0, 0.92 / peak)
    return narration, manifest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--voice-only",
        action="store_true",
        help="Gera apenas a narração e não recria o mix.",
    )
    args = parser.parse_args()

    PUBLIC_AUDIO.mkdir(parents=True, exist_ok=True)
    cues = parse_cues()
    narration, manifest = build_narration(cues)
    narration_path = PUBLIC_AUDIO / "narration.wav"
    write_wav_stereo(narration_path, np.column_stack((narration, narration)))

    manifest_path = ROOT / "narration-timing.json"
    manifest_path.write_text(
        json.dumps(
            {
                "voice": VOICE,
                "fps": FPS,
                "durationSeconds": TOTAL_SECONDS,
                "cues": manifest,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    if args.voice_only:
        return

    music = create_music_bed(narration)
    bed_path = PUBLIC_AUDIO / "music-bed.wav"
    write_wav_stereo(bed_path, np.column_stack((music, music)))

    mix_path = PUBLIC_AUDIO / "mix.wav"
    run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(narration_path),
            "-i",
            str(bed_path),
            "-filter_complex",
            (
                "[0:a]highpass=f=78,lowpass=f=11500,"
                "acompressor=threshold=-18dB:ratio=2.4:attack=8:release=120[voice];"
                "[1:a]volume=0.72[music];"
                "[voice][music]amix=inputs=2:duration=longest:normalize=0,"
                "loudnorm=I=-16:TP=-1.5:LRA=9,alimiter=limit=0.96[out]"
            ),
            "-map",
            "[out]",
            "-ar",
            str(SAMPLE_RATE),
            "-ac",
            "2",
            "-c:a",
            "pcm_s16le",
            str(mix_path),
        ]
    )
    print(f"Narração: {narration_path}", flush=True)
    print(f"Trilha:   {bed_path}", flush=True)
    print(f"Mix:      {mix_path}", flush=True)


if __name__ == "__main__":
    main()
