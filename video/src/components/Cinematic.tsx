import type { CSSProperties, ReactNode } from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import { FILM_ASSETS } from '../data/assets';

const clampOptions = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function easeOut(
  frame: number,
  input: readonly [number, number],
  output: readonly [number, number] = [0, 1],
) {
  return interpolate(frame, input, output, {
    ...clampOptions,
    easing: Easing.out(Easing.cubic),
  });
}

export function easeInOut(
  frame: number,
  input: readonly [number, number],
  output: readonly [number, number] = [0, 1],
) {
  return interpolate(frame, input, output, {
    ...clampOptions,
    easing: Easing.inOut(Easing.cubic),
  });
}

export function fadeWindow(
  frame: number,
  start: number,
  end: number,
  fadeFrames = 14,
) {
  return interpolate(
    frame,
    [start, start + fadeFrames, end - fadeFrames, end],
    [0, 1, 1, 0],
    clampOptions,
  );
}

export function SceneCanvas({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <AbsoluteFill className={`cine-scene ${className}`} style={style}>
      {children}
      <div className="cine-scene__vignette" aria-hidden="true" />
      <div className="cine-scene__grain" aria-hidden="true" />
    </AbsoluteFill>
  );
}

const STARS = Array.from({ length: 170 }, (_, index) => ({
  left: (index * 47.73 + 11) % 100,
  top: (index * 71.19 + 3) % 100,
  size: index % 17 === 0 ? 3.2 : index % 5 === 0 ? 2.2 : 1.2,
  phase: index * 0.73,
  warmth: index % 9 === 0,
}));

export function StarField({
  density = 1,
  speed = 0.012,
  className = '',
}: {
  density?: number;
  speed?: number;
  className?: string;
}) {
  const frame = useCurrentFrame();
  const visibleStars = STARS.slice(0, Math.round(STARS.length * density));

  return (
    <div className={`cine-stars ${className}`} aria-hidden="true">
      {visibleStars.map((star, index) => {
        const pulse = 0.45 + Math.sin(frame * speed + star.phase) * 0.3;
        return (
          <i
            key={index}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              opacity: Math.max(0.12, pulse),
              background: star.warmth ? 'var(--gold)' : '#f6f1e8',
            }}
          />
        );
      })}
    </div>
  );
}

const DUST = Array.from({ length: 48 }, (_, index) => ({
  left: (index * 29.31 + 7) % 100,
  top: (index * 53.17 + 5) % 100,
  size: 2 + (index % 8) * 1.8,
  phase: index * 1.37,
}));

export function DustField({ intensity = 1 }: { intensity?: number }) {
  const frame = useCurrentFrame();
  return (
    <div className="cine-dust" aria-hidden="true">
      {DUST.map((particle, index) => {
        const drift = (frame * (0.13 + (index % 4) * 0.02) + particle.phase * 12) % 110;
        return (
          <i
            key={index}
            style={{
              left: `${(particle.left + drift * 0.18) % 100}%`,
              top: `${(particle.top - drift * 0.28 + 110) % 100}%`,
              width: particle.size,
              height: particle.size,
              opacity: Math.min(0.7, (0.18 + (index % 7) * 0.06) * intensity),
            }}
          />
        );
      })}
    </div>
  );
}

export function Headline({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`cine-headline ${className}`} style={style}>
      {children}
    </div>
  );
}

export function ScreenKicker({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`cine-kicker ${className}`} style={style}>
      {children}
    </div>
  );
}

export function SignalLine({
  frame,
  start = 0,
  duration = 60,
  className = '',
}: {
  frame: number;
  start?: number;
  duration?: number;
  className?: string;
}) {
  const progress = easeInOut(frame, [start, start + duration]);
  return (
    <div className={`cine-signal-line ${className}`} aria-hidden="true">
      <i style={{ transform: `scaleX(${progress})` }} />
      <b style={{ left: `${progress * 100}%`, opacity: progress > 0.02 ? 1 : 0 }} />
    </div>
  );
}

export function ChildSilhouette({
  className = '',
  style,
  rim = true,
}: {
  className?: string;
  style?: CSSProperties;
  rim?: boolean;
}) {
  return (
    <svg
      className={`cine-child ${className}`}
      style={style}
      viewBox="0 0 520 900"
      role="img"
      aria-label="Ilustração de uma criança curiosa observando o céu"
    >
      <defs>
        <linearGradient id="childBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#111921" />
          <stop offset="0.72" stopColor="#070a0d" />
          <stop offset="1" stopColor="#030506" />
        </linearGradient>
        <linearGradient id="childRim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F2C26B" stopOpacity="0" />
          <stop offset="0.68" stopColor="#F2C26B" stopOpacity="0.05" />
          <stop offset="1" stopColor="#F2C26B" stopOpacity="0.72" />
        </linearGradient>
        <filter id="childGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="11" />
        </filter>
      </defs>
      {rim ? (
        <path
          d="M228 144c19-58 106-76 147-17 43 60 3 132-46 154l12 41 111 68c38 24 55 64 60 112l16 159-86 24-16 166H167l-14-168-75-18 13-151c6-53 25-95 67-123l108-69 13-43c-40-18-73-58-68-103 3-29 12-54 30-72z"
          fill="#F2C26B"
          opacity="0.24"
          filter="url(#childGlow)"
        />
      ) : null}
      <circle cx="302" cy="201" r="90" fill="url(#childBody)" />
      <path
        d="M239 256c-15 40-55 57-55 57l-31 203 54 18 28-151 8 127 93 11 48-133 72 138 52-28-90-212s-31-29-72-38c-49-10-107 8-107 8z"
        fill="url(#childBody)"
      />
      <path
        d="M245 260c-35 39-42 101-40 164l51 8 19-139 6-31z"
        fill="url(#childRim)"
        opacity="0.9"
      />
      <path
        d="M330 261c38 10 58 36 72 64l39 159-39 19-53-136-27-93z"
        fill="url(#childRim)"
        opacity="0.72"
      />
      <path
        d="M226 463c22 19 51 32 90 34 35 1 68-7 95-23l-17 221-65 1-6-119-10 122-78 2-27-212z"
        fill="#05080a"
      />
      <path
        d="M185 311c-72 42-103 93-123 157"
        fill="none"
        stroke="#080b0e"
        strokeWidth="50"
        strokeLinecap="round"
      />
      <path
        d="M424 320c41 36 64 77 76 122"
        fill="none"
        stroke="#080b0e"
        strokeWidth="48"
        strokeLinecap="round"
      />
      <circle cx="486" cy="435" r="24" fill="#080b0e" />
      <path
        d="M254 251c31 13 68 13 98-2l-8 43c-24 13-55 13-79-1z"
        fill="#F2C26B"
        opacity="0.15"
      />
    </svg>
  );
}

