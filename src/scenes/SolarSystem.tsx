import { Stars, useCursor, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import type { World } from '../app/queryState';
import {
  solarSystemBodies,
  type SolarSystemBody,
} from '../content/solarSystem';
import { PlanetErrorBoundary } from './PlanetErrorBoundary';

const COMPACT_BREAKPOINT = 760;
const MODEL_Y = -0.08;
const MAX_RELIEF_WIDTH = 960;
const POINTER_DEAD_ZONE = 0.045;
const ENTRY_TOTAL_DURATION = 5.6;
const ENTRY_INTERACTIVE_AT = 5.45;
const SUN_CHARGE_END = 0.34;
const SUN_COMPRESS_END = 0.44;
const SUN_FLASH_PEAK = 0.48;
const SUN_SETTLED_AT = 1.1;
const SHOCK_START = 0.44;
const SHOCK_DURATION = 0.9;
const PLANET_BIRTH_START = 0.56;
const PLANET_STAGGER = 0.09;
const BODY_FLIGHT = 1.18;
const MOON_BIRTH = 1.95;
const MOON_FLIGHT = 0.95;
const ORBIT_DRAW_DURATION = 0.34;
const ORBIT_REVEAL_PROGRESS = 0.82;
const ORBIT_CLOCK_START = 2.9;
const ORBIT_CLOCK_RAMP = 0.5;
const CAMERA_SETTLE_START = 2.55;
const CAMERA_SETTLE_END = 5.2;
const ENTRY_SCALE_START = 0.16;
const bodyTextures = solarSystemBodies.map((body) => body.texture);
const earthSpec = solarSystemBodies.find((body) => body.id === 'earth')!;
const marsSpec = solarSystemBodies.find((body) => body.id === 'mars')!;
const moonSpec = solarSystemBodies.find((body) => body.id === 'moon')!;
const saturnRingTexture = '/assets/planets/saturn-ring-solarsystemscope.png';
const milkyWayTexture = '/assets/space/milky-way-eso-4096.jpg';
const orbitRadii = [
  ...new Set(
    solarSystemBodies
      .filter((body) => body.id !== 'moon')
      .map((body) => body.orbitRadius),
  ),
];

const SILENT_RAYCAST: THREE.Object3D['raycast'] = () => undefined;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(min: number, max: number, value: number) {
  const amount = clamp01((value - min) / (max - min));
  return amount * amount * (3 - 2 * amount);
}

function mix(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function easeOutCubic(value: number) {
  const inverse = 1 - clamp01(value);
  return 1 - inverse * inverse * inverse;
}

function softenPointer(value: number) {
  const magnitude = Math.abs(value);
  if (magnitude <= POINTER_DEAD_ZONE) return 0;
  return (
    Math.sign(value) *
    clamp01((magnitude - POINTER_DEAD_ZONE) / (1 - POINTER_DEAD_ZONE))
  );
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255, 249, 221, 1)');
  gradient.addColorStop(0.12, 'rgba(255, 229, 164, 0.98)');
  gradient.addColorStop(0.3, 'rgba(255, 183, 96, 0.46)');
  gradient.addColorStop(0.58, 'rgba(214, 121, 63, 0.12)');
  gradient.addColorStop(1, 'rgba(214, 121, 63, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(225, 238, 255, 0.9)');
  gradient.addColorStop(0.55, 'rgba(158, 188, 225, 0.24)');
  gradient.addColorStop(1, 'rgba(158, 188, 225, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function getBodyPosition(spec: SolarSystemBody, time: number) {
  if (spec.id === 'moon') {
    const earthAngle = earthSpec.phase + time * earthSpec.speed;
    const moonAngle = spec.phase + time * spec.speed;
    return {
      x:
        Math.cos(earthAngle) * earthSpec.orbitRadius +
        Math.cos(moonAngle) * spec.orbitRadius,
      z:
        Math.sin(earthAngle) * earthSpec.orbitRadius +
        Math.sin(moonAngle) * spec.orbitRadius,
    };
  }

  const angle = spec.phase + time * spec.speed;
  return {
    x: Math.cos(angle) * spec.orbitRadius,
    z: Math.sin(angle) * spec.orbitRadius,
  };
}

function getBodyWorldPosition(
  spec: SolarSystemBody,
  time: number,
  output: THREE.Vector3,
) {
  const position = getBodyPosition(spec, time);
  output.set(
    position.x,
    MODEL_Y + (spec.id === 'moon' ? 0.045 : 0.025),
    position.z,
  );
  return output;
}

function configureTexture(texture: THREE.Texture, gl: THREE.WebGLRenderer) {
  const next = texture.clone();
  next.colorSpace = THREE.SRGBColorSpace;
  next.wrapS = THREE.RepeatWrapping;
  next.wrapT = THREE.ClampToEdgeWrapping;
  next.minFilter = THREE.LinearMipmapLinearFilter;
  next.magFilter = THREE.LinearFilter;
  next.anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy());
  next.needsUpdate = true;
  return next;
}

type ReliefImage = CanvasImageSource & {
  width?: number;
  height?: number;
  naturalWidth?: number;
  naturalHeight?: number;
};

function createReliefTexture(
  source: THREE.Texture,
  gl: THREE.WebGLRenderer,
) {
  if (typeof document === 'undefined') return null;

  const image = source.image as ReliefImage | undefined;
  const sourceWidth = image?.naturalWidth ?? image?.width ?? 0;
  const sourceHeight = image?.naturalHeight ?? image?.height ?? 0;
  if (!image || sourceWidth < 2 || sourceHeight < 2) return null;

  const width = Math.min(MAX_RELIEF_WIDTH, Math.round(sourceWidth));
  const height = Math.max(
    2,
    Math.round(width * (sourceHeight / sourceWidth)),
  );
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(image, 0, 0, width, height);
  let pixels: ImageData;
  try {
    pixels = context.getImageData(0, 0, width, height);
  } catch {
    return null;
  }

  const luminance = new Float32Array(width * height);
  let luminanceTotal = 0;
  for (let index = 0; index < pixels.data.length; index += 4) {
    const value =
      (pixels.data[index] * 0.2126 +
        pixels.data[index + 1] * 0.7152 +
        pixels.data[index + 2] * 0.0722) /
      255;
    luminance[index / 4] = value;
    luminanceTotal += value;
  }

  const meanLuminance = luminanceTotal / luminance.length;
  const relief = context.createImageData(width, height);
  const sample = (x: number, y: number) =>
    luminance[
      Math.max(0, Math.min(height - 1, y)) * width +
        Math.max(0, Math.min(width - 1, x))
    ];

  for (let y = 0; y < height; y += 1) {
    const normalizedY = y / Math.max(1, height - 1);
    const polarFade =
      smoothstep(0, 0.055, normalizedY) *
      (1 - smoothstep(0.945, 1, normalizedY));

    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const localAverage =
        (sample(x - 3, y) +
          sample(x + 3, y) +
          sample(x, y - 3) +
          sample(x, y + 3)) /
        4;
      const fineRelief = (luminance[index] - localAverage) * 1.28;
      const broadRelief = (luminance[index] - meanLuminance) * 0.12;
      const value = mix(
        0.5,
        clamp01(0.5 + fineRelief + broadRelief),
        polarFade,
      );
      const channel = Math.round(value * 255);
      const offset = index * 4;
      relief.data[offset] = channel;
      relief.data[offset + 1] = channel;
      relief.data[offset + 2] = channel;
      relief.data[offset + 3] = 255;
    }
  }

  context.putImageData(relief, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = Math.min(
    4,
    gl.capabilities.getMaxAnisotropy(),
  );
  texture.needsUpdate = true;
  return texture;
}

type CameraPose = {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
};

function writeCameraPose(
  compact: boolean,
  orbitProgress: number,
  output: CameraPose,
) {
  const progress = clamp01(orbitProgress);
  const approach = smoothstep(0.025, 0.68, progress);
  const orbitSweep = Math.sin(progress * Math.PI);

  output.position.set(
    mix(compact ? 0.12 : 0.3, compact ? -0.1 : -0.18, approach) +
      orbitSweep * (compact ? 0.045 : 0.12),
    mix(compact ? 7.15 : 5.55, compact ? 4.35 : 3.35, approach) -
      orbitSweep * (compact ? 0.16 : 0.22),
    mix(compact ? 15.35 : 10.15, compact ? 13.6 : 8.9, approach) -
      orbitSweep * (compact ? 0.31 : 0.5),
  );
  output.lookAt.set(
    mix(compact ? 0.01 : -0.02, compact ? -0.03 : -0.15, approach) +
      orbitSweep * (compact ? 0.018 : 0.045),
    mix(compact ? 0.1 : -0.03, compact ? -0.12 : -0.14, approach),
    mix(compact ? -0.05 : -0.02, -0.12, approach) +
      orbitSweep * 0.11,
  );
  output.fov =
    mix(compact ? 40.2 : 35.2, compact ? 38.4 : 32.8, approach) -
    orbitSweep * (compact ? 0.4 : 0.7);
}

type SceneTime = {
  current: number;
};

function SolarSceneClock({
  time,
  ignitionTime,
  reducedMotion,
  ignitionStarted,
}: {
  time: SceneTime;
  ignitionTime: SceneTime;
  reducedMotion: boolean;
  ignitionStarted: boolean;
}) {
  useFrame((_, delta) => {
    if (reducedMotion || !ignitionStarted) return;

    const ramp = smoothstep(
      0,
      1,
      clamp01(
        (ignitionTime.current - ORBIT_CLOCK_START) / ORBIT_CLOCK_RAMP,
      ),
    );
    time.current += Math.min(delta, 0.05) * ramp;
  });
  return null;
}

function IgnitionClock({
  time,
  ignitionStarted,
  instantEntry,
  onSettled,
}: {
  time: SceneTime;
  ignitionStarted: boolean;
  instantEntry: boolean;
  onSettled: () => void;
}) {
  const settled = useRef(false);
  const startedAt = useRef<number | null>(null);

  useFrame(() => {
    if (instantEntry) {
      time.current = ENTRY_TOTAL_DURATION;
    } else if (ignitionStarted) {
      startedAt.current ??= performance.now();
      time.current = Math.min(
        ENTRY_TOTAL_DURATION,
        (performance.now() - startedAt.current) / 1000,
      );
    }

    if (
      !settled.current &&
      time.current >= ENTRY_INTERACTIVE_AT - 0.001
    ) {
      settled.current = true;
      onSettled();
    }
  });

  return null;
}

function CameraRig({
  reducedMotion,
  focus,
  orbitProgress,
  time,
  ignitionTime,
  instantEntry,
}: {
  reducedMotion: boolean;
  focus: World | null;
  orbitProgress: number;
  time: SceneTime;
  ignitionTime: SceneTime;
  instantEntry: boolean;
}) {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const target = useRef<CameraPose>({
    position: new THREE.Vector3(),
    lookAt: new THREE.Vector3(),
    fov: 38,
  });
  const lookAt = useRef(new THREE.Vector3());
  const focusBody = useRef(new THREE.Vector3());
  const focusVector = useRef(new THREE.Vector3());
  const perspectiveCamera =
    camera instanceof THREE.PerspectiveCamera ? camera : null;

  useLayoutEffect(() => {
    const compact = width < COMPACT_BREAKPOINT;
    writeCameraPose(compact, orbitProgress, target.current);
    camera.position.copy(target.current.position);
    lookAt.current.copy(target.current.lookAt);
    camera.lookAt(lookAt.current);
    if (perspectiveCamera) {
      perspectiveCamera.fov = target.current.fov;
      perspectiveCamera.updateProjectionMatrix();
    }
  }, [camera, width]);

  useFrame((state, delta) => {
    const frameDelta = Math.min(delta, 0.05);
    const compact = width < COMPACT_BREAKPOINT;
    const progress = clamp01(orbitProgress);
    const focusSpec =
      focus === 'mars' ? marsSpec : focus === 'moon' ? moonSpec : null;
    const focusBlend = focusSpec
      ? smoothstep(0.12, 0.62, progress)
      : 0;
    const ignitionReveal = instantEntry
      ? 1
      : smoothstep(0.08, 1.7, ignitionTime.current);
    const cameraSettle = instantEntry
      ? 1
      : smoothstep(
          CAMERA_SETTLE_START,
          CAMERA_SETTLE_END,
          ignitionTime.current,
        );

    writeCameraPose(compact, progress, target.current);

    target.current.position.x +=
      (1 - ignitionReveal) * (compact ? -0.08 : -0.18);
    target.current.position.y +=
      (1 - ignitionReveal) * (compact ? 0.68 : 0.92);
    target.current.position.z +=
      (1 - ignitionReveal) * (compact ? 2.2 : 2.9);
    target.current.position.y +=
      (1 - cameraSettle) * (compact ? 0.34 : 0.52);
    target.current.position.z +=
      (1 - cameraSettle) * (compact ? 1.1 : 1.48);
    target.current.lookAt.y += (1 - ignitionReveal) * 0.16;
    target.current.fov += (1 - ignitionReveal) * 1.7;
    target.current.fov += (1 - cameraSettle) * (compact ? 0.7 : 1.05);

    if (focusSpec && focusBlend > 0) {
      getBodyWorldPosition(focusSpec, time.current, focusBody.current);
      focusVector.current
        .copy(focusBody.current)
        .sub(target.current.position);
      target.current.position.addScaledVector(
        focusVector.current,
        (compact ? 0.24 : 0.34) * focusBlend,
      );

      focusVector.current.copy(focusBody.current);
      focusVector.current.y += 0.02;
      target.current.lookAt.lerp(focusVector.current, focusBlend);
      target.current.fov -= (compact ? 1.2 : 2.2) * focusBlend;
    }

    if (!reducedMotion) {
      const elapsed = state.clock.elapsedTime;
      const pointerX = softenPointer(state.pointer.x);
      const pointerY = softenPointer(state.pointer.y);
      const pointerScale = compact ? 0.58 : 1;
      const pointerWeight =
        (1 - smoothstep(0.32, 0.82, progress) * 0.72) *
        mix(compact ? 0.58 : 0.48, 1, cameraSettle);
      const driftWeight = 1 - focusBlend;

      target.current.position.x +=
        pointerX * 0.042 * pointerScale * pointerWeight;
      target.current.position.y +=
        pointerY * 0.026 * pointerScale * pointerWeight +
        Math.sin(elapsed * 0.11) * 0.004 * driftWeight;
      target.current.lookAt.x +=
        pointerX * 0.012 * pointerScale * pointerWeight;
      target.current.lookAt.y +=
        pointerY * 0.008 * pointerScale * pointerWeight;

      const positionDamping = focusSpec ? 2.8 : 3.1;
      const lookDamping = focusSpec ? 2.9 : 3.2;

      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        target.current.position.x,
        positionDamping,
        frameDelta,
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        target.current.position.y,
        positionDamping,
        frameDelta,
      );
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        target.current.position.z,
        positionDamping,
        frameDelta,
      );
      lookAt.current.x = THREE.MathUtils.damp(
        lookAt.current.x,
        target.current.lookAt.x,
        lookDamping,
        frameDelta,
      );
      lookAt.current.y = THREE.MathUtils.damp(
        lookAt.current.y,
        target.current.lookAt.y,
        lookDamping,
        frameDelta,
      );
      lookAt.current.z = THREE.MathUtils.damp(
        lookAt.current.z,
        target.current.lookAt.z,
        lookDamping,
        frameDelta,
      );
      if (perspectiveCamera) {
        perspectiveCamera.fov = THREE.MathUtils.damp(
          perspectiveCamera.fov,
          target.current.fov,
          3,
          frameDelta,
        );
      }
    } else {
      camera.position.copy(target.current.position);
      lookAt.current.copy(target.current.lookAt);
      if (perspectiveCamera) {
        perspectiveCamera.fov = target.current.fov;
      }
    }

    camera.lookAt(lookAt.current);
    if (perspectiveCamera) perspectiveCamera.updateProjectionMatrix();
  });

  return null;
}

