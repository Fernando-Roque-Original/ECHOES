import {
  Accessibility,
  BookOpenText,
  Languages,
  Radio,
  Settings2,
} from 'lucide-react';
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { ExperienceStage } from '../components/ExperienceStage';
import { OdsBadges } from '../components/OdsBadges';
import { OrbitSelector } from '../components/OrbitSelector';
import { SettingsPanel } from '../components/SettingsPanel';
import { SourcesPanel } from '../components/SourcesPanel';
import { JourneyFinale } from '../components/scroll/JourneyFinale';
import { MarsJourney } from '../components/scroll/MarsJourney';
import { MoonJourney } from '../components/scroll/MoonJourney';
import {
  initialIgnitionState,
  isIgnitionActive,
  isSelectionEnabled,
  transitionIgnition,
} from '../experience/ignitionMachine';
import { useSectionProgress } from '../experience/scrollProgress';
import {
  getExperienceContent,
  locales,
  type Locale,
} from '../i18n';
import { useExperienceStore } from '../state/experienceStore';
import type { World } from './queryState';

const LOCALE_STORAGE_KEY = 'after-the-signal-locale';
const WORLD_TEXTURE: Record<World, string> = {
  mars: '/assets/maps/mars-texture-nasa.jpg',
  moon: '/assets/planets/moon-solarsystemscope.jpg',
};

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'pt-BR';

  try {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (storedLocale === 'pt-BR' || storedLocale === 'en') {
      return storedLocale;
    }
  } catch {
    // Storage can be unavailable in privacy modes; the default still works.
  }

  return 'pt-BR';
}

function scrollToSection(id: string, reducedMotion: boolean) {
  const element = document.getElementById(id);
  if (!element) return;
  const behavior = reducedMotion ? 'auto' : 'smooth';
  if (typeof element.scrollIntoView === 'function') {
    element.scrollIntoView({ behavior, block: 'start' });
    return;
  }
  window.scrollTo({
    top: element.getBoundingClientRect().top + window.scrollY,
    behavior,
  });
}

function isScrollIntentTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return true;
  return !target.closest(
    'input, textarea, select, [contenteditable="true"], [role="dialog"]',
  );
}

