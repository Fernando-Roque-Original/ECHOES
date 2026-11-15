import * as THREE from 'three';

type SurfaceStyle = 'mars' | 'moon' | 'generic';

type TextureOptions = {
  base: string;
  dark: string;
  light: string;
  seed: number;
  source?: string;
  style?: SurfaceStyle;
};

type SurfaceGrade = {
  saturation: number;
  contrast: number;
  detail: number;
  redGain: number;
  greenGain: number;
  blueGain: number;
};

type Rgb = readonly [number, number, number];
type Point = readonly [number, number];

const TEXTURE_WIDTH = 1536;
const TEXTURE_HEIGHT = 768;
const TAU = Math.PI * 2;
const imageCache = new Map<string, Promise<HTMLImageElement>>();

const surfaceGrades: Record<SurfaceStyle, SurfaceGrade> = {
  mars: {
    saturation: 0.7,
    contrast: 1.08,
    detail: 0.28,
    redGain: 1.02,
    greenGain: 0.97,
    blueGain: 0.91,
  },
  moon: {
    saturation: 0.08,
    contrast: 1.16,
    detail: 0.36,
    redGain: 0.985,
    greenGain: 1,
    blueGain: 1.015,
  },
  generic: {
    saturation: 0.94,
    contrast: 1.035,
    detail: 0.24,
    redGain: 1,
    greenGain: 1,
    blueGain: 1,
  },
};

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const amount = clamp(
    (value - edge0) / Math.max(0.0001, edge1 - edge0),
    0,
    1,
  );
  return amount * amount * (3 - 2 * amount);
}

function parseHexColor(value: string): Rgb {
  const hex = value.replace('#', '');
  const expanded =
    hex.length === 3
      ? hex
          .split('')
          .map((character) => character + character)
          .join('')
      : hex;
  const parsed = Number.parseInt(expanded.slice(0, 6), 16);

  if (!Number.isFinite(parsed)) return [128, 128, 128];

  return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255];
}

function rgba(color: Rgb, alpha: number) {
  return `rgba(${Math.round(color[0])}, ${Math.round(
    color[1],
  )}, ${Math.round(color[2])}, ${clamp(alpha, 0, 1)})`;
}

function hashNoise(x: number, y: number, seed: number) {
  let hash =
    Math.imul(x, 374761393) ^
    Math.imul(y, 668265263) ^
    Math.imul(seed, 1442695041);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  hash ^= hash >>> 16;
  return (hash >>> 0) / 4294967295;
}

function periodicValueNoise(
  x: number,
  y: number,
  periodX: number,
  seed: number,
) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const wrappedX0 = ((x0 % periodX) + periodX) % periodX;
  const wrappedX1 = (wrappedX0 + 1) % periodX;

  const top =
    hashNoise(wrappedX0, y0, seed) * (1 - sx) +
    hashNoise(wrappedX1, y0, seed) * sx;
  const bottom =
    hashNoise(wrappedX0, y0 + 1, seed) * (1 - sx) +
    hashNoise(wrappedX1, y0 + 1, seed) * sx;

  return top * (1 - sy) + bottom * sy;
}

function fractalNoise(
  u: number,
  v: number,
  seed: number,
  octaves: number,
  baseFrequencyX: number,
  baseFrequencyY: number,
) {
  let frequencyX = baseFrequencyX;
  let frequencyY = baseFrequencyY;
  let amplitude = 0.5;
  let total = 0;
  let normalization = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    total +=
      periodicValueNoise(
        u * frequencyX,
        v * frequencyY,
        frequencyX,
        seed + octave * 97,
      ) * amplitude;
    normalization += amplitude;
    amplitude *= 0.52;
    frequencyX *= 2;
    frequencyY *= 2;
  }

  return total / normalization;
}

function ridgedNoise(
  u: number,
  v: number,
  seed: number,
  octaves: number,
  baseFrequencyX: number,
  baseFrequencyY: number,
) {
  let frequencyX = baseFrequencyX;
  let frequencyY = baseFrequencyY;
  let amplitude = 0.5;
  let total = 0;
  let normalization = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    const value = periodicValueNoise(
      u * frequencyX,
      v * frequencyY,
      frequencyX,
      seed + octave * 131,
    );
    total += (1 - Math.abs(value * 2 - 1)) * amplitude;
    normalization += amplitude;
    amplitude *= 0.5;
    frequencyX *= 2;
    frequencyY *= 2;
  }

  return total / normalization;
}

