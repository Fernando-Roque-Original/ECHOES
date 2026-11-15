import { spawn } from 'node:child_process';
import {
  access,
  copyFile,
  link,
  mkdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
export const VIDEO_FPS = 30;
export const MASTER_DURATION_SECONDS = 180;
export const HIGHLIGHT_DURATION_SECONDS = 30;

// This is an editorial cut from the deterministic 180-second master. Keep the
// source ranges paired with CAPTIONS_30S whenever the capture timeline changes.
export const HIGHLIGHT_CUTS = [
  { start: 0, end: 3 }, // opening title
  { start: 4, end: 7 }, // orbit reveal
  { start: 14.5, end: 17.5 }, // Mars hero
  { start: 37, end: 43 }, // black-background rover teardown
  { start: 80, end: 84 }, // orbit cards focused on the Moon
  { start: 84, end: 91 }, // Moon entry and first beats
  { start: 145, end: 149 }, // return to the opening title
];

export const CAPTIONS_30S = [
  {
    start: 0,
    end: 3,
    text: 'The signal ends.\nThe light continues.',
  },
  {
    start: 3,
    end: 6,
    text: 'Two worlds. Two stories\nof exploration.',
  },
  {
    start: 6,
    end: 9,
    text: 'On Mars, a 90-day mission\nexplored for 14 years.',
  },
  {
    start: 9,
    end: 15,
    text: 'The rover comes apart —\nand discovery becomes visible.',
  },
  {
    start: 15,
    end: 19,
    text: "The Moon: humanity's first\nstep beyond Earth.",
  },
  {
    start: 19,
    end: 26,
    text: 'A thin exosphere. Sharp dust.\nIce hidden in shadow.',
  },
  {
    start: 26,
    end: 30,
    text: 'Every discovery opens\nthe next horizon.',
  },
];

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function smoothstep(value) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

export function formatSrtTimestamp(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const totalMilliseconds = Math.round(safeSeconds * 1000);
  const milliseconds = totalMilliseconds % 1000;
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const secs = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const mins = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  return [
    String(hours).padStart(2, '0'),
    String(mins).padStart(2, '0'),
    String(secs).padStart(2, '0'),
  ].join(':') + `,${String(milliseconds).padStart(3, '0')}`;
}

export function buildSrt(captions) {
  return (
    captions
      .map((caption, index) => {
        const start = formatSrtTimestamp(caption.start);
        const end = formatSrtTimestamp(caption.end);
        return `${index + 1}\n${start} --> ${end}\n${caption.text}`;
      })
      .join('\n\n') + '\n'
  );
}

export async function writeHighlightSrt(outputPath) {
  await writeFile(outputPath, buildSrt(CAPTIONS_30S), 'utf8');
}

export async function findChromeExecutable(env = process.env) {
  const candidates = [
    env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next conventional Windows browser location.
    }
  }

  throw new Error(
    'Chrome/Edge was not found. Set CHROME_PATH to a Chromium executable.',
  );
}

