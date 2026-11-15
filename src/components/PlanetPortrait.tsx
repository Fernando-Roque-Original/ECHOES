import { memo, useEffect, useRef } from 'react';

type PlanetPortraitProps = {
  texture: string;
  tint?: string;
  className?: string;
  animate?: boolean;
  reducedMotion?: boolean;
  quality?: 'card' | 'hero';
};

type PortraitFrameSet = {
  frames: HTMLCanvasElement[];
  readyFrames: number;
  promise: Promise<void>;
};

type PortraitStyle = {
  saturation: number;
  contrast: number;
  brightness: number;
  detail: number;
  relief: number;
  ambient: number;
  diffuse: number;
  specular: number;
  shininess: number;
  rim: number;
  rimColor: [number, number, number];
  shadowColor: [number, number, number];
  light: [number, number, number];
};

type PortraitSource = {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  luminance: Float32Array;
  style: PortraitStyle;
};

const frameCache = new Map<string, PortraitFrameSet>();
const imageCache = new Map<string, Promise<HTMLImageElement>>();
const sourceCache = new Map<string, Promise<PortraitSource>>();

const portraitStyles = {
  mars: {
    saturation: 0.58,
    contrast: 1.16,
    brightness: 0.96,
    detail: 0.21,
    relief: 1.28,
    ambient: 0.065,
    diffuse: 1,
    specular: 0.0016,
    shininess: 24,
    rim: 0.09,
    rimColor: [170, 120, 96],
    shadowColor: [3, 6, 10],
    light: [-0.74, -0.24, 0.63],
  },
  moon: {
    saturation: 0.18,
    contrast: 1.04,
    brightness: 0.99,
    detail: 0.18,
    relief: 1.26,
    ambient: 0.06,
    diffuse: 1.02,
    specular: 0.0025,
    shininess: 10,
    rim: 0.075,
    rimColor: [145, 177, 210],
    shadowColor: [3, 7, 14],
    light: [-0.74, -0.24, 0.63],
  },
  generic: {
    saturation: 0.94,
    contrast: 1.035,
    brightness: 1.02,
    detail: 0.14,
    relief: 1.45,
    ambient: 0.075,
    diffuse: 1,
    specular: 0.012,
    shininess: 18,
    rim: 0.14,
    rimColor: [170, 188, 210],
    shadowColor: [5, 8, 13],
    light: [-0.64, -0.3, 0.71],
  },
} satisfies Record<'mars' | 'moon' | 'generic', PortraitStyle>;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalize(x: number, y: number, z: number) {
  const length = Math.hypot(x, y, z) || 1;
  return { x: x / length, y: y / length, z: z / length };
}