function DustField({
  reducedMotion,
  orbitProgress,
  count,
  spread,
  size,
  opacity,
  seed,
}: {
  reducedMotion: boolean;
  orbitProgress: number;
  count: number;
  spread: number;
  size: number;
  opacity: number;
  seed: number;
}) {
  const group = useRef<THREE.Group>(null);
  const positions = useMemo(() => {
    const random = createSeededRandom(seed);
    const values = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const radius = spread * (0.28 + Math.cbrt(random()) * 0.72);
      const angle = random() * Math.PI * 2;
      const vertical = (random() - 0.5) * spread * 0.48;
      const offset = index * 3;
      values[offset] = Math.cos(angle) * radius;
      values[offset + 1] = vertical;
      values[offset + 2] = Math.sin(angle) * radius;
    }

    return values;
  }, [count, seed, spread]);
  const particleTexture = useMemo(createParticleTexture, []);

  useEffect(() => () => particleTexture.dispose(), [particleTexture]);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (reducedMotion) {
      group.current.rotation.set(0, 0, 0);
      return;
    }

    const frameDelta = Math.min(delta, 0.05);
    const pointerX = softenPointer(state.pointer.x);
    const pointerY = softenPointer(state.pointer.y);
    const depth = mix(
      1,
      0.52,
      smoothstep(0.5, 0.92, orbitProgress),
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      -pointerY * 0.05 * depth,
      3,
      frameDelta,
    );
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      pointerX * 0.065 * depth,
      3,
      frameDelta,
    );
    group.current.rotation.z =
      Math.sin(state.clock.elapsedTime * 0.018) * 0.003 * depth;
  });

  return (
    <group ref={group}>
      <points frustumCulled={false} raycast={SILENT_RAYCAST}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          map={particleTexture}
          color="#b9cde7"
          size={size}
          sizeAttenuation
          transparent
          opacity={opacity}
          alphaTest={0.01}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

function ParallaxStarfield({
  reducedMotion,
  orbitProgress,
  minimal,
}: {
  reducedMotion: boolean;
  orbitProgress: number;
  minimal: boolean;
}) {
  const farLayer = useRef<THREE.Group>(null);
  const nearLayer = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!farLayer.current || !nearLayer.current) return;
    if (reducedMotion) {
      farLayer.current.rotation.set(0, 0, 0);
      nearLayer.current.rotation.set(0, 0, 0);
      return;
    }

    const frameDelta = Math.min(delta, 0.05);
    const pointerX = softenPointer(state.pointer.x);
    const pointerY = softenPointer(state.pointer.y);
    const depth = mix(
      1,
      0.55,
      smoothstep(0.5, 0.92, orbitProgress),
    );
    farLayer.current.rotation.x = THREE.MathUtils.damp(
      farLayer.current.rotation.x,
      -pointerY * 0.034 * depth,
      2.4,
      frameDelta,
    );
    farLayer.current.rotation.y = THREE.MathUtils.damp(
      farLayer.current.rotation.y,
      pointerX * 0.038 * depth,
      2.4,
      frameDelta,
    );
    nearLayer.current.rotation.x = THREE.MathUtils.damp(
      nearLayer.current.rotation.x,
      -pointerY * 0.095 * depth,
      3.6,
      frameDelta,
    );
    nearLayer.current.rotation.y = THREE.MathUtils.damp(
      nearLayer.current.rotation.y,
      pointerX * 0.115 * depth,
      3.6,
      frameDelta,
    );
    nearLayer.current.rotation.z =
      Math.sin(state.clock.elapsedTime * 0.02) * 0.004 * depth;
  });

  return (
    <>
      <group ref={farLayer}>
        <Stars
          radius={68}
          depth={42}
          count={minimal ? 360 : 640}
          factor={1.75}
          saturation={0.06}
          fade
          speed={0}
        />
      </group>
      <group ref={nearLayer}>
        <Stars
          radius={38}
          depth={18}
          count={minimal ? 100 : 190}
          factor={1.1}
          saturation={0.12}
          fade
          speed={0}
        />
      </group>
      <DustField
        reducedMotion={reducedMotion}
        orbitProgress={orbitProgress}
        count={minimal ? 130 : 270}
        spread={10}
        size={0.034}
        opacity={0.18}
        seed={9127}
      />
      <DustField
        reducedMotion={reducedMotion}
        orbitProgress={orbitProgress}
        count={minimal ? 36 : 82}
        spread={5.8}
        size={0.058}
        opacity={0.22}
        seed={431}
      />
    </>
  );
}

