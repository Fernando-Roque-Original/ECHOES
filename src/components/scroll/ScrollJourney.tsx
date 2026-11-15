import { ArrowLeft, ChevronDown } from 'lucide-react';
import {
  type CSSProperties,
  type ReactNode,
  useMemo,
  useRef,
} from 'react';
import type { Journey, JourneyBeat, Locale } from '../../i18n';
import { getQuiz } from '../../i18n';
import { useSectionProgress } from '../../experience/scrollProgress';
import {
  getScienceLensContent,
  getScienceLensState,
} from '../../content/scienceLens';
import LunarModuleTeardown from '../LunarModuleTeardown';
import { PlanetPortrait } from '../PlanetPortrait';
import RoverTeardown from '../RoverTeardown';
import { PlanetErrorBoundary } from '../../scenes/PlanetErrorBoundary';
import { MoonGlobe } from './MoonGlobe';
import { PlanetGlobe } from './PlanetGlobe';
import { ScienceLens } from './ScienceLens';
import { WorldQuiz } from './WorldQuiz';

export const DEFAULT_JOURNEY_BEAT_SPAN = 1;
export const TEARDOWN_JOURNEY_BEAT_SPAN = 2.4;

const MARS_GLOBE = {
  texture: '/assets/maps/mars-viking-mdim-color-2k.jpg',
  normalMap: '/assets/maps/mars-viking-mdim-normal-1k.jpg',
  roughnessMap: '/assets/maps/mars-viking-mdim-roughness-1k.jpg',
  tint: '#d56f45',
} as const;

const MOON_GLOBE = {
  texture: '/assets/planets/moon-solarsystemscope.jpg',
  tint: '#cfd2cd',
} as const;

export type JourneyBeatRange = {
  index: number;
  span: number;
  start: number;
  end: number;
};

export type JourneyBeatLayout = {
  totalSpan: number;
  ranges: JourneyBeatRange[];
};

type ScrollJourneyProps = {
  journey: Journey;
  locale: Locale;
  reducedMotion: boolean;
  onExit: () => void;
  onFinish: () => void;
  children?: ReactNode;
};

function clampProgress(progress: number) {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(1, Math.max(0, progress));
}

function smoothstep(start: number, end: number, value: number) {
  if (end === start) return value >= end ? 1 : 0;
  const normalized = clampProgress((value - start) / (end - start));
  return normalized * normalized * (3 - 2 * normalized);
}

function isTeardownVisual(visual: JourneyBeat['visual']) {
  return visual === 'teardown' || visual === 'lunar-teardown';
}

export function getJourneyBeatSpan(
  beat: Pick<JourneyBeat, 'visual'>,
): number {
  return isTeardownVisual(beat.visual)
    ? TEARDOWN_JOURNEY_BEAT_SPAN
    : DEFAULT_JOURNEY_BEAT_SPAN;
}

/**
 * Allocates scroll distance by beat instead of assuming every beat receives
 * the same amount of the section. The returned starts and ends are normalized
 * to the full weighted journey.
 */
export function createJourneyBeatLayout(
  beats: readonly Pick<JourneyBeat, 'visual'>[],
): JourneyBeatLayout {
  if (beats.length === 0) {
    return { totalSpan: 0, ranges: [] };
  }

  const spans = beats.map((beat) => {
    const span = getJourneyBeatSpan(beat);
    return Number.isFinite(span) && span > 0
      ? span
      : DEFAULT_JOURNEY_BEAT_SPAN;
  });
  const totalSpan = spans.reduce((sum, span) => sum + span, 0);
  const safeTotalSpan =
    Number.isFinite(totalSpan) && totalSpan > 0 ? totalSpan : 1;

  let cursor = 0;
  const ranges = spans.map((span, index) => {
    const startSpan = cursor;
    cursor += span;
    return {
      index,
      span,
      start: startSpan / safeTotalSpan,
      end: cursor / safeTotalSpan,
    };
  });

  return { totalSpan: cursor, ranges };
}

export function getJourneyBeatAtProgress(
  layout: JourneyBeatLayout,
  progress: number,
): JourneyBeatRange | null {
  const { ranges } = layout;
  if (ranges.length === 0) return null;

  const safeProgress = clampProgress(progress);
  return (
    ranges.find(
      (range, index) =>
        index === ranges.length - 1 || safeProgress < range.end,
    ) ?? ranges[ranges.length - 1]
  );
}

