import type { World } from '../app/queryState';

export type Locale = 'pt-BR' | 'en';

export type PlanetId =
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune';

export type JourneyVisual =
  | 'mars'
  | 'traverse'
  | 'dust'
  | 'signal'
  | 'evidence'
  | 'teardown'
  | 'lunar-teardown'
  | 'moon';

export type JourneyBeat = {
  id: string;
  kicker: string;
  headline: string;
  body: string;
  detail?: string;
  image?: string;
  imageAlt?: string;
  credit?: string;
  visual?: JourneyVisual;
};

export type Journey = {
  world: World;
  name: string;
  introduction: string;
  sectionLabel: string;
  backToOrbit: string;
  scrollCue: string;
  beats: JourneyBeat[];
};

export type LegacyFact = {
  value: string;
  label: string;
};

export type QuizAnswer = {
  label: string;
  correct: boolean;
};

export type Quiz = {
  hypothesisLabel: string;
  answersLabel: string;
  idleFeedback: string;
  correctFeedback: string;
  incorrectFeedback: string;
  finishLabel: string;
  answers: QuizAnswer[];
};

export type HeaderCopy = {
  skipToContent: string;
  brand: string;
  team: string;
  navLabel: string;
  instrument: Record<World | 'orbit', string>;
  actions: {
    settings: string;
    settingsAria: string;
    sources: string;
    sourcesAria: string;
    archive: string;
    archiveAria: string;
  };
  language: {
    label: string;
    ariaLabel: string;
    options: Record<Locale, string>;
  };
};

export type IgnitionCopy = {
  sectionLabel: string;
  titleLead: string;
  titleEmphasis: string;
  start: string;
  startAriaLabel: string;
};

export type OrbitCopy = {
  sectionLabel: string;
  headingDefault: string;
  worldsLabel: string;
  explorePrefix: string;
  lockedSuffix: string;
  stateUnlocked: string;
  stateLocked: string;
  previousPlanet: string;
  nextPlanet: string;
  silentToast: string;
  scrollHint: string;
  planetNames: Record<PlanetId, string>;
};

export type FinaleCopy = {
  ariaLabel: string;
  kicker: string;
  title: string;
  body: string | null;
  showLegacyFacts: boolean;
  signatureLead: string;
  signatureEmphasis: string;
  explore: string;
  home: string;
};

export type ExperienceCopy = {
  header: HeaderCopy;
  ignition: IgnitionCopy;
  orbit: OrbitCopy;
  journeys: Record<World, Journey>;
  quiz: Record<World, Quiz>;
  finale: Record<World, FinaleCopy>;
};