export function IllustrativeNote({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`cine-illustrative${compact ? ' is-compact' : ''}`}>
      <span aria-hidden="true" />
      situação ilustrativa
    </div>
  );
}

export function ArchiveType({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`cine-archive-type ${className}`} style={style}>
      {children}
    </div>
  );
}

type PlanetName =
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune';

interface PlanetLayout {
  name: PlanetName;
  src: string;
  left: number;
  top: number;
  size: number;
  opacity: number;
}

const PLANETS: readonly PlanetLayout[] = [
  {
    name: 'mercury',
    src: FILM_ASSETS.mercury,
    left: 735,
    top: 675,
    size: 56,
    opacity: 0.22,
  },
  {
    name: 'venus',
    src: FILM_ASSETS.venus,
    left: 870,
    top: 692,
    size: 84,
    opacity: 0.22,
  },
  {
    name: 'earth',
    src: FILM_ASSETS.earth,
    left: 1010,
    top: 638,
    size: 98,
    opacity: 0.25,
  },
  {
    name: 'moon',
    src: FILM_ASSETS.moon,
    left: 947,
    top: 492,
    size: 94,
    opacity: 1,
  },
  {
    name: 'mars',
    src: FILM_ASSETS.marsTexture,
    left: 1150,
    top: 510,
    size: 246,
    opacity: 1,
  },
  {
    name: 'jupiter',
    src: FILM_ASSETS.jupiter,
    left: 1420,
    top: 328,
    size: 208,
    opacity: 0.24,
  },
  {
    name: 'saturn',
    src: FILM_ASSETS.saturn,
    left: 1598,
    top: 190,
    size: 182,
    opacity: 0.22,
  },
  {
    name: 'uranus',
    src: FILM_ASSETS.uranus,
    left: 1590,
    top: 616,
    size: 118,
    opacity: 0.18,
  },
  {
    name: 'neptune',
    src: FILM_ASSETS.neptune,
    left: 1702,
    top: 746,
    size: 98,
    opacity: 0.14,
  },
];

export function SolarSystemStage({
  focus = null,
  zoom = 0,
  showLabels = true,
}: {
  focus?: 'mars' | 'moon' | null;
  zoom?: number;
  showLabels?: boolean;
}) {
  const frame = useCurrentFrame();
  const driftX = Math.sin(frame / 110) * 8;
  const driftY = Math.cos(frame / 128) * 5;
  const stageScale = 1 + zoom * 1.45;

  return (
    <div
      className={`cine-solar-stage${focus ? ` is-focused-${focus}` : ''}`}
      aria-label="Sistema solar ilustrado com Marte e a Lua disponíveis"
    >
      <div
        className="cine-solar-stage__world"
        style={{
          transform: `translate(${driftX}px, ${driftY}px) scale(${stageScale})`,
        }}
      >
        <div className="cine-sun" aria-hidden="true">
          <i />
        </div>
        <div className="cine-orbit-ring is-one" aria-hidden="true" />
        <div className="cine-orbit-ring is-two" aria-hidden="true" />
        <div className="cine-orbit-ring is-three" aria-hidden="true" />
        {PLANETS.map((planet) => {
          const isActive = planet.name === 'mars' || planet.name === 'moon';
          const activeScale =
            focus === planet.name ? 1.18 : isActive ? 1.04 : 1;
          const dim =
            focus && planet.name !== focus
              ? Math.max(0.07, planet.opacity * 0.3)
              : planet.opacity;
          return (
            <div
              key={planet.name}
              className={`cine-planet${isActive ? ' is-unlocked' : ''}${
                focus === planet.name ? ' is-focus' : ''
              }`}
              style={{
                left: planet.left,
                top: planet.top,
                width: planet.size,
                height: planet.size,
                opacity: dim,
                transform: `scale(${activeScale})`,
              }}
            >
              <Img
                src={planet.src}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              {planet.name === 'saturn' ? (
                <Img
                  className="cine-planet__ring"
                  src={FILM_ASSETS.saturnRing}
                />
              ) : null}
              {isActive ? <i className="cine-planet__halo" /> : null}
              {showLabels && isActive ? (
                <span className="cine-planet__label">
                  {planet.name === 'mars' ? 'Marte' : 'Lua'}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