function PlanetAura({
  radius,
  color,
  intensity,
  minimal,
}: {
  radius: number;
  color: string;
  intensity: number;
  minimal: boolean;
}) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    }),
    [color, intensity],
  );

  return (
    <mesh
      scale={1.055}
      raycast={SILENT_RAYCAST}
      renderOrder={2}
    >
      <sphereGeometry
        args={[
          radius,
          minimal ? 24 : 48,
          minimal ? 18 : 36,
        ]}
      />
      <shaderMaterial
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vViewDirection;

          void main() {
            vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vViewDirection = normalize(-viewPosition.xyz);
            gl_Position = projectionMatrix * viewPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform float uIntensity;
          varying vec3 vNormal;
          varying vec3 vViewDirection;

          void main() {
            float facing = abs(dot(normalize(vNormal), vViewDirection));
            float rim = pow(1.0 - facing, 2.7);
            gl_FragColor = vec4(uColor, rim * uIntensity);
          }
        `}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

function Sun({
  glowTexture,
  minimal,
  ignitionTime,
  instantEntry,
}: {
  glowTexture: THREE.Texture;
  minimal: boolean;
  ignitionTime: SceneTime;
  instantEntry: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Sprite>(null);
  const outerGlow = useRef<THREE.Sprite>(null);
  const coreMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const shellMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const shockA = useRef<THREE.Mesh>(null);
  const shockB = useRef<THREE.Mesh>(null);
  const shockMaterialA = useRef<THREE.MeshBasicMaterial>(null);
  const shockMaterialB = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!group.current) return;

    const elapsed = ignitionTime.current;
    const charge = instantEntry
      ? 0
      : smoothstep(0, SUN_CHARGE_END, elapsed);
    const compression = instantEntry
      ? 0
      : smoothstep(SUN_CHARGE_END, SUN_COMPRESS_END, elapsed) *
        (1 - smoothstep(SUN_COMPRESS_END, SUN_FLASH_PEAK, elapsed));
    const release = instantEntry
      ? 1
      : easeOutCubic(
          clamp01(
            (elapsed - SUN_COMPRESS_END) /
              (SUN_FLASH_PEAK - SUN_COMPRESS_END + 0.24),
          ),
        );
    const arrived = instantEntry
      ? 1
      : smoothstep(SUN_FLASH_PEAK, SUN_SETTLED_AT, elapsed);
    const flash = instantEntry
      ? 0
      : Math.exp(
          -Math.pow((elapsed - SUN_FLASH_PEAK) / 0.065, 2),
        );

    const chargedScale = mix(ENTRY_SCALE_START, 0.52, charge);
    const compressedScale = mix(chargedScale, 0.3, compression);
    const releasedScale = mix(compressedScale, 1.08, release);
    const scale = mix(releasedScale, 1, arrived);
    group.current.scale.setScalar(scale);

    if (glow.current) {
      const glowMaterial = glow.current.material as THREE.SpriteMaterial;
      glowMaterial.opacity =
        0.92 *
        clamp01(0.12 + charge * 0.46 + release * 0.42 + flash * 0.45);
    }

    if (outerGlow.current) {
      const glowMaterial =
        outerGlow.current.material as THREE.SpriteMaterial;
      glowMaterial.opacity =
        0.16 + charge * 0.08 + release * 0.08 + flash * 0.26;
    }

    if (coreMaterial.current) {
      coreMaterial.current.color.setRGB(
        1,
        0.94 + flash * 0.06,
        0.82 + flash * 0.18,
      );
    }

    if (shellMaterial.current) {
      shellMaterial.current.opacity =
        0.16 + charge * 0.12 + flash * 0.34;
    }

    if (light.current) {
      light.current.intensity =
        15 + charge * 10 + release * 8 + flash * 42 + arrived * 2;
    }

    const shockProgress = instantEntry
      ? 1
      : clamp01((elapsed - SHOCK_START) / SHOCK_DURATION);
    const shockVisible =
      !instantEntry && elapsed >= SHOCK_START && shockProgress < 1;
    const shockScale = mix(0.26, 4.2, easeOutCubic(shockProgress));
    const shockOpacity = shockVisible
      ? Math.pow(1 - shockProgress, 1.45) * 0.72
      : 0;

    if (shockA.current && shockMaterialA.current) {
      shockA.current.scale.setScalar(shockScale);
      shockMaterialA.current.opacity = shockOpacity;
    }

    if (shockB.current && shockMaterialB.current) {
      shockB.current.scale.setScalar(shockScale * 0.82);
      shockMaterialB.current.opacity = shockOpacity * 0.56;
    }
  });

  return (
    <group ref={group}>
      <mesh raycast={SILENT_RAYCAST}>
        <sphereGeometry args={[0.32, minimal ? 40 : 64, minimal ? 32 : 64]} />
        <meshBasicMaterial
          ref={coreMaterial}
          color="#fff1c6"
          toneMapped={false}
        />
      </mesh>
      <mesh scale={1.08} raycast={SILENT_RAYCAST}>
        <sphereGeometry args={[0.32, minimal ? 28 : 48, minimal ? 24 : 48]} />
        <meshBasicMaterial
          ref={shellMaterial}
          color="#ffd082"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={light}
        position={[0, 0.08, 0]}
        intensity={27}
        distance={16}
        decay={1.9}
        color="#ffd1a1"
        castShadow={false}
      />
      <sprite
        ref={glow}
        scale={[3.25, 3.25, 1]}
        renderOrder={1}
        raycast={SILENT_RAYCAST}
      >
        <spriteMaterial
          map={glowTexture}
          transparent
          opacity={0.92}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <sprite
        ref={outerGlow}
        scale={[5.4, 5.4, 1]}
        renderOrder={0}
        raycast={SILENT_RAYCAST}
      >
        <spriteMaterial
          map={glowTexture}
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <mesh
        ref={shockA}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={3}
        raycast={SILENT_RAYCAST}
      >
        <ringGeometry args={[0.47, 0.5, minimal ? 48 : 96]} />
        <meshBasicMaterial
          ref={shockMaterialA}
          color="#ffd2a0"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh
        ref={shockB}
        rotation={[0, 0, Math.PI / 2]}
        renderOrder={3}
        raycast={SILENT_RAYCAST}
      >
        <ringGeometry args={[0.47, 0.5, minimal ? 48 : 96]} />
        <meshBasicMaterial
          ref={shockMaterialB}
          color="#ffe9c3"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function OrbitRing({
  radius,
  highlighted = false,
  minimal,
  ignitionTime,
  instantEntry,
  orbitIndex,
}: {
  radius: number;
  highlighted?: boolean;
  minimal: boolean;
  ignitionTime: SceneTime;
  instantEntry: boolean;
  orbitIndex: number;
}) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const finalOpacity = highlighted ? 0.42 : 0.16;
  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uOpacity: { value: 0 },
      uColor: {
        value: new THREE.Color(highlighted ? '#d8a474' : '#a8bfd4'),
      },
    }),
    [highlighted],
  );

  useFrame(() => {
    if (!material.current) return;

    const elapsed = ignitionTime.current;
    const revealStart = PLANET_BIRTH_START + orbitIndex * PLANET_STAGGER;
    const draw = instantEntry
      ? 1
      : easeOutCubic(
          clamp01((elapsed - revealStart) / ORBIT_DRAW_DURATION),
        );
    const finish = instantEntry
      ? 1
      : smoothstep(
          ORBIT_CLOCK_START,
          ORBIT_CLOCK_START + ORBIT_CLOCK_RAMP,
          elapsed,
        );
    const progress = mix(draw * ORBIT_REVEAL_PROGRESS, 1, finish);
    const arrivalPulse = instantEntry
      ? 0
      : Math.sin(
          clamp01(
            (elapsed - revealStart - ORBIT_DRAW_DURATION) / 0.72,
          ) * Math.PI,
        );

    material.current.uniforms.uProgress.value = progress;
    material.current.uniforms.uOpacity.value =
      finalOpacity * smoothstep(0, 0.2, progress) +
      arrivalPulse * (highlighted ? 0.09 : 0.025);
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.025, 0]}
      raycast={SILENT_RAYCAST}
    >
      <ringGeometry
        args={[
          radius - (highlighted ? 0.008 : 0.0035),
          radius + (highlighted ? 0.008 : 0.0035),
          minimal ? 128 : 220,
        ]}
      />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vLocalPosition;

          void main() {
            vLocalPosition = position.xy;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uProgress;
          uniform float uOpacity;
          uniform vec3 uColor;
          varying vec2 vLocalPosition;

          void main() {
            float angle = mod(
              atan(vLocalPosition.y, vLocalPosition.x) / 6.28318530718,
              1.0
            );

            if (angle > uProgress) discard;

            float head = smoothstep(uProgress - 0.055, uProgress, angle);
            float alpha = uOpacity * (0.82 + head * 0.7);
            vec3 color = uColor * (1.0 + head * 0.45);
            gl_FragColor = vec4(color, alpha);
          }
        `}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

function LunarOrbitPath({
  time,
  minimal,
  ignitionTime,
  instantEntry,
}: {
  time: SceneTime;
  minimal: boolean;
  ignitionTime: SceneTime;
  instantEntry: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const finalOpacity = 0.22;
  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color('#b9cce0') },
    }),
    [],
  );

  useLayoutEffect(() => {
    if (!group.current) return;
    const position = getBodyPosition(earthSpec, 0);
    group.current.position.set(position.x, 0.001, position.z);
  }, []);

  useFrame(() => {
    if (!group.current) return;
    const position = getBodyPosition(earthSpec, time.current);
    group.current.position.x = position.x;
    group.current.position.z = position.z;

    if (!material.current) return;

    const elapsed = ignitionTime.current;
    const draw = instantEntry
      ? 1
      : easeOutCubic(
          clamp01((elapsed - MOON_BIRTH) / (MOON_FLIGHT * 0.82)),
        );
    const finish = instantEntry
      ? 1
      : smoothstep(
          MOON_BIRTH + MOON_FLIGHT,
          ORBIT_CLOCK_START,
          elapsed,
        );
    const progress = mix(draw * ORBIT_REVEAL_PROGRESS, 1, finish);
    const arrivalPulse = instantEntry
      ? 0
      : Math.sin(
          clamp01(
            (elapsed - MOON_BIRTH - MOON_FLIGHT) / 0.72,
          ) * Math.PI,
        );
    material.current.uniforms.uProgress.value = progress;
    material.current.uniforms.uOpacity.value =
      finalOpacity * smoothstep(0, 0.2, progress) +
      arrivalPulse * 0.045;
  });

  return (
    <group ref={group} position={[0, 0.001, 0]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={SILENT_RAYCAST}
      >
        <ringGeometry
          args={[
            solarSystemBodies.find((body) => body.id === 'moon')!.orbitRadius -
              0.0035,
            solarSystemBodies.find((body) => body.id === 'moon')!.orbitRadius +
              0.0035,
            minimal ? 48 : 96,
          ]}
        />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={`
            varying vec2 vLocalPosition;

            void main() {
              vLocalPosition = position.xy;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uProgress;
            uniform float uOpacity;
            uniform vec3 uColor;
            varying vec2 vLocalPosition;

            void main() {
              float angle = mod(
                atan(vLocalPosition.y, vLocalPosition.x) / 6.28318530718,
                1.0
              );

              if (angle > uProgress) discard;

              float head = smoothstep(uProgress - 0.05, uProgress, angle);
              float alpha = uOpacity * (0.82 + head * 0.65);
              gl_FragColor = vec4(uColor * (1.0 + head * 0.35), alpha);
            }
          `}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function SaturnRing({
  spec,
  texture,
  minimal,
}: {
  spec: SolarSystemBody;
  texture: THREE.Texture;
  minimal: boolean;
}) {
  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uInnerRadius: { value: spec.radius * 1.34 },
      uOuterRadius: { value: spec.radius * 2.18 },
      uTint: { value: new THREE.Color(spec.tint) },
      uOpacity: { value: 0.9 },
    }),
    [spec, texture],
  );

  return (
    <mesh
      rotation={[Math.PI / 2, 0, 0.22]}
      raycast={SILENT_RAYCAST}
    >
      <ringGeometry
        args={[
          spec.radius * 1.34,
          spec.radius * 2.18,
          minimal ? 120 : 192,
        ]}
      />
      <shaderMaterial
        vertexShader={`
          uniform float uInnerRadius;
          uniform float uOuterRadius;
          varying float vRadius;

          void main() {
            vRadius = clamp(
              (length(position.xy) - uInnerRadius) /
              (uOuterRadius - uInnerRadius),
              0.0,
              1.0
            );
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D uMap;
          uniform vec3 uTint;
          uniform float uOpacity;
          varying float vRadius;

          void main() {
            vec4 band = texture2D(uMap, vec2(vRadius, 0.5));
            float luminance = dot(band.rgb, vec3(0.299, 0.587, 0.114));
            float edgeFade =
              smoothstep(0.0, 0.035, vRadius) *
              (1.0 - smoothstep(0.965, 1.0, vRadius));
            float alpha = band.a * edgeFade;

            if (band.a > 0.985) {
              alpha = (0.2 + luminance) * edgeFade;
            }

            vec3 color = mix(band.rgb, uTint, 0.16);
            gl_FragColor = vec4(color, alpha * uOpacity);
          }
        `}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function SolarBody({
  spec,
  texture,
  ringTexture,
  reducedMotion,
  focus,
  time,
  minimal,
  onSelect,
  bodyIndex,
  ignitionTime,
  instantEntry,
  entrySettled,
  selectionEnabled,
}: {
  spec: SolarSystemBody;
  texture: THREE.Texture;
  ringTexture: THREE.Texture;
  reducedMotion: boolean;
  focus: World | null;
  time: SceneTime;
  minimal: boolean;
  onSelect?: (world: World) => void;
  bodyIndex: number;
  ignitionTime: SceneTime;
  instantEntry: boolean;
  entrySettled: boolean;
  selectionEnabled: boolean;
}) {
  const orbitGroup = useRef<THREE.Group>(null);
  const entryGroup = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const gl = useThree((state) => state.gl);
  const isMars = spec.id === 'mars';
  const isMoon = spec.id === 'moon';
  const map = useMemo(
    () => configureTexture(texture, gl),
    [gl, texture],
  );
  const reliefMap = useMemo(
    () =>
      isMars || isMoon
        ? createReliefTexture(texture, gl)
        : null,
    [gl, isMars, isMoon, texture],
  );
  const world: World | null =
    spec.id === 'mars' ? 'mars' : spec.id === 'moon' ? 'moon' : null;
  const interactive = Boolean(world && onSelect);
  const isFocused = world !== null && focus === world;
  const canInteract = interactive && entrySettled && selectionEnabled;

  useCursor(canInteract && hovered);

  useEffect(
    () => () => {
      map.dispose();
      reliefMap?.dispose();
    },
    [map, reliefMap],
  );

  useLayoutEffect(() => {
    if (!orbitGroup.current || !entryGroup.current) return;
    const position = getBodyPosition(spec, 0);
    orbitGroup.current.position.set(
      position.x,
      isMoon ? 0.045 : 0.025,
      position.z,
    );
    entryGroup.current.scale.setScalar(instantEntry ? 1 : ENTRY_SCALE_START);
  }, [instantEntry, isMoon, spec]);

  useFrame((_, delta) => {
    if (!orbitGroup.current || !entryGroup.current) return;
    const frameDelta = Math.min(delta, 0.05);
    const position = getBodyPosition(spec, time.current);
    orbitGroup.current.position.x = position.x;
    orbitGroup.current.position.z = position.z;

    let entry = 1;
    let entryX = 0;
    let entryY = 0;
    let entryZ = 0;

    if (isMoon) {
      const earthCenter = getBodyPosition(earthSpec, time.current);
      const lunarX = position.x - earthCenter.x;
      const lunarZ = position.z - earthCenter.z;
      const lunarLength = Math.hypot(lunarX, lunarZ) || 1;
      const seedDistance = earthSpec.radius + spec.radius + 0.08;
      const seedX =
        earthCenter.x + (lunarX / lunarLength) * seedDistance;
      const seedZ =
        earthCenter.z + (lunarZ / lunarLength) * seedDistance;

      entry = instantEntry
        ? 1
        : clamp01(
            (ignitionTime.current - MOON_BIRTH) / MOON_FLIGHT,
          );
      const flight = easeOutCubic(entry);
      entryX = (seedX - position.x) * (1 - flight);
      entryY =
        (1 - flight) * 0.035 + Math.sin(entry * Math.PI) * 0.05;
      entryZ = (seedZ - position.z) * (1 - flight);
    } else {
      entry = instantEntry
        ? 1
        : clamp01(
            (ignitionTime.current -
              (PLANET_BIRTH_START +
                bodyIndex * PLANET_STAGGER)) /
              BODY_FLIGHT,
          );
      const radial = easeOutCubic(entry);
      const finalRadius = Math.hypot(position.x, position.z);
      const finalAngle = Math.atan2(position.z, position.x);
      const direction = Math.sign(spec.speed) || 1;
      const leadAngle = Math.min(
        0.62,
        Math.max(0.34, Math.abs(spec.speed) * BODY_FLIGHT),
      );
      const seedRadius =
        0.37 + spec.radius * 0.1 + (bodyIndex % 3) * 0.012;
      const radius = mix(seedRadius, finalRadius, radial);
      const angle =
        finalAngle -
        direction * leadAngle * (1 - entry) +
        bodyIndex * 0.13 * (1 - entry);

      entryX = Math.cos(angle) * radius - position.x;
      entryY =
        (1 - radial) * 0.18 + Math.sin(Math.PI * entry) * 0.04;
      entryZ = Math.sin(angle) * radius - position.z;
    }

    const focusScale = isFocused ? 1.16 : 1;
    const hoverScale = canInteract && hovered ? 1.06 : 1;
    const entryScale = mix(
      ENTRY_SCALE_START,
      1,
      smoothstep(0, 0.82, entry),
    );
    const targetScale =
      entryScale * focusScale * hoverScale;
    const nextScale = reducedMotion
      ? targetScale
      : THREE.MathUtils.damp(
          entryGroup.current.scale.x,
          targetScale,
          6.5,
          frameDelta,
        );
    entryGroup.current.scale.setScalar(nextScale);

    if (reducedMotion) {
      entryGroup.current.position.set(entryX, entryY, entryZ);
    } else {
      entryGroup.current.position.x = THREE.MathUtils.damp(
        entryGroup.current.position.x,
        entryX,
        9,
        frameDelta,
      );
      entryGroup.current.position.y = THREE.MathUtils.damp(
        entryGroup.current.position.y,
        entryY,
        9,
        frameDelta,
      );
      entryGroup.current.position.z = THREE.MathUtils.damp(
        entryGroup.current.position.z,
        entryZ,
        9,
        frameDelta,
      );
    }

    if (mesh.current && !reducedMotion) {
      const spin = isMoon ? 0.018 : isMars ? 0.07 : 0.045;
      mesh.current.rotation.y +=
        frameDelta * spin * (1 + (1 - entry) * 2.2);
    }
  });

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (world) onSelect?.(world);
  };

  return (
    <group ref={orbitGroup}>
      <group ref={entryGroup}>
        <mesh
          ref={mesh}
          rotation={[isMars ? 0.045 : 0.015, spec.phase * 1.15, isMars ? -0.04 : 0]}
          raycast={SILENT_RAYCAST}
        >
          <sphereGeometry
            args={[
              spec.radius,
              isMars || isMoon ? 96 : minimal ? 48 : 64,
              isMars || isMoon ? 72 : minimal ? 36 : 48,
            ]}
          />
          <meshStandardMaterial
            map={map}
            color={isMars ? '#ffffff' : isMoon ? '#dce3e8' : '#eef2f6'}
            roughness={isMars ? 0.985 : isMoon ? 0.99 : 0.94}
            metalness={0}
            bumpMap={reliefMap ?? undefined}
            bumpScale={isMars ? 0.012 : isMoon ? 0.019 : 0}
            envMapIntensity={isMars ? 0.02 : isMoon ? 0.08 : 0.08}
          />
        </mesh>

        {isMars ? (
          <PlanetAura
            radius={spec.radius}
            color="#c97858"
            intensity={0.11}
            minimal={minimal}
          />
        ) : null}

        {isMoon ? (
          <>
            <PlanetAura
              radius={spec.radius}
              color="#a9d3ff"
              intensity={0.36}
              minimal={minimal}
            />
            <pointLight
              position={[-0.2, 0.16, 0.26]}
              intensity={0.28}
              distance={1.1}
              decay={2}
              color="#8fc6ff"
            />
          </>
        ) : null}

        {spec.ringed ? (
          <SaturnRing
            spec={spec}
            texture={ringTexture}
            minimal={minimal}
          />
        ) : null}

        {canInteract ? (
          <mesh
            onClick={handleClick}
            onPointerOver={(event) => {
              event.stopPropagation();
              setHovered(true);
            }}
            onPointerOut={(event) => {
              event.stopPropagation();
              setHovered(false);
            }}
          >
            <sphereGeometry args={[spec.radius * 1.55, 16, 16]} />
            <meshBasicMaterial
              transparent
              opacity={0}
              colorWrite={false}
              depthWrite={false}
            />
          </mesh>
        ) : null}
      </group>
    </group>
  );
}

