import type { CSSProperties } from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {
  ECHOS_30_CAPTIONS,
  findEchos30Caption,
} from './data/echos30Captions';
import './styles.css';
import './echos30.css';

export const ECHOS_30_FPS = 30;
export const ECHOS_30_WIDTH = 1920;
export const ECHOS_30_HEIGHT = 1080;
export const ECHOS_30_TOTAL_FRAMES = 900;

const clampOptions = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

type ShotKind =
  | 'hook'
  | 'archive'
  | 'ignition'
  | 'orbit'
  | 'worlds'
  | 'mars'
  | 'longevity'
  | 'traverse'
  | 'last-signal'
  | 'remains'
  | 'questions'
  | 'moon'
  | 'closing';

interface Shot {
  id: string;
  src: string;
  from: number;
  duration: number;
  kind: ShotKind;
  fromScale: number;
  toScale: number;
  fromX: number;
  toX: number;
  fromY: number;
  toY: number;
}

const SHOTS: readonly Shot[] = [
  {
    id: 'opening',
    src: 'reel/echos-en-v2/01-opening.png',
    from: 0,
    duration: 118,
    kind: 'hook',
    fromScale: 1.015,
    toScale: 1.075,
    fromX: 0,
    toX: -10,
    fromY: 0,
    toY: 4,
  },
  {
    id: 'technical-one',
    src: 'reel/echos-en-v2/12-teardown-01.png',
    from: 110,
    duration: 86,
    kind: 'archive',
    fromScale: 1.05,
    toScale: 1.095,
    fromX: -12,
    toX: 10,
    fromY: 0,
    toY: -4,
  },
  {
    id: 'technical-two',
    src: 'reel/echos-en-v2/12-teardown-04.png',
    from: 188,
    duration: 70,
    kind: 'archive',
    fromScale: 1.085,
    toScale: 1.045,
    fromX: 14,
    toX: -8,
    fromY: -4,
    toY: 2,
  },
  {
    id: 'ignition',
    src: 'reel/echos-en-v2/03-ignition.png',
    from: 248,
    duration: 78,
    kind: 'ignition',
    fromScale: 1.02,
    toScale: 1.075,
    fromX: 0,
    toX: -10,
    fromY: -2,
    toY: 0,
  },
  {
    id: 'orbit-arrival',
    src: 'reel/echos-en-v2/04-orbit-arrival.png',
    from: 316,
    duration: 60,
    kind: 'orbit',
    fromScale: 1.015,
    toScale: 1.065,
    fromX: 0,
    toX: -8,
    fromY: 0,
    toY: -2,
  },
  {
    id: 'orbit-system',
    src: 'reel/echos-en-v2/05-orbit-system.png',
    from: 366,
    duration: 58,
    kind: 'orbit',
    fromScale: 1.035,
    toScale: 1.075,
    fromX: -4,
    toX: -16,
    fromY: 0,
    toY: -3,
  },
  {
    id: 'world-cards',
    src: 'reel/echos-en-v2/07-world-cards-focus.png',
    from: 414,
    duration: 50,
    kind: 'worlds',
    fromScale: 1.015,
    toScale: 1.06,
    fromX: 0,
    toX: 8,
    fromY: 0,
    toY: -2,
  },
  {
    id: 'mars-hero',
    src: 'reel/echos-en-v2/08-mars-hero.png',
    from: 459,
    duration: 39,
    kind: 'mars',
    fromScale: 1.02,
    toScale: 1.065,
    fromX: 0,
    toX: -8,
    fromY: 0,
    toY: 2,
  },
  {
    id: 'fourteen-years',
    src: 'reel/echos-en-v2/09-mars-90-days.png',
    from: 478,
    duration: 17,
    kind: 'longevity',
    fromScale: 1.035,
    toScale: 1.075,
    fromX: -5,
    toX: 9,
    fromY: 0,
    toY: -2,
  },
  {
    id: 'traverse',
    src: 'assets/maps/opportunity-traverse-nasa.jpg',
    from: 490,
    duration: 46,
    kind: 'traverse',
    fromScale: 1.04,
    toScale: 1.09,
    fromX: 8,
    toX: -8,
    fromY: 2,
    toY: -2,
  },
  {
    id: 'last-signal',
    src: 'reel/echos-en-v2/10-mars-distance.png',
    from: 530,
    duration: 40,
    kind: 'last-signal',
    fromScale: 1.02,
    toScale: 1.06,
    fromX: 0,
    toX: -8,
    fromY: 0,
    toY: 1,
  },
  {
    id: 'remains',
    src: 'reel/echos-en-v2/11-mars-last-signal.png',
    from: 565,
    duration: 69,
    kind: 'remains',
    fromScale: 1.025,
    toScale: 1.075,
    fromX: -4,
    toX: 7,
    fromY: 0,
    toY: -2,
  },
  {
    id: 'questions',
    src: 'reel/echos-en-v2/12-teardown-02.png',
    from: 629,
    duration: 57,
    kind: 'questions',
    fromScale: 1.04,
    toScale: 1.09,
    fromX: -8,
    toX: 8,
    fromY: 0,
    toY: -2,
  },
  {
    id: 'moon',
    src: 'reel/echos-en-v2/16-moon-ice.png',
    from: 681,
    duration: 133,
    kind: 'moon',
    fromScale: 1.015,
    toScale: 1.06,
    fromX: 0,
    toX: -7,
    fromY: 0,
    toY: -1,
  },
  {
    id: 'closing',
    src: 'reel/echos-en-v2/01-opening.png',
    from: 810,
    duration: 90,
    kind: 'closing',
    fromScale: 1.075,
    toScale: 1.02,
    fromX: -8,
    toX: 0,
    fromY: 3,
    toY: 0,
  },
];