export function ScrollExperience({
  initialWorld = null,
}: {
  initialWorld?: World | null;
}) {
  const orbitRef = useRef<HTMLElement>(null);
  const orbitProgress = useSectionProgress(orbitRef);
  const [locale, setLocale] = useState<Locale>(readInitialLocale);
  const [world, setWorld] = useState<World | null>(initialWorld);
  const [focus, setFocus] = useState<World | null>(initialWorld);
  const [completedWorld, setCompletedWorld] = useState<World | null>(null);
  const [entryWorld, setEntryWorld] = useState<World | null>(null);
  const [orbitArrival, setOrbitArrival] = useState(false);
  const scrollTimer = useRef<number | null>(null);
  const diveTimer = useRef<number | null>(null);
  const arrivalTimer = useRef<number | null>(null);
  const previousOrbitProgress = useRef(orbitProgress);
  const arrivalStartedRef = useRef(false);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const initialIgnition = reducedMotion || Boolean(initialWorld);
  const [ignition, dispatchIgnition] = useReducer(
    transitionIgnition,
    initialIgnition
      ? {
          ...initialIgnitionState,
          phase: 'interactive' as const,
          orbitVisible: true,
        }
      : initialIgnitionState,
  );
  const [ignitionEpoch, setIgnitionEpoch] = useState(0);
  const ignitionEpochRef = useRef(0);
  const preferencesOpen = useExperienceStore((state) => state.preferencesOpen);
  const togglePreferences = useExperienceStore((state) => state.togglePreferences);
  const openSources = useExperienceStore((state) => state.openSources);
  const copy = getExperienceContent(locale);

  useEffect(() => {
    if (!initialWorld) return;
    const timer = window.setTimeout(
      () => scrollToSection(`jornada-${initialWorld}`, reducedMotion),
      120,
    );
    return () => window.clearTimeout(timer);
  }, [initialWorld, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) dispatchIgnition({ type: 'INSTANT' });
  }, [reducedMotion]);

  useEffect(() => {
    const previous = previousOrbitProgress.current;
    previousOrbitProgress.current = orbitProgress;

    // A positive scroll delta is the visitor's first physical intent. The
    // reducer still ignores progress-only events from programmatic scroll
    // restoration, deep links, or test harnesses.
    if (orbitProgress > previous && orbitProgress > 0) {
      dispatchIgnition({ type: 'USER_INTENT' });
    }
    dispatchIgnition({ type: 'ORBIT_PROGRESS', progress: orbitProgress });
  }, [orbitProgress]);

  useEffect(() => {
    const element = orbitRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      dispatchIgnition({ type: 'ORBIT_VISIBILITY', visible: true });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        dispatchIgnition({
          type: 'ORBIT_VISIBILITY',
          visible: entry.isIntersecting && entry.intersectionRatio >= 0.08,
        });
      },
      {
        threshold: [0, 0.08, 0.24],
        rootMargin: '0px 0px -8% 0px',
      },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const beginOrbitArrival = useCallback(
    (scrollToOrbit: boolean) => {
      if (arrivalStartedRef.current) return;
      dispatchIgnition({ type: 'USER_INTENT' });

      if (reducedMotion) {
        if (scrollToOrbit) scrollToSection('orbita', true);
        return;
      }

      arrivalStartedRef.current = true;
      setOrbitArrival(true);
      if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
      if (arrivalTimer.current) window.clearTimeout(arrivalTimer.current);

      if (scrollToOrbit) {
        scrollTimer.current = window.setTimeout(
          () => scrollToSection('orbita', false),
          150,
        );
      }
      arrivalTimer.current = window.setTimeout(
        () => setOrbitArrival(false),
        1640,
      );
    },
    [reducedMotion],
  );

  useEffect(() => {
    const registerIntent = () => {
      if (ignition.phase !== 'pending') return;
      beginOrbitArrival(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        !isScrollIntentTarget(event.target) ||
        !['ArrowDown', 'PageDown', ' ', 'End'].includes(event.key)
      ) {
        return;
      }
      registerIntent();
    };
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0 || !isScrollIntentTarget(event.target)) return;
      registerIntent();
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', registerIntent, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', registerIntent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [beginOrbitArrival, ignition.phase]);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Persisting the preference is optional.
    }
  }, [locale]);

  useEffect(
    () => () => {
      if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
      if (diveTimer.current) window.clearTimeout(diveTimer.current);
      if (arrivalTimer.current) window.clearTimeout(arrivalTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!reducedMotion || !orbitArrival) return;
    if (arrivalTimer.current) window.clearTimeout(arrivalTimer.current);
    arrivalStartedRef.current = false;
    setOrbitArrival(false);
  }, [orbitArrival, reducedMotion]);

  const syncQuery = (nextWorld: World | null) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (nextWorld) url.searchParams.set('world', nextWorld);
    else url.searchParams.delete('world');
    window.history.replaceState({}, '', url);
  };

  const openWorld = (nextWorld: World) => {
    setWorld(nextWorld);
    setFocus(nextWorld);
    setCompletedWorld(null);
    setEntryWorld(nextWorld);
    syncQuery(nextWorld);
    if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    if (diveTimer.current) window.clearTimeout(diveTimer.current);
    if (!reducedMotion) {
      diveTimer.current = window.setTimeout(
        () => setEntryWorld(null),
        1780,
      );
    }
    scrollTimer.current = window.setTimeout(
      () => scrollToSection(`jornada-${nextWorld}`, reducedMotion),
      reducedMotion ? 120 : 1380,
    );
  };

  const finishWorld = (nextWorld: World) => {
    setCompletedWorld(nextWorld);
    if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    scrollTimer.current = window.setTimeout(
      () => scrollToSection('legado', reducedMotion),
      50,
    );
  };

  const returnToOrbit = () => {
    if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    if (diveTimer.current) window.clearTimeout(diveTimer.current);
    setWorld(null);
    setFocus(null);
    setCompletedWorld(null);
    setEntryWorld(null);
    syncQuery(null);
    window.setTimeout(() => scrollToSection('orbita', reducedMotion), 30);
  };

  const returnHome = () => {
    if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    if (diveTimer.current) window.clearTimeout(diveTimer.current);
    if (arrivalTimer.current) window.clearTimeout(arrivalTimer.current);
    setOrbitArrival(false);
    setWorld(null);
    setFocus(null);
    setCompletedWorld(null);
    setEntryWorld(null);
    syncQuery(null);
    ignitionEpochRef.current += 1;
    setIgnitionEpoch(ignitionEpochRef.current);
    dispatchIgnition({ type: reducedMotion ? 'INSTANT' : 'RESET' });
    window.setTimeout(() => scrollToSection('ignicao', reducedMotion), 30);
  };

  const startExperience = () => {
    if (orbitArrival) return;
    beginOrbitArrival(true);
  };

  const handleSceneReady = useCallback((epoch: number) => {
    if (epoch !== ignitionEpochRef.current) return;
    dispatchIgnition({ type: 'SCENE_READY' });
  }, []);

  const handleEntrySettled = useCallback((epoch: number) => {
    if (epoch !== ignitionEpochRef.current) return;
    dispatchIgnition({ type: 'ENTRY_SETTLED' });
  }, []);

  const selectionEnabled = isSelectionEnabled(ignition);

  return (
    <div
      className={`cine-app${world ? ` has-world is-${world}` : ''}`}
      data-focus={focus ?? 'none'}
      data-ignition={isIgnitionActive(ignition) ? 'active' : 'pending'}
      data-ignition-phase={ignition.phase}
      data-scene-ready={ignition.sceneReady}
      data-orbit-arrival={orbitArrival ? 'active' : undefined}
    >
      <a className="skip-link" href="#main-content">
        {copy.header.skipToContent}
      </a>
      <div className="ambient-grain" aria-hidden="true" />

      <header className="cine-header">
        <button
          className="cine-wordmark"
          type="button"
          aria-label={copy.header.team}
          onClick={() => scrollToSection('ignicao', reducedMotion)}
        >
          <span
            className="cine-wordmark__signal"
            aria-hidden="true"
          />
          <span className="cine-wordmark__product">
            {copy.header.team}
          </span>
        </button>

        <div className="cine-header__instrument" aria-hidden="true">
          <Radio size={14} />
          <span>{copy.header.instrument[world ?? 'orbit']}</span>
        </div>

        <nav className="cine-header__nav" aria-label={copy.header.navLabel}>
          <div
            className="cine-language"
            role="group"
            aria-label={copy.header.language.ariaLabel}
          >
            <Languages aria-hidden="true" size={17} />
            {locales.map((option) => (
              <button
                className="cine-language__button"
                type="button"
                key={option}
                aria-pressed={locale === option}
                aria-label={`${copy.header.language.label}: ${copy.header.language.options[option]}`}
                onClick={() => setLocale(option)}
              >
                {copy.header.language.options[option]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={togglePreferences}
            aria-expanded={preferencesOpen}
            aria-label={copy.header.actions.settingsAria}
          >
            <Settings2 aria-hidden="true" size={19} />
            <span>{copy.header.actions.settings}</span>
          </button>
          <button
            type="button"
            onClick={openSources}
            aria-label={copy.header.actions.sourcesAria}
          >
            <BookOpenText aria-hidden="true" size={19} />
            <span>{copy.header.actions.sources}</span>
          </button>
          <a
            href="?mode=archive"
            aria-label={copy.header.actions.archiveAria}
          >
            <Accessibility aria-hidden="true" size={19} />
            <span>{copy.header.actions.archive}</span>
          </a>
        </nav>
      </header>

      {orbitArrival && !reducedMotion ? (
        <div className="cine-orbit-arrival" aria-hidden="true">
          <div className="cine-orbit-arrival__veil" />
          <div className="cine-orbit-arrival__stars" />
          <div className="cine-orbit-arrival__warp" />
          <div className="cine-orbit-arrival__flare" />
          <div className="cine-orbit-arrival__ring is-inner" />
          <div className="cine-orbit-arrival__ring is-outer" />
          <div className="cine-orbit-arrival__copy">
            <span>{copy.header.instrument.orbit} / {copy.orbit.sectionLabel}</span>
            <h2>{copy.orbit.headingDefault}</h2>
          </div>
          <div className="cine-orbit-arrival__telemetry">
            <span>150</span>
            <i />
            <span>ORBIT LOCK</span>
          </div>
        </div>
      ) : null}

      <main id="main-content" tabIndex={-1}>
        <section
          id="ignicao"
          className="cine-ignition"
          aria-labelledby="cine-title"
          aria-label={copy.ignition.sectionLabel}
        >
          <div className="cine-ignition__halo" aria-hidden="true" />
          <div className="cine-ignition__orbit" aria-hidden="true" />
          <div className="cine-ignition__content">
            <h1 id="cine-title">
              {copy.ignition.titleLead}
              <br />
              <em>{copy.ignition.titleEmphasis}</em>
            </h1>
            <button
              className="cine-start"
              type="button"
              disabled={orbitArrival}
              aria-busy={orbitArrival}
              aria-label={copy.ignition.startAriaLabel}
              onClick={startExperience}
            >
              <span>{copy.ignition.start}</span>
              <i aria-hidden="true" />
            </button>
          </div>
        </section>

        <section
          ref={orbitRef}
          id="orbita"
          className="cine-orbit"
          aria-labelledby="orbit-title"
        >
          <div className="cine-orbit__sticky">
            <ExperienceStage
              key={`ignition-${ignitionEpoch}`}
              focus={focus}
              reducedMotion={reducedMotion}
              orbitProgress={orbitProgress}
              onSelect={openWorld}
              ignitionEpoch={ignitionEpoch}
              ignitionState={ignition}
              selectionEnabled={selectionEnabled}
              onSceneReady={handleSceneReady}
              onEntrySettled={handleEntrySettled}
              onSceneFallback={handleSceneReady}
            />
            <h2 id="orbit-title" className="sr-only">
              {copy.orbit.sectionLabel}
            </h2>
            <OrbitSelector
              orbitProgress={orbitProgress}
              selectedWorld={focus}
              onSelect={openWorld}
              copy={copy.orbit}
              selectionEnabled={selectionEnabled}
            />
          </div>
        </section>

        {world === 'mars' ? (
          <MarsJourney
            locale={locale}
            reducedMotion={reducedMotion}
            onExit={returnToOrbit}
            onFinish={() => finishWorld('mars')}
          />
        ) : null}

        {world === 'moon' ? (
          <MoonJourney
            locale={locale}
            reducedMotion={reducedMotion}
            onExit={returnToOrbit}
            onFinish={() => finishWorld('moon')}
          />
        ) : null}

        {world && completedWorld === world ? (
          <JourneyFinale
            world={world}
            locale={locale}
            onExplore={returnToOrbit}
            onHome={returnHome}
          />
        ) : null}
      </main>

      <SettingsPanel />
      <SourcesPanel />

      {entryWorld ? (
        <div
          className={`cine-planet-dive is-${entryWorld}`}
          style={
            {
              '--dive-texture': `url("${WORLD_TEXTURE[entryWorld]}")`,
            } as CSSProperties
          }
          aria-hidden="true"
        >
          <div className="cine-planet-dive__warp" />
          <div className="cine-planet-dive__orbit" />
          <div className="cine-planet-dive__planet" />
          <div className="cine-planet-dive__rim" />
          <div className="cine-planet-dive__flash" />
          <p className="cine-planet-dive__label">
            {copy.orbit.planetNames[entryWorld]}
            <span>{entryWorld === 'mars' ? 'MER-B' : 'LUNA-01'}</span>
          </p>
        </div>
      ) : null}

      <OdsBadges locale={locale} />
    </div>
  );
}