function loadTexture(source: string) {
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

function parseTint(tint: string): [number, number, number] {
  const value = tint.replace('#', '');
  if (value.length !== 6) return [170, 170, 170];
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function getPortraitStyle(texture: string): PortraitStyle {
  const normalized = texture.toLowerCase();
  if (normalized.includes('mars')) return portraitStyles.mars;
  if (normalized.includes('moon')) return portraitStyles.moon;
  return portraitStyles.generic;
}

function emptyPortraitSource(style: PortraitStyle): PortraitSource {
  return {
    width: 1,
    height: 1,
    pixels: new Uint8ClampedArray([92, 92, 92, 255]),
    luminance: new Float32Array([0.36]),
    style,
  };
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

function preparePortraitSource(
  image: HTMLImageElement,
  style: PortraitStyle,
): PortraitSource {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) return emptyPortraitSource(style);

  const width = Math.min(1024, sourceWidth);
  const height = Math.max(2, Math.round(width * (sourceHeight / sourceWidth)));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return emptyPortraitSource(style);

  context.drawImage(image, 0, 0, width, height);
  let imageData: ImageData;
  try {
    imageData = context.getImageData(0, 0, width, height);
  } catch {
    return emptyPortraitSource(style);
  }

  const pixels = new Uint8ClampedArray(imageData.data);
  repairPolarCaps(pixels, width, height);
  const baseLuminance = new Float32Array(width * height);
  for (
    let index = 0, pixel = 0;
    index < pixels.length;
    index += 4, pixel += 1
  ) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const gray = red * 0.2126 + green * 0.7152 + blue * 0.0722;
    const saturatedRed = gray + (red - gray) * style.saturation;
    const saturatedGreen = gray + (green - gray) * style.saturation;
    const saturatedBlue = gray + (blue - gray) * style.saturation;
    pixels[index] = clamp(
      ((saturatedRed / 255 - 0.5) * style.contrast + 0.5) *
        255 *
        style.brightness,
      0,
      255,
    );
    pixels[index + 1] = clamp(
      ((saturatedGreen / 255 - 0.5) * style.contrast + 0.5) *
        255 *
        style.brightness,
      0,
      255,
    );
    pixels[index + 2] = clamp(
      ((saturatedBlue / 255 - 0.5) * style.contrast + 0.5) *
        255 *
        style.brightness,
      0,
      255,
    );
    baseLuminance[pixel] =
      (pixels[index] * 0.2126 +
        pixels[index + 1] * 0.7152 +
        pixels[index + 2] * 0.0722) /
      255;
  }

  const sampleBase = (x: number, y: number) => {
    const wrappedX = (x + width) % width;
    const clampedY = clamp(y, 0, height - 1);
    return baseLuminance[clampedY * width + wrappedX];
  };

  for (let y = 0; y < height; y += 1) {
    const polarFade =
      clamp(y / Math.max(1, height * 0.055), 0, 1) *
      clamp((height - 1 - y) / Math.max(1, height * 0.055), 0, 1);
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      const localAverage =
        (sampleBase(x - 2, y) +
          sampleBase(x + 2, y) +
          sampleBase(x, y - 2) +
          sampleBase(x, y + 2)) /
        4;
      const detail =
        (baseLuminance[pixel] - localAverage) * style.detail * 255 * polarFade;
      const offset = pixel * 4;
      pixels[offset] = clamp(pixels[offset] + detail, 0, 255);
      pixels[offset + 1] = clamp(pixels[offset + 1] + detail, 0, 255);
      pixels[offset + 2] = clamp(pixels[offset + 2] + detail, 0, 255);
    }
  }

  const luminance = new Float32Array(width * height);
  for (
    let index = 0, pixel = 0;
    index < pixels.length;
    index += 4, pixel += 1
  ) {
    luminance[pixel] =
      (pixels[index] * 0.2126 +
        pixels[index + 1] * 0.7152 +
        pixels[index + 2] * 0.0722) /
      255;
  }

  return { width, height, pixels, luminance, style };
}

function loadPortraitSource(texture: string) {
  const cached = sourceCache.get(texture);
  if (cached) return cached;

  const style = getPortraitStyle(texture);
  const promise = loadTexture(texture).then((image) =>
    preparePortraitSource(image, style),
  );
  sourceCache.set(texture, promise);
  return promise;
}

function sampleLuminance(source: PortraitSource, x: number, y: number) {
  const wrappedX = (x + source.width) % source.width;
  const clampedY = clamp(y, 0, source.height - 1);
  return source.luminance[clampedY * source.width + wrappedX];
}

