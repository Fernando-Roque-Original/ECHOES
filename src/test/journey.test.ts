import { describe, expect, it } from 'vitest';
import {
  getExperienceContent,
  getLegacyFacts,
  getMarsJourney,
  getMoonJourney,
  getQuiz,
} from '../i18n';
import {
  legacyFacts,
  marsJourney,
  moonJourney,
} from '../experience/journey';

describe('cinematic journey content', () => {
  it('keeps the current Portuguese aliases intact', () => {
    expect(marsJourney).toHaveLength(7);
    expect(marsJourney.map((beat) => beat.headline)).toEqual([
      '90 dias',
      '14 anos',
      '45,16 km',
      '10 de junho de 2018',
      'O que ficou',
      'Desmontar para entender',
      'O que você descobriu?',
    ]);
    expect(moonJourney).toHaveLength(7);
    expect(moonJourney.map((beat) => beat.headline)).toEqual([
      '1969',
      'Exosfera fina',
      'Poeira afiada',
      'Gelo nas sombras',
      'Próximo passo',
      'Eagle, por dentro',
      'O que você descobriu?',
    ]);
    expect(legacyFacts).toEqual([
      { value: '90 dias', label: 'planejados' },
      { value: '14 anos', label: 'explorando' },
      { value: '45,16 km', label: 'percorridos' },
    ]);
  });

  it('provides complete localized sections for PT-BR and English', () => {
    const pt = getExperienceContent('pt-BR');
    const en = getExperienceContent('en');

    expect(pt.header.actions.settings).toBe('Ajustes');
    expect(en.header.actions.settings).toBe('Settings');
    expect(pt.ignition.titleLead).toBe('Abandonados,');
    expect(en.ignition.titleLead).toBe('Abandoned,');
    expect(pt.header.team).toBe('ECHOES');
    expect(en.header.team).toBe('ECHOES');
    expect(pt.orbit.planetNames.mars).toBe('Marte');
    expect(en.orbit.planetNames.mars).toBe('Mars');
    expect(pt.journeys.moon.sectionLabel).toBe('Jornada pela Lua');
    expect(en.journeys.moon.sectionLabel).toBe('Journey through the Moon');
    expect(pt.quiz.mars.answers).toHaveLength(3);
    expect(en.quiz.mars.answers).toHaveLength(3);
    expect(pt.finale.mars.showLegacyFacts).toBe(true);
    expect(en.finale.moon.showLegacyFacts).toBe(false);
  });

  it('localizes both journeys while preserving beat structure', () => {
    const ptMars = getMarsJourney('pt-BR');
    const enMars = getMarsJourney('en');
    const ptMoon = getMoonJourney('pt-BR');
    const enMoon = getMoonJourney('en');

    expect(ptMars.map((beat) => beat.id)).toEqual(enMars.map((beat) => beat.id));
    expect(ptMoon.map((beat) => beat.id)).toEqual(enMoon.map((beat) => beat.id));
    expect(ptMars).toHaveLength(7);
    expect(enMars).toHaveLength(7);
    expect(ptMoon).toHaveLength(7);
    expect(enMoon).toHaveLength(7);
    expect(enMars[0].headline).toBe('90 days');
    expect(enMars[3].headline).toBe('June 10, 2018');
    expect(enMars[4].body).toContain('ancient environments with water');
    expect(enMars[3].detail).toContain('not a written message or a goodbye');
    expect(ptMars[5]).toMatchObject({
      id: 'opportunity-teardown',
      kicker: 'Engenharia visível',
      headline: 'Desmontar para entender',
      visual: 'teardown',
    });
    expect(ptMars[5].body).toContain('GLB oficial');
    expect(ptMars[5].body).toContain('grupos de materiais');
    expect(ptMars[5].detail).toContain('peças removíveis');
    expect(ptMars[5].detail).toContain('ordem oficial');
    expect(enMars[5]).toMatchObject({
      id: 'opportunity-teardown',
      kicker: 'Visible engineering',
      headline: 'Take it apart to understand',
      visual: 'teardown',
    });
    expect(enMars[5].body).toContain('official Opportunity GLB');
    expect(enMars[5].body).toContain('material groups');
    expect(enMars[5].detail).toContain('removable parts');
    expect(enMars[5].detail).toContain(
      'official disassembly or assembly sequence',
    );
    expect(ptMars[6].id).toBe('question');
    expect(enMars[6].id).toBe('question');
    expect(enMoon[0].body).toContain("Apollo 11");
    expect(enMoon[1].body).toContain('extremely thin exosphere');
    expect(enMoon[2].body).toContain('regolith');
    expect(enMoon[3].body).toContain('permanently shadowed regions');
    expect(enMoon[4].body).toContain('Artemis');
    expect(ptMoon[5]).toMatchObject({
      id: 'lunar-module',
      headline: 'Eagle, por dentro',
      visual: 'lunar-teardown',
    });
    expect(enMoon[5]).toMatchObject({
      id: 'lunar-module',
      headline: 'Eagle, inside out',
      visual: 'lunar-teardown',
    });
    expect(enMoon.at(-1)?.headline).toBe('What did you discover?');
  });

  it('keeps NASA facts exact in both locales', () => {
    expect(getLegacyFacts('pt-BR')).toEqual([
      { value: '90 dias', label: 'planejados' },
      { value: '14 anos', label: 'explorando' },
      { value: '45,16 km', label: 'percorridos' },
    ]);
    expect(getLegacyFacts('en')).toEqual([
      { value: '90 days', label: 'planned' },
      { value: '14 years', label: 'exploring' },
      { value: '45.16 km', label: 'traveled' },
    ]);
  });

  it('provides a correct Mars quiz and the required Moon answer contrast', () => {
    const mars = getQuiz('mars', 'pt-BR');
    expect(mars.answers.find((answer) => answer.correct)?.label).toBe(
      'Evidências de ambientes antigos com água',
    );

    expect(getQuiz('moon', 'pt-BR').answers).toEqual([
      {
        label: 'Gelo de água em regiões permanentemente sombreadas',
        correct: true,
      },
      {
        label: 'A Lua é um vácuo absoluto e não tem exosfera',
        correct: false,
      },
      {
        label: 'O regolito lunar é macio e liso',
        correct: false,
      },
    ]);

    expect(getQuiz('moon', 'en').answers).toEqual([
      {
        label: 'Water ice in permanently shadowed regions',
        correct: true,
      },
      {
        label: 'The Moon is an absolute vacuum and has no exosphere',
        correct: false,
      },
      {
        label: 'Lunar regolith is soft and smooth',
        correct: false,
      },
    ]);
  });
});