function shortestPeriodicDelta(a: number, b: number) {
  return a - b - Math.round(a - b);
}

function createSurfaceField(
  style: SurfaceStyle,
  seed: number,
  base: string,
  dark: string,
  light: string,
) {
  const fieldWidth = 768;
  const fieldHeight = 384;
  const canvas = document.createElement('canvas');
  canvas.width = fieldWidth;
  canvas.height = fieldHeight;
  const context = canvas.getContext('2d');
  if (!context) return canvas;

  const image = context.createImageData(fieldWidth, fieldHeight);
  const pixels = image.data;
  const baseColor = parseHexColor(base);
  const darkColor = parseHexColor(dark);
  const lightColor = parseHexColor(light);
  const lunarMaria = [
    [0.18, 0.37, 0.2, 0.16, 0.58],
    [0.3, 0.43, 0.2, 0.16, 0.82],
    [0.42, 0.39, 0.19, 0.17, 0.9],
    [0.54, 0.46, 0.2, 0.15, 0.78],
    [0.43, 0.58, 0.19, 0.13, 0.64],
    [0.67, 0.35, 0.14, 0.13, 0.56],
    [0.12, 0.57, 0.15, 0.13, 0.48],
  ] as const;

  for (let y = 0; y < fieldHeight; y += 1) {
    const v = y / (fieldHeight - 1);
    for (let x = 0; x < fieldWidth; x += 1) {
      const u = x / (fieldWidth - 1);
      const warpX =
        (fractalNoise(u, v, seed + 701, 4, 3, 2) - 0.5) * 0.052;
      const warpY =
        (fractalNoise(u, v, seed + 827, 4, 3, 2) - 0.5) * 0.038;
      const warpedU = u + warpX;
      const warpedV = clamp(v + warpY, 0, 1);
      const macro = fractalNoise(u, v, seed + 17, 6, 3, 2);
      const meso = fractalNoise(u, v, seed + 211, 4, 8, 4);
      const detail = fractalNoise(u, v, seed + 431, 4, 34, 17);
      const micro = fractalNoise(u, v, seed + 563, 2, 96, 48);
      const ridges = ridgedNoise(u, v, seed + 503, 5, 7, 4);
      const regional = fractalNoise(warpedU, warpedV, seed + 883, 5, 2.4, 1.7);
      let tone: number;

      if (style === 'moon') {
        let basalt = 0;

        for (
          let index = 0;
          index < lunarMaria.length;
          index += 1
        ) {
          const [centerX, centerY, radiusX, radiusY, strength] =
            lunarMaria[index];
          const boundary =
            (fractalNoise(
              warpedU,
              warpedV,
              seed + 113 + index * 37,
              4,
              7,
              4,
            ) -
              0.5) *
            0.34;
          const dx = shortestPeriodicDelta(warpedU, centerX) / radiusX;
          const dy = (warpedV - centerY) / radiusY;
          const distance = Math.sqrt(dx * dx + dy * dy) + boundary;
          basalt +=
            (1 - smoothstep(0.18, 1.26, distance)) * strength;
        }

        const filaments = fractalNoise(
          warpedU,
          warpedV,
          seed + 941,
          4,
          15,
          7,
        );
        const mariaClouds = smoothstep(
          0.43,
          0.7,
          regional + (macro - 0.5) * 0.18,
        );
        const mariaMask = smoothstep(
          0.18,
          0.88,
          basalt * 0.52 +
            mariaClouds * 0.62 +
            (filaments - 0.5) * 0.16,
        );
        const highlands =
          0.8 +
          (macro - 0.5) * 0.3 +
          (meso - 0.5) * 0.2 +
          (ridges - 0.5) * 0.17 +
          (detail - 0.5) * 0.14 +
          (micro - 0.5) * 0.055;
        const basaltTone =
          0.2 +
          (macro - 0.5) * 0.16 +
          (meso - 0.5) * 0.13 +
          (detail - 0.5) * 0.11 +
          (ridges - 0.5) * 0.1 +
          (regional - 0.5) * 0.025;
        tone = clamp(
          highlands + (basaltTone - highlands) * mariaMask,
          0.05,
          0.98,
        );
      } else if (style === 'mars') {
        const darkRegions = smoothstep(
          0.47,
          0.74,
          regional * 0.68 +
            macro * 0.22 +
            (meso - 0.5) * 0.18,
        );
        const dustVeil = smoothstep(
          0.38,
          0.72,
          fractalNoise(warpedU, warpedV, seed + 619, 4, 4.5, 3),
        );
        const relief =
          (macro - 0.5) * 0.56 +
          (meso - 0.5) * 0.32 +
          (ridges - 0.5) * 0.2 +
          (detail - 0.5) * 0.19 +
          (micro - 0.5) * 0.085;
        tone = clamp(
          0.575 +
            relief -
            darkRegions * 0.36 +
            dustVeil * 0.075,
          0.12,
          0.94,
        );
      } else {
        const relief =
          (macro - 0.5) * 0.48 +
          (meso - 0.5) * 0.25 +
          (ridges - 0.5) * 0.16 +
          (detail - 0.5) * 0.1;
        tone = clamp(0.52 + relief, 0.1, 0.92);
      }

      let red: number;
      let green: number;
      let blue: number;

      if (tone < 0.5) {
        const amount = tone * 2;
        red = darkColor[0] + (baseColor[0] - darkColor[0]) * amount;
        green = darkColor[1] + (baseColor[1] - darkColor[1]) * amount;
        blue = darkColor[2] + (baseColor[2] - darkColor[2]) * amount;
      } else {
        const amount = (tone - 0.5) * 2;
        red = baseColor[0] + (lightColor[0] - baseColor[0]) * amount;
        green = baseColor[1] + (lightColor[1] - baseColor[1]) * amount;
        blue = baseColor[2] + (lightColor[2] - baseColor[2]) * amount;
      }

      if (style === 'mars') {
        const dustShift = (detail - 0.5) * 10;
        red = red * 0.94 + 188 * 0.06 + dustShift;
        green = green * 0.95 + 126 * 0.05 + dustShift * 0.62;
        blue = blue * 0.95 + 82 * 0.05 + dustShift * 0.35;
      } else if (style === 'moon') {
        const neutralShift = (micro - 0.5) * 8;
        red = red + neutralShift;
        green = green + neutralShift;
        blue = blue + neutralShift * 0.96;
      }

      const offset = (y * fieldWidth + x) * 4;
      pixels[offset] = clamp(red, 0, 255);
      pixels[offset + 1] = clamp(green, 0, 255);
      pixels[offset + 2] = clamp(blue, 0, 255);
      pixels[offset + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  return canvas;
}

function paintPolarHaze(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: SurfaceStyle,
) {
  if (style === 'generic') return;

  const isMars = style === 'mars';
  const top = context.createLinearGradient(0, 0, 0, height * 0.12);
  top.addColorStop(
    0,
    isMars ? 'rgba(233, 219, 201, 0.2)' : 'rgba(16, 18, 19, 0.08)',
  );
  top.addColorStop(
    0.35,
    isMars ? 'rgba(221, 201, 177, 0.07)' : 'rgba(0, 0, 0, 0)',
  );
  top.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = top;
  context.fillRect(0, 0, width, height * 0.12);

  const bottom = context.createLinearGradient(
    0,
    height,
    0,
    height * 0.9,
  );
  bottom.addColorStop(
    0,
    isMars ? 'rgba(229, 215, 198, 0.14)' : 'rgba(16, 18, 19, 0.06)',
  );
  bottom.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = bottom;
  context.fillRect(0, height * 0.9, width, height * 0.1);
}

function traceSmoothPath(
  context: CanvasRenderingContext2D,
  points: readonly Point[],
) {
  if (points.length === 0) return;

  context.beginPath();
  context.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    context.quadraticCurveTo(
      current[0],
      current[1],
      (current[0] + next[0]) * 0.5,
      (current[1] + next[1]) * 0.5,
    );
  }
  const last = points[points.length - 1];
  context.lineTo(last[0], last[1]);
}

function strokeCanyon(
  context: CanvasRenderingContext2D,
  points: readonly Point[],
  lineWidth: number,
  color: Rgb,
  alpha: number,
  offsetY = 0,
) {
  context.save();
  context.translate(0, offsetY);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.lineWidth = lineWidth;
  context.strokeStyle = rgba(color, alpha);
  traceSmoothPath(context, points);
  context.stroke();
  context.restore();
}

function paintMarsCanyon(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const dark: Rgb = [45, 27, 22];
  const highlight: Rgb = [224, 177, 132];
  const main: Point[] = [
    [width * 0.34, height * 0.54],
    [width * 0.4, height * 0.505],
    [width * 0.46, height * 0.525],
    [width * 0.52, height * 0.5],
    [width * 0.59, height * 0.52],
    [width * 0.67, height * 0.55],
  ];
  const northBranch: Point[] = [
    [width * 0.39, height * 0.51],
    [width * 0.44, height * 0.475],
    [width * 0.51, height * 0.485],
    [width * 0.57, height * 0.49],
  ];
  const southBranch: Point[] = [
    [width * 0.45, height * 0.53],
    [width * 0.49, height * 0.565],
    [width * 0.56, height * 0.58],
    [width * 0.62, height * 0.565],
  ];

  context.save();
  context.translate(width * 0.5, height * 0.53);
  context.scale(1, 0.16);
  const basin = context.createRadialGradient(0, 0, 0, 0, 0, width * 0.23);
  basin.addColorStop(0, rgba(dark, 0.1));
  basin.addColorStop(0.62, rgba(dark, 0.045));
  basin.addColorStop(1, rgba(dark, 0));
  context.fillStyle = basin;
  context.beginPath();
  context.arc(0, 0, width * 0.23, 0, TAU);
  context.fill();
  context.restore();

  for (const [branch, lineWidth] of [
    [main, 13],
    [northBranch, 4.5],
    [southBranch, 5],
  ] as const) {
    context.save();
    context.filter = 'blur(5px)';
    strokeCanyon(context, branch, lineWidth * 2.1, dark, 0.045);
    context.filter = 'blur(2px)';
    strokeCanyon(context, branch, lineWidth, dark, 0.1);
    context.filter = 'none';
    strokeCanyon(context, branch, lineWidth * 0.26, dark, 0.13);
    strokeCanyon(context, branch, 1.1, highlight, 0.028, -2);
    context.restore();
  }

  const random = seededRandom(414);
  context.save();
  context.filter = 'blur(1.5px)';
  for (let index = 0; index < 34; index += 1) {
    const startX = width * (0.33 + random() * 0.35);
    const startY = height * (0.475 + random() * 0.095);
    const length = width * (0.008 + random() * 0.045);
    const lean = (random() - 0.5) * height * 0.055;
    strokeCanyon(
      context,
      [
        [startX, startY],
        [startX + length * 0.45, startY + lean * 0.35],
        [startX + length, startY + lean],
      ],
      0.45 + random() * 1.1,
      dark,
      0.018 + random() * 0.025,
    );
  }
  context.restore();

  for (let index = 0; index < 6; index += 1) {
    const plateauY = height * (0.46 + index * 0.029);
    strokeCanyon(
      context,
      [
        [width * 0.28, plateauY],
        [width * 0.39, plateauY - height * 0.006],
        [width * 0.5, plateauY + height * 0.003],
        [width * 0.66, plateauY - height * 0.005],
      ],
      index % 2 === 0 ? 1 : 0.7,
      index % 2 === 0 ? highlight : dark,
      0.012,
    );
  }
}

function paintMarsDustVeils(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  random: () => number,
) {
  const light: Rgb = [220, 170, 122];
  const dark: Rgb = [80, 48, 34];

  context.save();
  for (let index = 0; index < 28; index += 1) {
    const y = height * (0.08 + random() * 0.84);
    const length = width * (0.18 + random() * 0.45);
    const startX = random() * width - width * 0.1;
    context.lineCap = 'round';
    context.lineWidth = 2 + random() * 13;
    context.strokeStyle = rgba(
      random() > 0.68 ? dark : light,
      0.008 + random() * 0.018,
    );
    context.beginPath();
    context.moveTo(startX, y);
    context.bezierCurveTo(
      startX + length * 0.3,
      y - height * (random() * 0.018),
      startX + length * 0.7,
      y + height * (random() * 0.018),
      startX + length,
      y + height * (random() - 0.5) * 0.02,
    );
    context.stroke();
  }
  context.restore();
}

function traceCraterPath(
  context: CanvasRenderingContext2D,
  points: readonly Point[],
  scale: number,
) {
  if (points.length < 3) return;

  const first = points[0];
  const second = points[1];
  context.beginPath();
  context.moveTo(
    ((first[0] + second[0]) * scale) * 0.5,
    ((first[1] + second[1]) * scale) * 0.5,
  );

  for (let index = 1; index <= points.length; index += 1) {
    const current = points[index % points.length];
    const next = points[(index + 1) % points.length];
    context.quadraticCurveTo(
      current[0] * scale,
      current[1] * scale,
      ((current[0] + next[0]) * scale) * 0.5,
      ((current[1] + next[1]) * scale) * 0.5,
    );
  }
  context.closePath();
}

function drawCrater(
  context: CanvasRenderingContext2D,
  style: SurfaceStyle,
  x: number,
  y: number,
  radius: number,
  craterSeed: number,
) {
  const random = seededRandom(craterSeed);
  const isMoon = style === 'moon';
  const dark: Rgb = isMoon ? [46, 49, 50] : [57, 35, 27];
  const light: Rgb = isMoon ? [227, 226, 216] : [218, 172, 126];
  const points: Point[] = [];
  const pointCount = 17 + Math.floor(random() * 9);

  for (let index = 0; index < pointCount; index += 1) {
    const angle = (index / pointCount) * TAU;
    const broadWarp = Math.sin(angle * 3 + random() * 0.5) * 0.045;
    const rim =
      1 +
      broadWarp +
      (random() - 0.5) * (isMoon ? 0.18 : 0.14);
    points.push([
      Math.cos(angle) * radius * rim,
      Math.sin(angle) * radius * rim,
    ]);
  }

  context.save();
  context.translate(x, y);
  context.rotate(random() * TAU);
  context.scale(0.86 + random() * 0.24, 0.84 + random() * 0.26);

  const ejecta = context.createRadialGradient(
    -radius * 0.12,
    -radius * 0.16,
    radius * 0.68,
    0,
    0,
    radius * 1.7,
  );
  ejecta.addColorStop(0, rgba(light, 0));
  ejecta.addColorStop(0.56, rgba(light, isMoon ? 0.055 : 0.032));
  ejecta.addColorStop(0.82, rgba(dark, isMoon ? 0.028 : 0.018));
  ejecta.addColorStop(1, rgba(dark, 0));
  context.fillStyle = ejecta;
  context.beginPath();
  context.arc(0, 0, radius * 1.7, 0, TAU);
  context.fill();

  traceCraterPath(context, points, 1);
  context.save();
  context.clip();

  const floor = context.createRadialGradient(
    -radius * 0.2,
    -radius * 0.24,
    radius * 0.04,
    0,
    0,
    radius * 1.08,
  );
  floor.addColorStop(0, rgba(dark, isMoon ? 0.08 : 0.045));
  floor.addColorStop(0.58, rgba(dark, isMoon ? 0.16 : 0.09));
  floor.addColorStop(0.88, rgba(dark, isMoon ? 0.27 : 0.16));
  floor.addColorStop(1, rgba(dark, isMoon ? 0.12 : 0.07));
  context.fillStyle = floor;
  context.fillRect(
    -radius * 1.1,
    -radius * 1.1,
    radius * 2.2,
    radius * 2.2,
  );

  const lightSweep = context.createLinearGradient(
    -radius,
    -radius,
    radius,
    radius,
  );
  lightSweep.addColorStop(0, rgba(light, isMoon ? 0.055 : 0.025));
  lightSweep.addColorStop(0.48, rgba(light, 0));
  lightSweep.addColorStop(1, rgba(dark, isMoon ? 0.1 : 0.06));
  context.fillStyle = lightSweep;
  context.fillRect(
    -radius * 1.1,
    -radius * 1.1,
    radius * 2.2,
    radius * 2.2,
  );

  for (let index = 0; index < 7; index += 1) {
    const angle = random() * TAU;
    const distance = Math.sqrt(random()) * radius * 0.72;
    const grainRadius = radius * (0.025 + random() * 0.085);
    context.fillStyle = rgba(
      random() > 0.48 ? dark : light,
      isMoon ? 0.035 + random() * 0.045 : 0.018 + random() * 0.03,
    );
    context.beginPath();
    context.arc(
      Math.cos(angle) * distance,
      Math.sin(angle) * distance,
      grainRadius,
      0,
      TAU,
    );
    context.fill();
  }
  context.restore();

  traceCraterPath(context, points, 1);
  context.lineWidth = Math.max(0.5, radius * 0.032);
  context.strokeStyle = rgba(light, isMoon ? 0.18 : 0.105);
  context.stroke();

  context.lineCap = 'round';
  context.beginPath();
  context.arc(0, 0, radius * 0.94, Math.PI * 1.06, Math.PI * 1.8);
  context.lineWidth = Math.max(0.5, radius * 0.05);
  context.strokeStyle = rgba(light, isMoon ? 0.12 : 0.07);
  context.stroke();

  context.beginPath();
  context.arc(0, 0, radius * 0.93, Math.PI * 0.06, Math.PI * 0.78);
  context.lineWidth = Math.max(0.45, radius * 0.042);
  context.strokeStyle = rgba(dark, isMoon ? 0.08 : 0.05);
  context.stroke();

  if (radius > 11 && random() > 0.52) {
    const peak = context.createRadialGradient(
      -radius * 0.03,
      -radius * 0.04,
      0,
      0,
      0,
      radius * 0.19,
    );
    peak.addColorStop(0, rgba(light, isMoon ? 0.22 : 0.12));
    peak.addColorStop(0.55, rgba(light, isMoon ? 0.09 : 0.05));
    peak.addColorStop(1, rgba(light, 0));
    context.fillStyle = peak;
    context.beginPath();
    context.arc(0, 0, radius * 0.2, 0, TAU);
    context.fill();
  }

  context.restore();
}

function drawWrappedFeature(
  context: CanvasRenderingContext2D,
  width: number,
  x: number,
  reach: number,
  draw: (wrappedX: number) => void,
) {
  const wrappedX = ((x % width) + width) % width;
  draw(wrappedX);
  if (wrappedX < reach) draw(wrappedX + width);
  else if (wrappedX + reach > width) draw(wrappedX - width);
}

function paintCraters(
  context: CanvasRenderingContext2D,
  style: SurfaceStyle,
  width: number,
  height: number,
  random: () => number,
) {
  const count = style === 'moon' ? 420 : style === 'mars' ? 310 : 90;

  for (let index = 0; index < count; index += 1) {
    const sizeCurve = Math.pow(random(), style === 'moon' ? 3.8 : 4.05);
    const rareLargeCrater = random() > 0.985 ? random() : 0;
    const radius =
      (style === 'moon' ? 0.55 : 0.7) +
      sizeCurve * (style === 'moon' ? 18 : 16) +
      rareLargeCrater * (style === 'moon' ? 9 : 8);
    const x = random() * width;
    const y = height * (0.055 + random() * 0.89);
    const craterSeed = 1 + Math.floor(random() * 2147483645);
    drawWrappedFeature(context, width, x, radius * 1.8, (wrappedX) => {
      drawCrater(context, style, wrappedX, y, radius, craterSeed);
    });
  }
}

function paintMoonRaySystems(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  random: () => number,
) {
  const systems = [
    [0.37, 0.72, 175],
    [0.61, 0.34, 135],
    [0.16, 0.55, 105],
  ] as const;
  const rayColor: Rgb = [242, 240, 225];
  const darkColor: Rgb = [47, 51, 52];

  for (let systemIndex = 0; systemIndex < systems.length; systemIndex += 1) {
    const [centerX, centerY, radius] = systems[systemIndex];
    const x = centerX * width;
    const y = centerY * height;
    const halo = context.createRadialGradient(x, y, 0, x, y, radius);
    halo.addColorStop(0, rgba(rayColor, 0.08));
    halo.addColorStop(0.16, rgba(rayColor, 0.04));
    halo.addColorStop(0.55, rgba(rayColor, 0.012));
    halo.addColorStop(1, rgba(rayColor, 0));
    context.fillStyle = halo;
    context.beginPath();
    context.arc(x, y, radius, 0, TAU);
    context.fill();

    context.save();
    context.lineCap = 'round';
    for (let index = 0; index < 46; index += 1) {
      const angle = random() * TAU;
      const start = radius * (0.04 + random() * 0.12);
      const length = radius * (0.3 + random() * 0.88);
      const bend = (random() - 0.5) * radius * 0.1;
      const endBend = (random() - 0.5) * 2.4;
      const directionX = Math.cos(angle);
      const directionY = Math.sin(angle);
      const perpendicularX = -directionY;
      const perpendicularY = directionX;

      context.strokeStyle = rgba(
        random() > 0.12 ? rayColor : darkColor,
        0.014 + random() * 0.048,
      );
      context.lineWidth = 0.35 + Math.pow(random(), 2) * 2.15;
      context.beginPath();
      context.moveTo(
        x + directionX * start,
        y + directionY * start,
      );
      context.quadraticCurveTo(
        x +
          directionX * length * 0.54 +
          perpendicularX * bend,
        y +
          directionY * length * 0.54 +
          perpendicularY * bend,
        x + directionX * length + perpendicularX * endBend,
        y + directionY * length + perpendicularY * endBend,
      );
      context.stroke();
    }
    context.restore();

    drawCrater(
      context,
      'moon',
      x,
      y,
      4 + random() * 6,
      9137 + systemIndex * 101,
    );
  }
}

function paintFineGrain(
  context: CanvasRenderingContext2D,
  style: SurfaceStyle,
  width: number,
  height: number,
  random: () => number,
) {
  const count = style === 'moon' ? 7200 : style === 'mars' ? 5200 : 3300;
  const light: Rgb =
    style === 'moon'
      ? [220, 221, 215]
      : style === 'mars'
        ? [219, 172, 127]
        : [235, 225, 207];
  const dark: Rgb =
    style === 'moon'
      ? [43, 47, 48]
      : style === 'mars'
        ? [63, 38, 28]
        : [49, 47, 43];

  context.save();
  for (let index = 0; index < count; index += 1) {
    const size = 0.35 + random() * (style === 'moon' ? 1.05 : 0.9);
    context.fillStyle = rgba(
      random() > 0.5 ? light : dark,
      0.012 + random() * (style === 'moon' ? 0.055 : 0.04),
    );
    context.fillRect(random() * width, random() * height, size, size);
  }
  context.restore();
}

function loadImage(source: string) {
  const cached = imageCache.get(source);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${source}`));
    image.src = source;
  });
  imageCache.set(source, promise);
  return promise;
}

function paintProceduralSurface(
  context: CanvasRenderingContext2D,
  options: TextureOptions,
) {
  const { base, dark, light, seed, style = 'generic' } = options;
  const random = seededRandom(seed);
  const width = context.canvas.width;
  const height = context.canvas.height;

  context.fillStyle = base;
  context.fillRect(0, 0, width, height);

  const field = createSurfaceField(style, seed, base, dark, light);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(field, 0, 0, width, height);

  paintPolarHaze(context, width, height, style);

  if (style === 'mars') {
    paintMarsCanyon(context, width, height);
    paintMarsDustVeils(context, width, height, random);
  }

  paintCraters(context, style, width, height, random);

  if (style === 'moon') {
    paintMoonRaySystems(context, width, height, random);
  }

  paintFineGrain(context, style, width, height, random);
  context.globalAlpha = 1;
}

function repairPolarCaps(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
) {
  const capHeight = Math.max(2, Math.round(height * 0.045));

  for (let y = capHeight - 1; y >= 0; y -= 1) {
    const mirroredY = Math.min(height - 1, capHeight * 2 - y);
    const fromOffset = mirroredY * width * 4;
    const toOffset = y * width * 4;
    pixels.copyWithin(toOffset, fromOffset, fromOffset + width * 4);
  }

  const bottomCapStart = height - capHeight;
  const bottomMirrorPivot = height - 1 - capHeight;
  for (let y = bottomCapStart; y < height; y += 1) {
    const mirroredY = clamp(bottomMirrorPivot * 2 - y, 0, height - 1);
    const fromOffset = mirroredY * width * 4;
    const toOffset = y * width * 4;
    pixels.copyWithin(toOffset, fromOffset, fromOffset + width * 4);
  }
}

function gradeSurface(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: SurfaceStyle,
) {
  let image: ImageData;
  try {
    image = context.getImageData(0, 0, width, height);
  } catch {
    return;
  }

  const grade = surfaceGrades[style];
  const pixels = image.data;
  repairPolarCaps(pixels, width, height);
  const luminance = new Float32Array(width * height);

  for (
    let index = 0, pixel = 0;
    index < pixels.length;
    index += 4, pixel += 1
  ) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const gray = red * 0.2126 + green * 0.7152 + blue * 0.0722;

    const saturatedRed = gray + (red - gray) * grade.saturation;
    const saturatedGreen = gray + (green - gray) * grade.saturation;
    const saturatedBlue = gray + (blue - gray) * grade.saturation;

    pixels[index] = clamp(
      ((saturatedRed / 255 - 0.5) * grade.contrast + 0.5) *
        255 *
        grade.redGain,
      0,
      255,
    );
    pixels[index + 1] = clamp(
      ((saturatedGreen / 255 - 0.5) * grade.contrast + 0.5) *
        255 *
        grade.greenGain,
      0,
      255,
    );
    pixels[index + 2] = clamp(
      ((saturatedBlue / 255 - 0.5) * grade.contrast + 0.5) *
        255 *
        grade.blueGain,
      0,
      255,
    );
    luminance[pixel] =
      (pixels[index] * 0.2126 +
        pixels[index + 1] * 0.7152 +
        pixels[index + 2] * 0.0722) /
      255;
  }

  const sample = (x: number, y: number) => {
    const wrappedX = ((x % width) + width) % width;
    const clampedY = clamp(y, 0, height - 1);
    return luminance[clampedY * width + wrappedX];
  };

  for (let y = 0; y < height; y += 1) {
    const polarFade =
      clamp(y / Math.max(1, height * 0.055), 0, 1) *
      clamp((height - 1 - y) / Math.max(1, height * 0.055), 0, 1);
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      const localAverage =
        (sample(x - 2, y) +
          sample(x + 2, y) +
          sample(x, y - 2) +
          sample(x, y + 2)) /
        4;
      const detail =
        (luminance[pixel] - localAverage) * grade.detail * 255 * polarFade;
      const offset = pixel * 4;
      pixels[offset] = clamp(pixels[offset] + detail, 0, 255);
      pixels[offset + 1] = clamp(pixels[offset + 1] + detail, 0, 255);
      pixels[offset + 2] = clamp(pixels[offset + 2] + detail, 0, 255);
    }
  }

  context.putImageData(image, 0, 0);
}

function loadOfficialSurface(
  source: string,
  context: CanvasRenderingContext2D,
  texture: THREE.CanvasTexture,
  style: SurfaceStyle,
) {
  if (typeof Image === 'undefined') return;

  void loadImage(source)
    .then((image) => {
      const width = context.canvas.width;
      const height = context.canvas.height;
      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      gradeSurface(context, width, height, style);
      texture.needsUpdate = true;
    })
    .catch(() => {
      // The procedural surface remains available if the local asset fails.
    });
}

export function createPlanetTexture({
  base,
  dark,
  light,
  seed,
  source,
  style = 'generic',
}: TextureOptions) {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return new THREE.CanvasTexture(canvas);

  paintProceduralSurface(context, {
    base,
    dark,
    light,
    seed,
    style,
    source,
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  if (source) loadOfficialSurface(source, context, texture, style);

  return texture;
}

export const marsTexture = () =>
  createPlanetTexture({
    base: '#975d3f',
    dark: '#33231e',
    light: '#d0a077',
    seed: 42,
    source: '/assets/maps/mars-texture-nasa.jpg',
    style: 'mars',
  });

export const moonTexture = () =>
  createPlanetTexture({
    base: '#858785',
    dark: '#2f3334',
    light: '#d2d3cf',
    seed: 13,
    source: '/assets/planets/moon-solarsystemscope.jpg',
    style: 'moon',
  });

