import type { RoverTeardownLayerId } from './roverTeardown';

export const TEARDOWN_PHASES = [
  'assembled',
  'callouts',
  'separating',
  'inspection',
  'cutaway',
  'reassembling',
] as const;

export type TeardownPhase = (typeof TEARDOWN_PHASES)[number];

export type TeardownPhaseRange = {
  phase: TeardownPhase;
  start: number;
  end: number;
};

export const TEARDOWN_PHASE_RANGES: readonly TeardownPhaseRange[] = [
  { phase: 'assembled', start: 0, end: 0.12 },
  { phase: 'callouts', start: 0.12, end: 0.28 },
  { phase: 'separating', start: 0.28, end: 0.52 },
  { phase: 'inspection', start: 0.52, end: 0.7 },
  { phase: 'cutaway', start: 0.7, end: 0.84 },
  { phase: 'reassembling', start: 0.84, end: 1 },
];

/**
 * Interpretive visual pacing for the sourced 3D model. This order supports an
 * educational reading of the cutaway and does not encode a service procedure,
 * mechanical assembly order, or literal physical disassembly.
 */
export const TEARDOWN_FEATURED_LAYER_ORDER = [
  'solar',
  'mast',
  'instruments',
  'hardware',
  'mobility',
  'body',
] as const satisfies readonly RoverTeardownLayerId[];

export type TeardownCameraState = {
  distance: number;
  orbitDegrees: number;
  elevationDegrees: number;
};

export type TeardownTimelineState = {
  progress: number;
  phase: TeardownPhase;
  phaseProgress: number;
  separation: number;
  stagger: number;
  inspectOpacity: number;
  labelOpacity: number;
  cutawayAmount: number;
  schematicOpacity: number;
  glbOpacity: number;
  featuredLayerId: RoverTeardownLayerId;
  featuredLayerIndex: number;
  modelRotation: number;
  camera: TeardownCameraState;
};

type ScalarKeyframe = readonly [progress: number, value: number];

const separationKeyframes: readonly ScalarKeyframe[] = [
  [0, 0],
  [0.12, 0],
  [0.28, 12],
  [0.52, 74],
  [0.7, 92],
  [0.84, 100],
  [1, 0],
];

const staggerKeyframes: readonly ScalarKeyframe[] = [
  [0, 0],
  [0.12, 0],
  [0.28, 0.18],
  [0.52, 0.78],
  [0.7, 1],
  [0.84, 1],
  [1, 0],
];

const inspectOpacityKeyframes: readonly ScalarKeyframe[] = [
  [0, 0],
  [0.12, 0],
  [0.22, 0.55],
  [0.52, 0.82],
  [0.7, 1],
  [0.84, 1],
  [1, 0],
];

const labelOpacityKeyframes: readonly ScalarKeyframe[] = [
  [0, 0],
  [0.12, 0],
  [0.16, 1],
  [0.7, 1],
  [0.76, 0.35],
  [0.84, 0],
  [1, 0],
];

const cutawayKeyframes: readonly ScalarKeyframe[] = [
  [0, 0],
  [0.7, 0],
  [0.78, 1],
  [0.84, 1],
  [0.96, 0],
  [1, 0],
];

const schematicOpacityKeyframes: readonly ScalarKeyframe[] = [
  [0, 0],
  [0.72, 0],
  [0.79, 1],
  [0.84, 1],
  [0.96, 0],
  [1, 0],
];

const cameraDistanceKeyframes: readonly ScalarKeyframe[] = [
  [0, 6.45],
  [0.28, 6.9],
  [0.52, 8.1],
  [0.7, 7.6],
  [0.84, 7.15],
  [1, 6.55],
];

const cameraOrbitKeyframes: readonly ScalarKeyframe[] = [
  [0, 0],
  [0.28, 4],
  [0.52, 11],
  [0.7, 18],
  [0.84, 24],
  [1, 30],
];

const cameraElevationKeyframes: readonly ScalarKeyframe[] = [
  [0, 2.8],
  [0.28, 3.35],
  [0.52, 4.1],
  [0.7, 3.7],
  [0.84, 3.35],
  [1, 3.05],
];

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number) {
  const clamped = clamp01(value);
  return clamped * clamped * (3 - 2 * clamped);
}

