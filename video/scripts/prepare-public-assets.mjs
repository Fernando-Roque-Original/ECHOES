import { existsSync } from 'node:fs';
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const videoRoot = resolve(scriptDirectory, '..');
const projectRoot = resolve(videoRoot, '..');

const files = [
  'public/assets/images/opportunity-final-panorama.jpg',
  'public/assets/images/opportunity-hematite-berries.jpg',
  'public/assets/images/opportunity-last-message.jpg',
  'public/assets/images/opportunity-selfie.jpg',
  'public/assets/maps/mars-texture-nasa.jpg',
  'public/assets/maps/opportunity-traverse-nasa.jpg',
  'public/assets/planets/earth-solarsystemscope.jpg',
  'public/assets/planets/jupiter-solarsystemscope.jpg',
  'public/assets/planets/mercury-solarsystemscope.jpg',
  'public/assets/planets/moon-solarsystemscope.jpg',
  'public/assets/planets/neptune-solarsystemscope.jpg',
  'public/assets/planets/saturn-ring-solarsystemscope.png',
  'public/assets/planets/saturn-solarsystemscope.jpg',
  'public/assets/planets/uranus-solarsystemscope.jpg',
  'public/assets/planets/venus-solarsystemscope.jpg',
  'public/assets/space/milky-way-eso.jpg',
  'public/fonts/atkinson-400.woff',
  'public/fonts/atkinson-700.woff',
];

const fontAliases = [
  {
    from: 'node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2',
    to: 'public/fonts/bricolage-grotesque.woff2',
  },
];

function resolveSource(relativePath) {
  const candidates = [
    resolve(videoRoot, relativePath),
    resolve(projectRoot, relativePath),
  ];
  const source = candidates.find((candidate) => existsSync(candidate));

  if (!source) {
    throw new Error(
      `Asset não encontrado: ${relativePath}. Instale as dependências ou execute a preparação a partir do projeto completo.`,
    );
  }

  return source;
}

for (const relativePath of files) {
  const source = resolveSource(relativePath);
  const destination = resolve(videoRoot, relativePath);

  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

for (const { from, to } of fontAliases) {
  const source = resolveSource(from);
  const destination = resolve(videoRoot, to);

  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

console.log(
  `Assets do filme preparados em ${resolve(videoRoot, 'public')} (${files.length + fontAliases.length} arquivos).`,
);
