import type { World } from '../app/queryState';
import {
  getJourney,
  getLegacyFacts,
  getMarsJourney,
  getMoonJourney,
} from '../i18n';
import type {
  Journey,
  JourneyBeat,
  LegacyFact,
} from '../i18n';

export type { Journey, JourneyBeat, LegacyFact } from '../i18n';

export const marsJourney: JourneyBeat[] = getMarsJourney('pt-BR');
export const moonJourney: JourneyBeat[] = getMoonJourney('pt-BR');
export const legacyFacts: LegacyFact[] = getLegacyFacts('pt-BR');

export const journeys: Record<World, Journey> = {
  mars: getJourney('mars', 'pt-BR'),
  moon: getJourney('moon', 'pt-BR'),
};