function sampleKeyframes(
  progress: number,
  keyframes: readonly ScalarKeyframe[],
) {
  const first = keyframes[0];
  const last = keyframes[keyframes.length - 1];
  if (progress <= first[0]) return first[1];
  if (progress >= last[0]) return last[1];

  for (let index = 1; index < keyframes.length; index += 1) {
    const previous = keyframes[index - 1];
    const next = keyframes[index];
    if (progress > next[0]) continue;

    const span = next[0] - previous[0];
    if (span <= 0) return next[1];
    const amount = smoothstep((progress - previous[0]) / span);
    return previous[1] + (next[1] - previous[1]) * amount;
  }

  return last[1];
}

export function clampTeardownProgress(progress: number) {
  return clamp01(progress);
}

export function getTeardownPhase(progress: number): TeardownPhase {
  const clamped = clampTeardownProgress(progress);
  for (const range of TEARDOWN_PHASE_RANGES) {
    if (clamped < range.end || range.end === 1) return range.phase;
  }
  return 'reassembling';
}

export function getTeardownSeparation(progress: number) {
  return sampleKeyframes(
    clampTeardownProgress(progress),
    separationKeyframes,
  );
}

export function getTeardownFeaturedLayer(
  progress: number,
): RoverTeardownLayerId {
  const clamped = clampTeardownProgress(progress);
  if (clamped < 0.12) {
    return TEARDOWN_FEATURED_LAYER_ORDER[
      TEARDOWN_FEATURED_LAYER_ORDER.length - 1
    ];
  }

  const activeSpan = (clamped - 0.12) / (0.84 - 0.12);
  const index = Math.min(
    TEARDOWN_FEATURED_LAYER_ORDER.length - 1,
    Math.floor(activeSpan * TEARDOWN_FEATURED_LAYER_ORDER.length),
  );
  return TEARDOWN_FEATURED_LAYER_ORDER[index];
}

/**
 * Delays each layer against the shared stagger value while keeping every
 * result bounded and monotonic in the 0..1 interval.
 */
export function getTeardownLayerStaggerAmount(
  stagger: number,
  layerIndex: number,
  layerCount: number,
) {
  if (layerCount <= 1) return smoothstep(stagger);
  const normalizedIndex = clamp01(layerIndex / (layerCount - 1));
  const delay = normalizedIndex * 0.42;
  const span = 0.58;
  return smoothstep((clamp01(stagger) - delay) / span);
}

export function getTeardownTimelineState(
  progress: number,
): TeardownTimelineState {
  const clamped = clampTeardownProgress(progress);
  const phase = getTeardownPhase(clamped);
  const phaseRange =
    TEARDOWN_PHASE_RANGES.find((range) => range.phase === phase) ??
    TEARDOWN_PHASE_RANGES[TEARDOWN_PHASE_RANGES.length - 1];
  const phaseProgress = smoothstep(
    (clamped - phaseRange.start) / (phaseRange.end - phaseRange.start),
  );
  const schematicOpacity = sampleKeyframes(
    clamped,
    schematicOpacityKeyframes,
  );
  const featuredLayerId = getTeardownFeaturedLayer(clamped);

  return {
    progress: clamped,
    phase,
    phaseProgress,
    separation: getTeardownSeparation(clamped),
    stagger: sampleKeyframes(clamped, staggerKeyframes),
    inspectOpacity: sampleKeyframes(clamped, inspectOpacityKeyframes),
    labelOpacity: sampleKeyframes(clamped, labelOpacityKeyframes),
    cutawayAmount: sampleKeyframes(clamped, cutawayKeyframes),
    schematicOpacity,
    glbOpacity: 1 - schematicOpacity * 0.78,
    featuredLayerId,
    featuredLayerIndex:
      TEARDOWN_FEATURED_LAYER_ORDER.indexOf(featuredLayerId),
    modelRotation:
      (sampleKeyframes(clamped, cameraOrbitKeyframes) * Math.PI) / 720,
    camera: {
      distance: sampleKeyframes(clamped, cameraDistanceKeyframes),
      orbitDegrees: sampleKeyframes(clamped, cameraOrbitKeyframes),
      elevationDegrees: sampleKeyframes(
        clamped,
        cameraElevationKeyframes,
      ),
    },
  };
}
