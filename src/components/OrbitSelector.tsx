import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import type { World } from '../app/queryState';
import { solarSystemBodies } from '../content/solarSystem';
import type { OrbitCopy } from '../i18n';
import { PlanetPortrait } from './PlanetPortrait';

const CARD_MOTION_START_PROGRESS = 0.34;
const CARD_MOTION_END_PROGRESS = 0.54;
const CARD_STAGGER = 0.16;
export const CARD_REVEAL_PROGRESS = 0.48;
const PROMPT_FADE_START = 0.22;
const PROMPT_FADE_END = 0.34;
const HEADING_FADE_START = 0.38;
const HEADING_FADE_END = 0.56;
const WORLD_ORDER = ['mars', 'moon'] as const satisfies readonly World[];

type OrbitSelectorProps = {
  orbitProgress: number;
  selectedWorld: World | null;
  onSelect: (world: World) => void;
  copy: OrbitCopy;
  selectionEnabled?: boolean;
};

type OrbitWorld = {
  world: World;
  body: (typeof solarSystemBodies)[number];
};

const orbitWorlds: OrbitWorld[] = WORLD_ORDER.map((world) => {
  const body = solarSystemBodies.find((candidate) => candidate.id === world);
  if (!body) throw new Error(`Corpo celeste ausente: ${world}`);
  return { world, body };
});

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value: number) {
  return clamp(value, 0, 1);
}

function smoothstep(value: number) {
  const normalized = clamp01(value);
  return normalized * normalized * (3 - 2 * normalized);
}