const CHAPTERS = [
  { from: 0, number: '01', label: 'The last signal' },
  { from: 120, number: '02', label: 'The archive' },
  { from: 240, number: '03', label: 'The experience' },
  { from: 342, number: '04', label: 'Explore' },
  { from: 447, number: '05', label: 'Transformation' },
  { from: 579, number: '06', label: 'The question' },
  { from: 660, number: '07', label: 'Classrooms' },
  { from: 726, number: '08', label: 'Next world' },
  { from: 813, number: '09', label: 'The light' },
] as const;

function fade(
  frame: number,
  start: number,
  end: number,
  fadeFrames = 9,
) {
  return interpolate(
    frame,
    [start, start + fadeFrames, end - fadeFrames, end],
    [0, 1, 1, 0],
    {
      ...clampOptions,
      easing: Easing.inOut(Easing.cubic),
    },
  );
}

function ShotLayer({ shot }: { shot: Shot }) {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [0, shot.duration - 1],
    [0, 1],
    clampOptions,
  );
  const opacity =
    shot.from === 0
      ? interpolate(frame, [shot.duration - 5, shot.duration], [1, 0], clampOptions)
      : fade(frame, 0, shot.duration, 5);
  const scale = interpolate(progress, [0, 1], [shot.fromScale, shot.toScale]);
  const translateX = interpolate(progress, [0, 1], [shot.fromX, shot.toX]);
  const translateY = interpolate(progress, [0, 1], [shot.fromY, shot.toY]);

  return (
    <AbsoluteFill className="e30-shot" style={{ opacity }}>
      <Img
        className="e30-shot__image"
        src={staticFile(shot.src)}
        style={
          {
            transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
          } as CSSProperties
        }
      />
      <div
        className={[
          'e30-shot__scrim',
          shot.kind === 'archive' || shot.kind === 'questions'
            ? 'is-technical'
            : '',
          shot.kind === 'ignition' ||
          shot.kind === 'traverse' ||
          shot.kind === 'moon'
            ? 'is-cinematic'
            : '',
        ].join(' ')}
        aria-hidden="true"
      />
    </AbsoluteFill>
  );
}

function SolutionOverlay() {
  const frame = useCurrentFrame();
  const opacity = fade(frame, 2, 76, 10);
  const lift = interpolate(frame, [0, 22], [22, 0], clampOptions);
  return (
    <div
      className="e30-solution-title"
      style={{ opacity, transform: `translateY(${lift}px)` }}
    >
      <div className="e30-solution-title__kicker">
        A NASA open-data experience
      </div>
      <h1>
        Abandoned,
        <br />
        but not forgotten.
      </h1>
      <p>
        An archive becomes a world.
        <br />
        A child can explore it alone.
      </p>
    </div>
  );
}

function ArchiveBadges() {
  const frame = useCurrentFrame();
  const labels = ['Mission data', 'Instruments', 'Sol 5111'];
  return (
    <div className="e30-badges">
      {labels.map((label, index) => {
        const start = 8 + index * 8;
        const opacity = interpolate(frame, [start, start + 10], [0, 1], clampOptions);
        const x = interpolate(frame, [start, start + 10], [18, 0], clampOptions);
        return (
          <span key={label} style={{ opacity, transform: `translateX(${x}px)` }}>
            {label}
          </span>
        );
      })}
    </div>
  );
}

function Breadcrumb() {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], clampOptions);
  return (
    <div className="e30-breadcrumb" style={{ opacity }}>
      <b>Orbit</b>
      <i />
      <b>Mars</b>
      <i />
      <span>Opportunity</span>
    </div>
  );
}