export function getJourneyBeatProgress(
  progress: number,
  range: JourneyBeatRange,
) {
  const rangeSpan = range.end - range.start;
  if (!Number.isFinite(rangeSpan) || rangeSpan <= 0) return 0;
  return clampProgress((clampProgress(progress) - range.start) / rangeSpan);
}

export function ScrollJourney({
  journey,
  locale,
  reducedMotion,
  onExit,
  onFinish,
  children,
}: ScrollJourneyProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useSectionProgress(sectionRef);
  const beats = journey.beats;
  const beatLayout = useMemo(
    () => createJourneyBeatLayout(beats),
    [beats],
  );
  const activeRange = getJourneyBeatAtProgress(beatLayout, progress);
  const activeIndex = activeRange?.index ?? 0;
  const activeBeat = beats[activeIndex];
  const style = {
    '--journey-span': Math.max(1, beatLayout.totalSpan),
    '--journey-progress': progress,
    '--journey-zoom': 1 + Math.sin(progress * Math.PI) * 0.06,
    '--atmosphere-x': `${(0.5 - progress) * 4.5}vw`,
    '--atmosphere-y': `${(progress - 0.5) * 2.5}vh`,
    '--atmosphere-rotate': `${(progress - 0.5) * 1.8}deg`,
    '--grid-x': `${(0.5 - progress) * 1.8}vw`,
  } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      id={`jornada-${journey.world}`}
      className={`cine-journey cine-journey--${journey.world}`}
      style={style}
      aria-label={journey.sectionLabel}
    >
      <div className="cine-journey__sticky">
        <div
          className={`cine-journey__atmosphere is-${
            activeBeat?.visual ?? journey.world
          }`}
          aria-hidden="true"
        />
        <div className="cine-journey__grid" aria-hidden="true" />

        <div
          className={`cine-planet-maquette is-${journey.world}`}
          aria-hidden="true"
        >
          <PlanetErrorBoundary
            fallback={
              <PlanetPortrait
                texture={
                  journey.world === 'mars'
                    ? MARS_GLOBE.texture
                    : MOON_GLOBE.texture
                }
                tint={
                  journey.world === 'mars'
                    ? MARS_GLOBE.tint
                    : MOON_GLOBE.tint
                }
                className="cine-planet-maquette__fallback"
                reducedMotion={reducedMotion}
                quality="hero"
              />
            }
          >
            {journey.world === 'mars' ? (
              <PlanetGlobe
                texturePath={MARS_GLOBE.texture}
                normalMapPath={MARS_GLOBE.normalMap}
                roughnessMapPath={MARS_GLOBE.roughnessMap}
                initialRotation={[0.08, -0.72, 0.04]}
                autoRotationSpeed={0.045}
                progress={progress}
                active
                reducedMotion={reducedMotion}
              />
            ) : (
              <MoonGlobe
                progress={progress}
                active
                reducedMotion={reducedMotion}
              />
            )}
          </PlanetErrorBoundary>
          <span className="cine-planet-maquette__rim" />
        </div>

        <button className="cine-back" type="button" onClick={onExit}>
          <ArrowLeft aria-hidden="true" size={22} />
          {journey.backToOrbit}
        </button>

        <div className="cine-journey__counter" aria-hidden="true">
          <span>{String(activeIndex + 1).padStart(2, '0')}</span>
          <i />
          <span>{String(beats.length).padStart(2, '0')}</span>
        </div>

        {beats.map((beat, index) => {
          const active = index === activeIndex;
          const isQuiz = beat.id === 'question';
          const isTeardown = isTeardownVisual(beat.visual);
          const isLunarTeardown = beat.visual === 'lunar-teardown';
          const range = beatLayout.ranges[index];
          const localProgress = getJourneyBeatProgress(
            progress,
            range,
          );
          const scienceState = isTeardown
            ? getScienceLensState(
                journey.world,
                localProgress,
                locale,
              )
            : null;
          const scienceLensContent = isTeardown
            ? getScienceLensContent(journey.world, locale)
            : null;
          const lift = Math.sin(localProgress * Math.PI);
          const kickerReveal = smoothstep(0.01, 0.16, localProgress);
          const titleReveal = smoothstep(0.04, 0.28, localProgress);
          const bodyReveal = smoothstep(0.11, 0.37, localProgress);
          const detailReveal = smoothstep(0.2, 0.47, localProgress);
          const quizReveal = smoothstep(0.26, 0.52, localProgress);
          const visualReveal = smoothstep(0.06, 0.34, localProgress);
          const beatStyle = {
            '--beat-scale': 0.986 + lift * 0.014,
            '--kicker-reveal': kickerReveal,
            '--kicker-y': `${(1 - kickerReveal) * 12}px`,
            '--kicker-blur': `${(1 - kickerReveal) * 5}px`,
            '--title-reveal': titleReveal,
            '--title-y': `${(1 - titleReveal) * 26}px`,
            '--title-blur': `${(1 - titleReveal) * 9}px`,
            '--title-clip': `inset(${(1 - titleReveal) * 100}% 0 0 0)`,
            '--body-reveal': bodyReveal,
            '--body-y': `${(1 - bodyReveal) * 20}px`,
            '--body-blur': `${(1 - bodyReveal) * 6}px`,
            '--detail-reveal': detailReveal,
            '--detail-y': `${(1 - detailReveal) * 16}px`,
            '--detail-blur': `${(1 - detailReveal) * 4}px`,
            '--quiz-reveal': quizReveal,
            '--quiz-y': `${(1 - quizReveal) * 18}px`,
            '--quiz-blur': `${(1 - quizReveal) * 5}px`,
            '--visual-reveal': visualReveal,
            '--visual-y': `${(1 - visualReveal) * 22}px`,
            '--visual-scale': 0.965 + visualReveal * 0.035,
            '--visual-blur': `${(1 - visualReveal) * 12}px`,
            '--orbit-rotation': `${-16 + localProgress * 32}deg`,
            '--science-zoom': scienceState?.zoom ?? 1,
            '--science-focus-x': `${
              scienceState?.phase.focal.x ?? 50
            }%`,
            '--science-focus-y': `${
              scienceState?.phase.focal.y ?? 50
            }%`,
          } as CSSProperties;
          return (
            <article
              className={`cine-beat${
                isTeardown ? ' cine-beat--teardown' : ''
              }${active ? ' is-active' : ''}`}
              key={beat.id}
              aria-hidden={active ? undefined : true}
              inert={active ? undefined : true}
              style={beatStyle}
            >
              <div className="cine-beat__copy">
                <p className="cine-kicker">{beat.kicker}</p>
                <h2>{beat.headline}</h2>
                <p className="cine-beat__body">{beat.body}</p>
                {beat.detail ? (
                  <p className="cine-beat__detail">{beat.detail}</p>
                ) : null}
                {isQuiz
                  ? (children ?? (
                      <WorldQuiz
                        quiz={getQuiz(journey.world, locale)}
                        onFinish={onFinish}
                      />
                    ))
                  : null}
              </div>

              <div
                className={`cine-beat__visual is-${
                  beat.visual ?? journey.world
                }`}
              >
                {isLunarTeardown ? (
                  <LunarModuleTeardown
                    reducedMotion={reducedMotion}
                    locale={locale}
                    className="cine-beat__teardown"
                    progress={localProgress}
                    active={active}
                  />
                ) : isTeardown ? (
                  <RoverTeardown
                    reducedMotion={reducedMotion}
                    locale={locale}
                    className="cine-beat__teardown"
                    progress={localProgress}
                    active={active}
                  />
                ) : beat.image ? (
                  <img
                    src={beat.image}
                    alt={beat.imageAlt ?? ''}
                    draggable={false}
                  />
                ) : (
                  <span
                    className="cine-beat__planet-anchor"
                    aria-hidden="true"
                  />
                )}
                {scienceState && scienceLensContent ? (
                  <ScienceLens
                    content={scienceLensContent}
                    state={scienceState}
                    total={scienceLensContent.phases.length}
                  />
                ) : null}
                {beat.credit ? (
                  <p className="cine-beat__credit">{beat.credit}</p>
                ) : null}
              </div>
            </article>
          );
        })}

        <div className="cine-scroll-cue" aria-hidden="true">
          <span>{journey.scrollCue}</span>
          <ChevronDown size={19} />
        </div>
      </div>
    </section>
  );
}