function mix(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function revealAmountFor(progress: number, index: number) {
  const deckProgress = smoothstep(
    (progress - CARD_MOTION_START_PROGRESS) /
      (CARD_MOTION_END_PROGRESS - CARD_MOTION_START_PROGRESS),
  );
  const stagger = index * CARD_STAGGER;
  return smoothstep((deckProgress - stagger) / (1 - stagger));
}

export function OrbitSelector({
  orbitProgress,
  selectedWorld,
  onSelect,
  copy,
  selectionEnabled = true,
}: OrbitSelectorProps) {
  const reducedMotion = useReducedMotion() === true;
  const headingId = useId();
  const deckRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(
    selectedWorld === 'moon' ? 1 : 0,
  );
  const [deckWidth, setDeckWidth] = useState(0);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltX = useSpring(
    useTransform(pointerY, [-1, 1], [2.2, -2.2]),
    { stiffness: 95, damping: 24, mass: 0.8 },
  );
  const tiltY = useSpring(
    useTransform(pointerX, [-1, 1], [-3.2, 3.2]),
    { stiffness: 95, damping: 24, mass: 0.8 },
  );
  const glowX = useSpring(
    useTransform(pointerX, [-1, 1], [-14, 14]),
    { stiffness: 75, damping: 25, mass: 0.9 },
  );
  const glowY = useSpring(
    useTransform(pointerY, [-1, 1], [-9, 9]),
    { stiffness: 75, damping: 25, mass: 0.9 },
  );

  const progress = Number.isFinite(orbitProgress)
    ? clamp01(orbitProgress)
    : 0;
  const visualProgress = selectionEnabled ? progress : 0;
  const revealed = selectionEnabled && visualProgress >= CARD_REVEAL_PROGRESS;
  const promptFade = smoothstep(
    (visualProgress - PROMPT_FADE_START) /
      (PROMPT_FADE_END - PROMPT_FADE_START),
  );
  const promptOpacity = reducedMotion ? (revealed ? 0 : 1) : 1 - promptFade;
  const headingFade = reducedMotion
    ? revealed
      ? 1
      : 0
    : smoothstep(
        (visualProgress - HEADING_FADE_START) /
          (HEADING_FADE_END - HEADING_FADE_START),
      );

  useEffect(() => {
    setActiveIndex(selectedWorld === 'moon' ? 1 : 0);
  }, [selectedWorld]);

  useEffect(() => {
    if (selectionEnabled) return;
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY, selectionEnabled]);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;

    const updateWidth = () => {
      setDeckWidth(deck.getBoundingClientRect().width);
    };

    updateWidth();
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(updateWidth);
    observer.observe(deck);
    return () => observer.disconnect();
  }, []);

  const measuredWidth = deckWidth || 1080;
  const compact = measuredWidth < 620;
  const cardGap = compact ? 16 : 24;
  const idealCardWidth = compact
    ? clamp(measuredWidth * 0.29, 120, 142)
    : clamp(measuredWidth * 0.155, 168, 204);
  // Keep both cards side by side even on narrow screens. The active state only
  // changes depth and elevation, so hovering one card never makes the planets
  // swap lanes or pass through each other.
  const cardWidth = Math.min(
    idealCardWidth,
    Math.max(64, (measuredWidth - cardGap) / 2),
  );
  const spacing = cardWidth + cardGap;

  const activateIndex = (index: number, moveFocus = false) => {
    const nextIndex = clamp(index, 0, orbitWorlds.length - 1);
    setActiveIndex(nextIndex);
    if (moveFocus) {
      buttonRefs.current[nextIndex]?.focus({ preventScroll: true });
    }
  };

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (!selectionEnabled) return;

    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowLeft':
        nextIndex = index - 1;
        break;
      case 'ArrowRight':
        nextIndex = index + 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = orbitWorlds.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    activateIndex(nextIndex, true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !selectionEnabled) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const normalizedX =
      ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1;
    const normalizedY =
      ((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1;
    pointerX.set(clamp(normalizedX, -1, 1));
    pointerY.set(clamp(normalizedY, -1, 1));
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div className="cine-orbit__interface">
      <motion.div
        className="cine-orbit__heading"
        style={{
          opacity: 1 - headingFade,
          y: compact ? headingFade * -34 : headingFade * -48,
          scale: 1 - headingFade * 0.045,
          filter: `blur(${headingFade * 2.5}px)`,
        }}
      >
        <h2 id={headingId}>{copy.headingDefault}</h2>
      </motion.div>

      {promptOpacity > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 'clamp(76px, 13vh, 142px)',
            left: 0,
            display: 'grid',
            placeItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <motion.p
            className="cine-orbit__prompt"
            initial={
              reducedMotion ? false : { opacity: 0, y: 10, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
            }
            aria-live="polite"
            style={{
              opacity: promptOpacity,
              y: (1 - promptOpacity) * 12,
              margin: 0,
              padding: '10px 16px',
              border: '1px solid rgba(240, 223, 194, 0.24)',
              borderRadius: 999,
              background: 'rgba(4, 11, 17, 0.76)',
              boxShadow: '0 12px 38px rgba(0, 0, 0, 0.24)',
              color: 'rgba(240, 223, 194, 0.86)',
              fontFamily:
                "'Atkinson Hyperlegible', 'Atkinson Hyperlegible Next', sans-serif",
              fontSize: 'clamp(0.95rem, 1.5vw, 1.08rem)',
              letterSpacing: '0.01em',
              lineHeight: 1.25,
              textAlign: 'center',
              backdropFilter: 'blur(12px)',
              pointerEvents: 'none',
            }}
          >
            {copy.scrollHint}
          </motion.p>
        </div>
      ) : null}

      <div className="cine-orbit__fan">
        <motion.div
          className="cine-orbit__worlds"
          ref={deckRef}
          role="group"
          aria-labelledby={headingId}
          aria-hidden={!revealed}
          inert={!revealed}
          onPointerMove={selectionEnabled ? handlePointerMove : undefined}
          onPointerLeave={selectionEnabled ? resetPointer : undefined}
          style={{
            rotateX: reducedMotion || !selectionEnabled ? 0 : tiltX,
            rotateY: reducedMotion || !selectionEnabled ? 0 : tiltY,
            transformPerspective: 1200,
            pointerEvents: revealed ? 'auto' : 'none',
          }}
        >
          <motion.span
            className="cine-orbit__aura"
            aria-hidden="true"
            style={{
              x: reducedMotion || !selectionEnabled ? 0 : glowX,
              y: reducedMotion || !selectionEnabled ? 0 : glowY,
            }}
          />
          <span className="cine-orbit__axis" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>

          {orbitWorlds.map(({ world, body }, index) => {
            const laneOffset =
              index - (orbitWorlds.length - 1) / 2;
            const laneDistance = Math.abs(laneOffset);
            const isActive = index === activeIndex;
            const revealAmount = revealAmountFor(visualProgress, index);
            const targetX = laneOffset * spacing;
            const targetY =
              laneDistance * (compact ? 5 : 7) -
              (isActive ? (compact ? 5 : 8) : 0);
            const targetRotate = laneOffset * (compact ? 4 : 5);
            const targetScale = isActive
              ? compact
                ? 1.02
                : 1.025
              : compact
                ? 0.94
                : 0.95;
            const targetZ = isActive
              ? compact
                ? 20
                : 28
              : compact
                ? -8
                : -12;
            const worldName = copy.planetNames[world];
            const worldNumber = String(index + 1).padStart(2, '0');

            return (
              <motion.button
                ref={(element) => {
                  buttonRefs.current[index] = element;
                }}
                className={[
                  'cine-world-card',
                  `is-${world}`,
                  isActive ? 'is-active' : null,
                  'is-unlocked',
                ]
                  .filter(Boolean)
                  .join(' ')}
                type="button"
                key={world}
                data-slot={index}
                data-active={isActive}
                aria-pressed={isActive}
                disabled={!revealed || !selectionEnabled}
                aria-disabled={!revealed || !selectionEnabled}
                style={
                  {
                    '--planet-texture': `url("${body.texture}")`,
                    width: cardWidth,
                    zIndex: isActive ? 4 : 3,
                    pointerEvents:
                      revealed && selectionEnabled ? 'auto' : 'none',
                    cursor: selectionEnabled ? 'pointer' : 'default',
                  } as CSSProperties
                }
                initial={false}
                animate={{
                  x: mix(
                    laneOffset * (compact ? 4 : 7),
                    targetX,
                    revealAmount,
                  ),
                  y: mix(compact ? 62 : 78, targetY, revealAmount),
                  rotate: mix(
                    laneOffset * (compact ? 1.2 : 1.8),
                    targetRotate,
                    revealAmount,
                  ),
                  scale: mix(0.74, targetScale, revealAmount),
                  opacity: revealAmount * (isActive ? 1 : 0.9),
                  z: mix(0, targetZ, revealAmount),
                }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        type: 'spring',
                        stiffness: 280,
                        damping: 32,
                        mass: 0.8,
                      }
                }
                tabIndex={
                  revealed && selectionEnabled && isActive ? 0 : -1
                }
                onPointerEnter={() => {
                  if (selectionEnabled) setActiveIndex(index);
                }}
                onFocus={() => {
                  if (selectionEnabled) setActiveIndex(index);
                }}
                onKeyDown={(event) => handleCardKeyDown(event, index)}
                onClick={() => {
                  if (!revealed || !selectionEnabled) return;
                  setActiveIndex(index);
                  onSelect(world);
                }}
              >
                <span className="cine-world-card__surface">
                  <span className="sr-only">{copy.explorePrefix}</span>{' '}
                  <span
                    className="cine-world-card__grid"
                    aria-hidden="true"
                  />
                  <span className="cine-world-card__index">
                    {worldNumber}
                  </span>{' '}
                  <span className="cine-world-card__orb">
                    <span
                      className="cine-world-card__ring"
                      aria-hidden="true"
                    />
                    <motion.span
                      className="cine-world-card__haze"
                      aria-hidden="true"
                      animate={
                        isActive && !reducedMotion
                          ? {
                              opacity: [0.5, 0.9, 0.5],
                              scale: [0.94, 1.07, 0.94],
                            }
                          : {
                              opacity: isActive ? 0.7 : 0.28,
                              scale: 1,
                            }
                      }
                      transition={
                        reducedMotion
                          ? { duration: 0 }
                          : {
                              duration: 4.8,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }
                      }
                    />
                    <PlanetPortrait
                      texture={body.texture}
                      tint={body.tint}
                      className="cine-world-card__planet"
                      animate={isActive && !reducedMotion}
                      reducedMotion={reducedMotion}
                      quality="card"
                    />
                  </span>
                  <span className="cine-world-card__copy">
                    <span className="cine-world-card__name">{worldName}</span>
                  </span>
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
