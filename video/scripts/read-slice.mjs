import { readFileSync } from 'node:fs';

const [file, startValue, endValue] = process.argv.slice(2);
const start = Number(startValue);
const end = Number(endValue);
const lines = readFileSync(file, 'utf8').split(/\r?\n/);

for (let index = start; index < Math.min(end, lines.length); index += 1) {
  console.log(`${String(index + 1).padStart(4, ' ')} | ${lines[index]}`);
}
