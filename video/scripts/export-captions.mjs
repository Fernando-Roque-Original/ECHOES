import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const fps = 30;
const totalFrames = 5400;
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const videoRoot = resolve(scriptDirectory, '..');
const sourcePath = resolve(videoRoot, 'src/data/captions.ts');
const outputPath = resolve(videoRoot, 'captions/after-the-signal.srt');
const source = await readFile(sourcePath, 'utf8');

const cuePattern =
  /id:\s*'([^']+)'\s*,\s*movementId:\s*'([^']+)'\s*,\s*startFrame:\s*(\d+)\s*,\s*endFrame:\s*(\d+)\s*,\s*text:\s*'([^']+)'/g;
const cues = [...source.matchAll(cuePattern)].map((match) => ({
  id: match[1],
  movementId: match[2],
  startFrame: Number(match[3]),
  endFrame: Number(match[4]),
  text: match[5],
}));

if (cues.length === 0) {
  throw new Error('Nenhuma legenda foi encontrada em src/data/captions.ts.');
}

if (cues[0].startFrame !== 0) {
  throw new Error('A primeira legenda precisa começar no frame 0.');
}

if (cues.at(-1)?.endFrame !== totalFrames) {
  throw new Error(`A última legenda precisa terminar no frame ${totalFrames}.`);
}

for (let index = 1; index < cues.length; index += 1) {
  if (cues[index].startFrame !== cues[index - 1].endFrame) {
    throw new Error(
      `Legendas não contíguas entre ${cues[index - 1].id} e ${cues[index].id}.`,
    );
  }
}

function toSrtTimestamp(frame) {
  const totalMilliseconds = Math.round((frame / fps) * 1000);
  const milliseconds = totalMilliseconds % 1000;
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    `${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`,
  ].join(':');
}

const srt = `${cues
  .map((cue, index) => {
    const start = toSrtTimestamp(cue.startFrame);
    const end = toSrtTimestamp(cue.endFrame);
    return `${index + 1}\n${start} --> ${end}\n${cue.text}`;
  })
  .join('\n\n')}\n`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, srt, 'utf8');

console.log(
  `SRT gerado em ${outputPath} (${cues.length} blocos, ${totalFrames} frames).`,
);
