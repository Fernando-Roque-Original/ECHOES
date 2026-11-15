import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const scriptDirectory = fileURLToPath(new URL('.', import.meta.url));
const captionsPath = new URL(
  '../src/data/echos30Captions.json',
  import.meta.url,
);
const outputPath = new URL(
  '../out/echos-abandoned-not-forgotten-30s-en.srt',
  import.meta.url,
);
const fps = 30;

function toSrtTimestamp(frame) {
  const totalMilliseconds = Math.round((frame / fps) * 1000);
  const milliseconds = totalMilliseconds % 1000;
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    `${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`,
  ].join(':');
}

const captions = JSON.parse(readFileSync(captionsPath, 'utf8'));
const srt = captions
  .map((cue, index) => {
    return [
      index + 1,
      `${toSrtTimestamp(cue.startFrame)} --> ${toSrtTimestamp(cue.endFrame)}`,
      cue.text,
    ].join('\n');
  })
  .join('\n\n');

writeFileSync(outputPath, `${srt}\n`, 'utf8');
console.log(`Exported ${captions.length} cues to ${outputPath.pathname}`);
console.log(`Script directory: ${scriptDirectory}`);