function renderFrame(
  source: PortraitSource,
  tint: string,
  size: number,
  frameIndex: number,
  frameCount: number,
) {
  const frameCanvas = document.createElement('canvas');
  frameCanvas.width = size;
  frameCanvas.height = size;
  const context = frameCanvas.getContext('2d');
  if (!context) return frameCanvas;

  const output = context.createImageData(size, size);
  const tintRgb = parseTint(tint);
  const style = source.style;
  const light = normalize(...style.light);
  const view = { x: 0, y: 0, z: 1 };
  const half = normalize(
    light.x + view.x,
    light.y + view.y,
    light.z + view.z,
  );
  const rimColor = [
    style.rimColor[0] * 0.78 + tintRgb[0] * 0.22,
    style.rimColor[1] * 0.78 + tintRgb[1] * 0.22,
    style.rimColor[2] * 0.78 + tintRgb[2] * 0.22,
  ] as const;
  const rotation = (frameIndex / frameCount) * Math.PI * 2;
  const radius = size / 2;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = (x - radius + 0.5) / radius;
      const ny = (y - radius + 0.5) / radius;
      const radial = nx * nx + ny * ny;
      const outputIndex = (y * size + x) * 4;

      if (radial > 1) {
        output.data[outputIndex + 3] = 0;
        continue;
      }

      const nz = Math.sqrt(Math.max(0, 1 - radial));
      const longitude = Math.atan2(nx, nz) + rotation;
      const latitude = Math.asin(clamp(-ny, -1, 1));
      const u = (((0.5 + longitude / (Math.PI * 2)) % 1) + 1) % 1;
      const v = clamp(0.5 - latitude / Math.PI, 0, 1);
      const textureX = Math.min(source.width - 1, Math.floor(u * source.width));
      const textureY = Math.min(
        source.height - 1,
        Math.floor(v * source.height),
      );
      const textureIndex = (textureY * source.width + textureX) * 4;

      const albedoRed = source.pixels[textureIndex] / 255;
      const albedoGreen = source.pixels[textureIndex + 1] / 255;
      const albedoBlue = source.pixels[textureIndex + 2] / 255;

      const slopeU = clamp(
        (sampleLuminance(source, textureX + 2, textureY) -
          sampleLuminance(source, textureX - 2, textureY)) *
          style.relief,
        -1.5,
        1.5,
      );
      const slopeV = clamp(
        (sampleLuminance(source, textureX, textureY + 2) -
          sampleLuminance(source, textureX, textureY - 2)) *
          style.relief,
        -1.5,
        1.5,
      );

      const tangentLength = Math.hypot(nz, nx) || 1;
      const tangentX = nz / tangentLength;
      const tangentZ = -nx / tangentLength;
      const bitangentX = -tangentZ * ny;
      const bitangentY = tangentZ * nx - tangentX * nz;
      const bitangentZ = tangentX * ny;
      const bumpedNormal = normalize(
        nx - tangentX * slopeU + bitangentX * slopeV,
        ny + bitangentY * slopeV,
        nz - tangentZ * slopeU + bitangentZ * slopeV,
      );

      const normalDotLight =
        bumpedNormal.x * light.x +
        bumpedNormal.y * light.y +
        bumpedNormal.z * light.z;
      const wrappedLight = clamp((normalDotLight + 0.07) / 1.07, 0, 1);
      const diffuse = Math.pow(wrappedLight, 1.16);
      const normalDotView = clamp(
        bumpedNormal.x * view.x +
          bumpedNormal.y * view.y +
          bumpedNormal.z * view.z,
        0,
        1,
      );
      const fresnel = Math.pow(1 - normalDotView, 4);
      const halfDotNormal = Math.max(
        0,
        bumpedNormal.x * half.x +
          bumpedNormal.y * half.y +
          bumpedNormal.z * half.z,
      );
      const specular =
        Math.pow(halfDotNormal, style.shininess) * style.specular * diffuse;
      const limbShade = 0.89 + nz * 0.11;
      const illumination =
        (style.ambient + style.diffuse * diffuse) * limbShade;
      const shadowAmount = (1 - diffuse) * 0.32;
      const rimAmount = fresnel * style.rim * (0.44 + diffuse * 0.56);
      const grain =
        (((textureX * 9277 + textureY * 4127) % 19) - 9) * 0.12;

      output.data[outputIndex] = clamp(
        albedoRed * 255 * illumination +
          specular * 255 +
          rimColor[0] * rimAmount +
          style.shadowColor[0] * shadowAmount +
          grain,
        0,
        255,
      );
      output.data[outputIndex + 1] = clamp(
        albedoGreen * 255 * illumination +
          specular * 255 +
          rimColor[1] * rimAmount +
          style.shadowColor[1] * shadowAmount +
          grain,
        0,
        255,
      );
      output.data[outputIndex + 2] = clamp(
        albedoBlue * 255 * illumination +
          specular * 255 +
          rimColor[2] * rimAmount +
          style.shadowColor[2] * shadowAmount +
          grain,
        0,
        255,
      );

      const edgeDistance = 1 - Math.sqrt(radial);
      output.data[outputIndex + 3] = clamp(edgeDistance * radius * 1.4, 0, 1) * 255;
    }
  }

  context.putImageData(output, 0, 0);
  return frameCanvas;
}