export function spawnChecked(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    const maxLog = 80_000;

    child.stdout?.on('data', (chunk) => {
      const text = String(chunk);
      stdout = (stdout + text).slice(-maxLog);
      options.onStdout?.(text);
    });
    child.stderr?.on('data', (chunk) => {
      const text = String(chunk);
      stderr = (stderr + text).slice(-maxLog);
      options.onStderr?.(text);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(
        new Error(
          `${command} exited with code ${code}\n` +
            `${stderr || stdout || '(no process output)'}`,
        ),
      );
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function captionHtml(text) {
  return escapeHtml(text).replaceAll('\n', '<br />');
}

const overlayPageCss = `
  * { box-sizing: border-box; }
  html, body {
    width: ${VIDEO_WIDTH}px;
    height: ${VIDEO_HEIGHT}px;
    margin: 0;
    overflow: hidden;
    background: transparent;
  }
  body {
    color: #f4ead8;
    font-family: "Segoe UI", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: geometricPrecision;
  }
  .watermark {
    position: absolute;
    top: 30px;
    right: 34px;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 12px 17px 12px 14px;
    border: 1px solid rgba(227, 198, 143, 0.5);
    border-radius: 999px;
    background: rgba(3, 10, 17, 0.8);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    color: rgba(248, 238, 219, 0.94);
    font-size: 24px;
    font-weight: 650;
    letter-spacing: 0.025em;
    line-height: 1;
  }
  .watermark__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #e3c68f;
    box-shadow: 0 0 14px rgba(227, 198, 143, 0.9);
  }
  .caption-wrap {
    position: absolute;
    right: 150px;
    bottom: 54px;
    left: 150px;
    display: flex;
    justify-content: center;
  }
  .caption {
    max-width: 1480px;
    padding: 19px 29px 20px;
    border: 1px solid rgba(227, 198, 143, 0.34);
    border-radius: 9px;
    background: rgba(2, 8, 14, 0.84);
    box-shadow: 0 18px 54px rgba(0, 0, 0, 0.48);
    color: #fff9ed;
    font-size: 42px;
    font-weight: 570;
    letter-spacing: -0.018em;
    line-height: 1.18;
    text-align: center;
    text-wrap: balance;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
  }
`;

async function renderTransparentPage(page, bodyHtml, outputPath) {
  await page.setContent(
    `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <style>${overlayPageCss}</style>
      </head>
      <body>${bodyHtml}</body>
    </html>`,
    { waitUntil: 'load' },
  );
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  await page.screenshot({
    path: outputPath,
    type: 'png',
    omitBackground: true,
    animations: 'disabled',
  });
}

export async function renderOverlayAssets(context, workDir) {
  const overlayDir = path.join(workDir, 'overlays');
  await mkdir(overlayDir, { recursive: true });

  const page = await context.newPage();
  await page.setViewportSize({
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
  });

  try {
    const watermarkPath = path.join(overlayDir, 'powered-by-ai.png');
    await renderTransparentPage(
      page,
      `<div class="watermark">
        <span class="watermark__dot"></span>
        <span>Powered by AI</span>
      </div>`,
      watermarkPath,
    );

    const captionPaths = [];
    for (const [index, caption] of CAPTIONS_30S.entries()) {
      const captionPath = path.join(
        overlayDir,
        `caption-${String(index + 1).padStart(2, '0')}.png`,
      );
      await renderTransparentPage(
        page,
        `<div class="caption-wrap">
          <div class="caption">${captionHtml(caption.text)}</div>
        </div>`,
        captionPath,
      );
      captionPaths.push(captionPath);
    }

    return { overlayDir, watermarkPath, captionPaths };
  } finally {
    await page.close();
  }
}

function nearestFrame(frames, targetTimestamp) {
  let low = 0;
  let high = frames.length - 1;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (frames[mid].timestamp < targetTimestamp) low = mid + 1;
    else high = mid;
  }

  const before = frames[Math.max(0, low - 1)];
  const after = frames[low];
  return Math.abs(before.timestamp - targetTimestamp) <=
    Math.abs(after.timestamp - targetTimestamp)
    ? before
    : after;
}

export async function materializeFrameSequence({
  capturedFrames,
  durationSeconds = MASTER_DURATION_SECONDS,
  fps = VIDEO_FPS,
  loopFreezeSeconds = 5,
  workDir,
}) {
  if (!capturedFrames?.length) {
    throw new Error('No screencast frames were captured.');
  }

  const frames = [...capturedFrames].sort(
    (left, right) => left.timestamp - right.timestamp,
  );
  const anchor = frames[0].timestamp;
  const frameCount = Math.round(durationSeconds * fps);
  const loopFreezeFrames = Math.round(
    clamp(loopFreezeSeconds, 0, durationSeconds) * fps,
  );
  const loopFreezeStart = Math.max(0, frameCount - loopFreezeFrames);
  const sequenceDir = path.join(workDir, 'sequence');
  await rm(sequenceDir, { recursive: true, force: true });
  await mkdir(sequenceDir, { recursive: true });

  let linkedFrames = 0;
  let copiedFrames = 0;
  let frozenLoopFrames = 0;
  for (let index = 0; index < frameCount; index += 1) {
    const useLoopFrame = index >= loopFreezeStart;
    const targetTimestamp = anchor + (index * 1000) / fps;
    const source = useLoopFrame
      ? frames[0].file
      : nearestFrame(frames, targetTimestamp).file;
    if (useLoopFrame) frozenLoopFrames += 1;
    const target = path.join(
      sequenceDir,
      `frame-${String(index + 1).padStart(6, '0')}.jpg`,
    );
    try {
      await link(source, target);
      linkedFrames += 1;
    } catch {
      await copyFile(source, target);
      copiedFrames += 1;
    }
  }

  const lastTimestamp = frames.at(-1)?.timestamp ?? anchor;
  const coverageSeconds = (lastTimestamp - anchor) / 1000;
  return {
    sequenceDir,
    frameCount,
    fps,
    durationSeconds,
    coverageSeconds,
    capturedFrameCount: frames.length,
    linkedFrames,
    copiedFrames,
    loopFreezeSeconds,
    frozenLoopFrames,
  };
}

export async function composeSilentMaster({
  sequence,
  outputPath,
  durationSeconds = MASTER_DURATION_SECONDS,
  fps = VIDEO_FPS,
  ffmpegPath = process.env.FFMPEG_PATH ?? 'ffmpeg',
  onProgress,
}) {
  const inputPattern = path.join(sequence.sequenceDir, 'frame-%06d.jpg');
  const filters = [
    `fps=${fps}`,
    `scale=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:flags=lanczos`,
    'setsar=1',
    'format=yuv420p',
  ].join(',');

  await mkdir(path.dirname(outputPath), { recursive: true });
  await spawnChecked(
    ffmpegPath,
    [
      '-hide_banner',
      '-loglevel',
      'warning',
      '-stats',
      '-y',
      '-framerate',
      String(fps),
      '-start_number',
      '1',
      '-i',
      inputPattern,
      '-vf',
      filters,
      '-frames:v',
      String(Math.round(durationSeconds * fps)),
      '-r',
      String(fps),
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '18',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      outputPath,
    ],
    { onStderr: onProgress },
  );
}

export async function composeHighlight({
  masterPath,
  overlays,
  outputPath,
  cuts = HIGHLIGHT_CUTS,
  captions = CAPTIONS_30S,
  fps = VIDEO_FPS,
  ffmpegPath = process.env.FFMPEG_PATH ?? 'ffmpeg',
  onProgress,
}) {
  if (captions.length !== overlays.captionPaths.length) {
    throw new Error('Caption timing count does not match caption PNG count.');
  }

  const trimLabels = cuts.map((_, index) => `cut${index}`);
  const splitLabels = cuts.map((_, index) => `split${index}`);
  const args = [
    '-hide_banner',
    '-loglevel',
    'warning',
    '-stats',
    '-y',
    '-i',
    masterPath,
    '-loop',
    '1',
    '-i',
    overlays.watermarkPath,
  ];

  for (const captionPath of overlays.captionPaths) {
    args.push('-loop', '1', '-i', captionPath);
  }

  const filterParts = [
    `[0:v]split=${cuts.length}${splitLabels
      .map((label) => `[${label}]`)
      .join('')}`,
  ];

  cuts.forEach((cut, index) => {
    filterParts.push(
      `[${splitLabels[index]}]trim=start=${cut.start}:end=${cut.end},` +
        `setpts=PTS-STARTPTS[${trimLabels[index]}]`,
    );
  });

  const totalDuration = cuts.reduce(
    (sum, cut) => sum + (cut.end - cut.start),
    0,
  );
  const firstCaptionTime = captions[0]?.start ?? 0;
  const lastCaption = captions.at(-1);
  const lastCaptionEnd = lastCaption?.end ?? totalDuration;

  filterParts.push(
    `${trimLabels.map((label) => `[${label}]`).join('')}` +
      `concat=n=${cuts.length}:v=1:a=0,` +
      `fps=${fps},scale=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:flags=lanczos,` +
      'setsar=1,format=rgba[base]',
  );
  filterParts.push(
    `[base][1:v]overlay=0:0:format=auto:repeatlast=1[watermarked]`,
  );

  let currentLabel = 'watermarked';
  captions.forEach((caption, index) => {
    const nextLabel = `captioned${index}`;
    const inputIndex = index + 2;
    const enable = `between(t,${caption.start},${caption.end})`;
    filterParts.push(
      `[${currentLabel}][${inputIndex}:v]` +
        `overlay=0:0:format=auto:repeatlast=1:enable='${enable}'` +
        `[${nextLabel}]`,
    );
    currentLabel = nextLabel;
  });

  const fadeDuration = 0.25;
  filterParts.push(
    `[${currentLabel}]fade=t=in:st=${firstCaptionTime}:d=${fadeDuration},` +
      `fade=t=out:st=${Math.max(
        firstCaptionTime,
        lastCaptionEnd - fadeDuration,
      )}:d=${fadeDuration},format=yuv420p[outv]`,
  );

  args.push(
    '-filter_complex',
    filterParts.join(';'),
    '-map',
    '[outv]',
    '-t',
    String(totalDuration),
    '-r',
    String(fps),
    '-an',
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '18',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    outputPath,
  );

  await mkdir(path.dirname(outputPath), { recursive: true });
  await spawnChecked(ffmpegPath, args, { onStderr: onProgress });
  return { totalDuration, firstCaptionTime, lastCaptionEnd };
}

function parseRate(rate) {
  if (typeof rate !== 'string' || !rate.includes('/')) return Number(rate);
  const [numerator, denominator] = rate.split('/').map(Number);
  return denominator ? numerator / denominator : Number.NaN;
}

export async function probeMedia(
  mediaPath,
  ffprobePath = process.env.FFPROBE_PATH ?? 'ffprobe',
) {
  const { stdout } = await spawnChecked(ffprobePath, [
    '-v',
    'error',
    '-show_entries',
    'format=duration:stream=index,codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate',
    '-of',
    'json',
    mediaPath,
  ]);
  return JSON.parse(stdout);
}

export async function validateMedia({
  mediaPath,
  expectedDuration,
  durationTolerance = 0.25,
  requireSilent = true,
  ffprobePath,
}) {
  const probe = await probeMedia(mediaPath, ffprobePath);
  const video = probe.streams?.find((stream) => stream.codec_type === 'video');
  const audioStreams =
    probe.streams?.filter((stream) => stream.codec_type === 'audio') ?? [];
  const duration = Number(probe.format?.duration);
  const fps = parseRate(video?.avg_frame_rate ?? video?.r_frame_rate);

  if (!video) throw new Error(`${mediaPath}: no video stream`);
  if (video.width !== VIDEO_WIDTH || video.height !== VIDEO_HEIGHT) {
    throw new Error(
      `${mediaPath}: expected ${VIDEO_WIDTH}x${VIDEO_HEIGHT}, ` +
        `found ${video.width}x${video.height}`,
    );
  }
  if (Math.abs(fps - VIDEO_FPS) > 0.02) {
    throw new Error(`${mediaPath}: expected ${VIDEO_FPS} fps, found ${fps}`);
  }
  if (Math.abs(duration - expectedDuration) > durationTolerance) {
    throw new Error(
      `${mediaPath}: expected ${expectedDuration}s, found ${duration}s`,
    );
  }
  if (requireSilent && audioStreams.length > 0) {
    throw new Error(`${mediaPath}: expected no audio stream`);
  }

  return {
    mediaPath,
    codec: video.codec_name,
    width: video.width,
    height: video.height,
    fps,
    duration,
    audioStreams: audioStreams.length,
  };
}

export async function cleanupWorkDir(workDir) {
  const resolved = path.resolve(workDir);
  if (
    !resolved.includes(`${path.sep}.echos-reel`) &&
    !path.basename(resolved).startsWith('.echos-reel')
  ) {
    throw new Error(`Refusing to remove unexpected work directory: ${resolved}`);
  }
  await rm(resolved, { recursive: true, force: true });
}