function SolarSystemModel({
  reducedMotion,
  focus,
  time,
  ignitionTime,
  instantEntry,
  entrySettled,
  minimal,
  onSelect,
  selectionEnabled,
}: {
  reducedMotion: boolean;
  focus: World | null;
  time: SceneTime;
  ignitionTime: SceneTime;
  instantEntry: boolean;
  entrySettled: boolean;
  minimal: boolean;
  onSelect?: (world: World) => void;
  selectionEnabled: boolean;
}) {
  const textures = useTexture(bodyTextures);
  const ringTexture = useTexture(saturnRingTexture);
  const glowTexture = useMemo(createGlowTexture, []);

  useEffect(() => () => glowTexture.dispose(), [glowTexture]);

  return (
    <group position={[0, MODEL_Y, 0]}>
      <Sun
        glowTexture={glowTexture}
        minimal={minimal}
        ignitionTime={ignitionTime}
        instantEntry={instantEntry}
      />

      {orbitRadii.map((radius, index) => (
        <OrbitRing
          key={radius}
          radius={radius}
          highlighted={radius === 2.18}
          minimal={minimal}
          ignitionTime={ignitionTime}
          instantEntry={instantEntry}
          orbitIndex={index}
        />
      ))}

      <LunarOrbitPath
        time={time}
        minimal={minimal}
        ignitionTime={ignitionTime}
        instantEntry={instantEntry}
      />

      {solarSystemBodies.map((body, index) => (
        <SolarBody
          key={body.id}
          spec={body}
          texture={textures[index]}
          ringTexture={ringTexture}
          reducedMotion={reducedMotion}
          focus={focus}
          time={time}
          bodyIndex={index}
          ignitionTime={ignitionTime}
          instantEntry={instantEntry}
          entrySettled={entrySettled}
          selectionEnabled={selectionEnabled}
          minimal={minimal}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

function LoadingSolarSystem() {
  return (
    <group position={[0, MODEL_Y, 0]}>
      <mesh raycast={SILENT_RAYCAST}>
        <sphereGeometry args={[0.28, 32, 24]} />
        <meshBasicMaterial color="#fff1c6" toneMapped={false} />
      </mesh>
      <mesh scale={1.45} raycast={SILENT_RAYCAST}>
        <sphereGeometry args={[0.28, 24, 18]} />
        <meshBasicMaterial
          color="#ffcf83"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 0.08, 0]} intensity={22} distance={14} />
    </group>
  );
}

function SceneReadySignal({ onReady }: { onReady?: () => void }) {
  const reported = useRef(false);

  useEffect(() => {
    if (reported.current) return;
    reported.current = true;
    onReady?.();
  }, [onReady]);

  return null;
}

export function SolarSystem({
  reducedMotion,
  focus = null,
  orbitProgress = 0,
  minimal = false,
  onSelect,
  ignitionStarted = true,
  ignitionInstant = true,
  selectionEnabled = true,
  onSceneReady,
  onSceneFallback,
  onEntrySettled,
}: {
  reducedMotion: boolean;
  focus?: World | null;
  orbitProgress?: number;
  minimal?: boolean;
  onSelect?: (world: World) => void;
  ignitionStarted?: boolean;
  ignitionInstant?: boolean;
  selectionEnabled?: boolean;
  onSceneReady?: () => void;
  onSceneFallback?: () => void;
  onEntrySettled?: () => void;
}) {
  const time = useRef<number>(0);
  const ignitionTime = useRef<number>(0);
  const instantEntry = ignitionInstant || reducedMotion;
  const [entrySettled, setEntrySettled] = useState(instantEntry);
  const handleIgnitionSettled = useCallback(() => {
    setEntrySettled(true);
    onEntrySettled?.();
  }, [onEntrySettled]);

  useEffect(() => {
    if (!instantEntry) return;
    setEntrySettled(true);
    onEntrySettled?.();
  }, [instantEntry, onEntrySettled]);

  return (
    <>
      <SolarSceneClock
        time={time}
        ignitionTime={ignitionTime}
        reducedMotion={reducedMotion}
        ignitionStarted={ignitionStarted}
      />
      <IgnitionClock
        time={ignitionTime}
        ignitionStarted={ignitionStarted}
        instantEntry={instantEntry}
        onSettled={handleIgnitionSettled}
      />
      <CameraRig
        reducedMotion={reducedMotion}
        focus={focus}
        orbitProgress={orbitProgress}
        time={time}
        ignitionTime={ignitionTime}
        instantEntry={instantEntry}
      />
      <ambientLight intensity={0.06} color="#a9bfd8" />
      <hemisphereLight args={['#cbbfae', '#000000', 0.11]} />
      <directionalLight
        position={[5, 2.4, 4.5]}
        intensity={0.6}
        color="#d5e6f8"
        castShadow={false}
      />
      <directionalLight
        position={[-5, 2.2, -4.5]}
        intensity={0.46}
        color="#83b4ff"
        castShadow={false}
      />
      <ParallaxStarfield
        reducedMotion={reducedMotion}
        orbitProgress={orbitProgress}
        minimal={minimal}
      />
      <PlanetErrorBoundary
        fallback={<LoadingSolarSystem />}
        onError={onSceneFallback}
      >
        <Suspense fallback={<LoadingSolarSystem />}>
          <SceneReadySignal onReady={onSceneReady} />
          <SolarSystemModel
            reducedMotion={reducedMotion}
            focus={focus}
            time={time}
            ignitionTime={ignitionTime}
            instantEntry={instantEntry}
            entrySettled={entrySettled}
            minimal={minimal}
            onSelect={onSelect}
            selectionEnabled={selectionEnabled}
          />
        </Suspense>
      </PlanetErrorBoundary>
    </>
  );
}

export function MilkyWayBackdrop({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
} = {}) {
  const texture = useTexture(milkyWayTexture);
  const group = useRef<THREE.Group>(null);
  const gl = useThree((state) => state.gl);
  const map = useMemo(
    () => configureTexture(texture, gl),
    [gl, texture],
  );

  useEffect(() => () => map.dispose(), [map]);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (reducedMotion) {
      group.current.rotation.set(0.08, 0.46, -0.04);
      return;
    }

    const frameDelta = Math.min(delta, 0.05);
    const pointerX = softenPointer(state.pointer.x);
    const pointerY = softenPointer(state.pointer.y);
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      0.08 - pointerY * 0.018,
      2.1,
      frameDelta,
    );
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      0.46 + pointerX * 0.022,
      2.1,
      frameDelta,
    );
    group.current.rotation.z = THREE.MathUtils.damp(
      group.current.rotation.z,
      -0.04 + pointerX * 0.01,
      2.1,
      frameDelta,
    );
  });

  return (
    <group ref={group} rotation={[0.08, 0.46, -0.04]}>
      <mesh
        scale={-1}
        frustumCulled={false}
        renderOrder={-100}
        raycast={SILENT_RAYCAST}
      >
        <sphereGeometry args={[54, 96, 64]} />
        <meshBasicMaterial
          map={map}
          side={THREE.BackSide}
          color="#b4bfce"
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

for (const texture of [
  ...bodyTextures,
  saturnRingTexture,
  milkyWayTexture,
]) {
  useTexture.preload(texture);
}