function getFrameSet(
  texture: string,
  tint: string,
  size: number,
  frameCount: number,
) {
  const key = `${texture}|${tint}|${size}|${frameCount}`;
  const cached = frameCache.get(key);
  if (cached) return cached;

  const frames: HTMLCanvasElement[] = [];
  const frameSet: PortraitFrameSet = {
    frames,
    readyFrames: 0,
    promise: Promise.resolve(),
  };
  frameSet.promise = loadPortraitSource(texture).then(async (source) => {
    for (let index = 0; index < frameCount; index += 1) {
      frames[index] = renderFrame(source, tint, size, index, frameCount);
      frameSet.readyFrames = index + 1;
      if (index < frameCount - 1) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 10);
        });
      }
    }
  });

  frameCache.set(key, frameSet);
  return frameSet;
}

export const PlanetPortrait = memo(function PlanetPortrait({
  texture,
  tint = '#d56f45',
  className = '',
  animate = false,
  reducedMotion = false,
  quality = 'card',
}: PlanetPortraitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldAnimate = animate && !reducedMotion;
  const frameCount = shouldAnimate ? (quality === 'hero' ? 16 : 18) : 1;
  const size = quality === 'hero' ? 560 : 320;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) return;

    let cancelled = false;
    let frameIndex = 0;
    let timer: number | undefined;
    let readyTimer: number | undefined;
    let observer: IntersectionObserver | undefined;
    const frameSet = getFrameSet(texture, tint, size, frameCount);

    const drawLatest = () => {
      if (cancelled) return;
      const availableFrame = Math.min(
        frameIndex,
        Math.max(0, frameSet.readyFrames - 1),
      );
      const frame = frameSet.frames[availableFrame];
      if (!frame) return false;
      context.clearRect(0, 0, size, size);
      context.drawImage(frame, 0, 0);
      return true;
    };

    const drawWhenReady = () => {
      if (cancelled || drawLatest()) {
        readyTimer = undefined;
        return;
      }
      readyTimer = window.setTimeout(drawWhenReady, 36);
    };

    const start = () => {
      if (timer !== undefined || !shouldAnimate) return;
      timer = window.setInterval(() => {
        if (frameSet.readyFrames < frameCount) return;
        frameIndex = (frameIndex + 1) % frameCount;
        drawLatest();
      }, quality === 'hero' ? 140 : 130);
    };

    const stop = () => {
      if (timer === undefined) return;
      window.clearInterval(timer);
      timer = undefined;
    };

    drawWhenReady();
    void frameSet.promise
      .then(() => {
        if (cancelled) return;
        drawLatest();
        if (typeof IntersectionObserver === 'undefined') start();
      })
      .catch(() => {
        if (!cancelled) context.clearRect(0, 0, size, size);
      });

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) start();
          else stop();
        },
        { threshold: 0.1 },
      );
      observer.observe(canvas);
    }

    return () => {
      cancelled = true;
      stop();
      if (readyTimer !== undefined) window.clearTimeout(readyTimer);
      observer?.disconnect();
    };
  }, [frameCount, quality, shouldAnimate, size, texture, tint]);

  return (
    <canvas
      ref={canvasRef}
      className={`cine-planet-portrait ${className}`.trim()}
      aria-hidden="true"
    />
  );
});
