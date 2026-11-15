import type { World } from '../app/queryState';
import {
  experienceContent,
  legacyFactsByLocale,
} from './content';
import type {
  ExperienceCopy,
  FinaleCopy,
  Journey,
  JourneyBeat,
  LegacyFact,
  Locale,
  Quiz,
} from './types';

export * from './types';
export { experienceContent, legacyFactsByLocale };

export const locales = ['pt-BR', 'en'] as const satisfies readonly Locale[];

export function getExperienceContent(locale: Locale): ExperienceCopy {
  return experienceContent[locale];
}

export const getContent = getExperienceContent;

export function getJourney(world: World, locale: Locale): Journey {
  return experienceContent[locale].journeys[world];
}

export function getMarsJourney(locale: Locale): JourneyBeat[] {
  return experienceContent[locale].journeys.mars.beats;
}

export function getMoonJourney(locale: Locale): JourneyBeat[] {
  return experienceContent[locale].journeys.moon.beats;
}

export function getLegacyFacts(locale: Locale): LegacyFact[] {
  return legacyFactsByLocale[locale].map((fact) => ({ ...fact }));
}

export function getQuiz(world: World, locale: Locale): Quiz {
  return experienceContent[locale].quiz[world];
}

export function getFinale(world: World, locale: Locale): FinaleCopy {
  return experienceContent[locale].finale[world];
}