function DistanceOverlay() {
  const frame = useCurrentFrame();
  const opacity = fade(frame, 2, 60, 8);
  const reveal = interpolate(frame, [0, 19], [0, 1], {
    ...clampOptions,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      className="e30-distance"
      style={{ opacity, transform: `translateY(${(1 - reveal) * 20}px)` }}
    >
      <div className="e30-distance__label">Opportunity traverse</div>
      <strong>
        45.16<span>km</span>
      </strong>
      <div className="e30-distance__meta">2004 — 2018 · NASA/JPL-Caltech</div>
    </div>
  );
}

function SignalTag() {
  const frame = useCurrentFrame();
  const opacity = fade(frame, 2, 50, 8);
  return (
    <div className="e30-signal-tag" style={{ opacity }}>
      <strong>Last dataset</strong>
      <span>June 10, 2018 · Sol 5111</span>
    </div>
  );
}

function QuestionStack() {
  const frame = useCurrentFrame();
  const words = ['Observe', 'Compare', 'Ask'];
  return (
    <div className="e30-question-stack">
      {words.map((word, index) => {
        const start = 5 + index * 11;
        const opacity = interpolate(frame, [start, start + 10], [0, 1], clampOptions);
        const x = interpolate(frame, [start, start + 10], [-30, 0], clampOptions);
        return (
          <span key={word} style={{ opacity, transform: `translateX(${x}px)` }}>
            {word}
          </span>
        );
      })}
    </div>
  );
}

function WorldTag() {
  const frame = useCurrentFrame();
  const opacity = fade(frame, 3, 58, 8);
  return (
    <div className="e30-world-tag" style={{ opacity }}>
      <span>Next world</span>
      <strong>Moon</strong>
    </div>
  );
}

function ShotOverlay({ shot }: { shot: Shot }) {
  switch (shot.kind) {
    case 'archive':
      return <ArchiveBadges />;
    case 'ignition':
      return <SolutionOverlay />;
    case 'orbit':
    case 'worlds':
      return <Breadcrumb />;
    case 'traverse':
      return <DistanceOverlay />;
    case 'last-signal':
      return <SignalTag />;
    case 'questions':
      return <QuestionStack />;
    case 'moon':
      return <WorldTag />;
    default:
      return null;
  }
}

function CaptionTrack() {
  const frame = useCurrentFrame();
  const cue = findEchos30Caption(frame);
  if (!cue) return null;

  const localFrame = frame - cue.startFrame;
  const duration = cue.endFrame - cue.startFrame;
  const opacity = interpolate(
    localFrame,
    [0, 6, duration - 6, duration],
    [0, 1, 1, 0],
    clampOptions,
  );
  const translateY = interpolate(
    localFrame,
    [0, 9],
    [9, 0],
    clampOptions,
  );

  return (
    <AbsoluteFill className="e30-caption-layer">
      <div className="e30-caption-gradient" aria-hidden="true" />
      <div className="e30-caption">
        <div
          className="e30-caption__cue"
          style={{ opacity, transform: `translateY(${translateY}px)` }}
        >
          {cue.text}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function PersistentChrome() {
  const frame = useCurrentFrame();
  const chapter = [...CHAPTERS]
    .reverse()
    .find((item) => frame >= item.from);
  const progress = (frame / (ECHOS_30_TOTAL_FRAMES - 1)) * 100;
  const closingFrame = frame >= 813;
  const chapterOpacity = closingFrame ? 0 : 0.94;
  const signatureOpacity = interpolate(
    frame,
    [842, 858],
    [0, 1],
    clampOptions,
  );

  return (
    <>
      <div className="e30-progress" style={{ width: `${progress}%` }} />
      <div className="e30-chapter" style={{ opacity: chapterOpacity }}>
        <b>{chapter?.number ?? '01'}</b>
        <span>{chapter?.label ?? 'The last signal'}</span>
      </div>
      <div className="e30-credit">NASA / JPL-Caltech mission imagery</div>
      {closingFrame ? (
        <div className="e30-signature" style={{ opacity: signatureOpacity }}>
          <span>
            ECHOES · <b>Abandoned, but not forgotten.</b>
          </span>
        </div>
      ) : null}
    </>
  );
}

export function Echos30En() {
  return (
    <AbsoluteFill className="e30-root">
      <AbsoluteFill style={{ background: '#02070d' }} />
      {SHOTS.map((shot) => (
        <Sequence
          key={shot.id}
          from={shot.from}
          durationInFrames={shot.duration}
          name={shot.id}
        >
          <ShotLayer shot={shot} />
          <ShotOverlay shot={shot} />
        </Sequence>
      ))}
      <AbsoluteFill className="e30-atmosphere" aria-hidden="true" />
      <AbsoluteFill className="e30-grain" aria-hidden="true" />
      <PersistentChrome />
      <CaptionTrack />
    </AbsoluteFill>
  );
}
