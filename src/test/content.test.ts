import { describe, expect, it } from 'vitest';
import { opportunityStory } from '../content/opportunity';

describe('verified Opportunity content', () => {
  it('contains exactly four navigable chapters', () => {
    expect(opportunityStory.chapters).toHaveLength(4);
    expect(opportunityStory.chapters.every((chapter) => chapter.text.length > 40)).toBe(true);
  });

  it('uses the documented dates and planned mission duration', () => {
    const corpus = opportunityStory.chapters.map((chapter) => chapter.text).join(' ');
    expect(corpus).toContain('janeiro de 2004');
    expect(corpus).toContain('90 dias marcianos');
    expect(corpus).toContain('10');
    expect(corpus).toContain('2018');
    expect(corpus).toContain('2019');
  });

  it('does not present the invented last words as mission data', () => {
    const corpus = JSON.stringify(opportunityStory);
    expect(corpus.toLowerCase()).not.toContain('my battery is low');
    expect(corpus).toContain('não uma mensagem escrita');
  });

  it('dates the official self-portrait correctly', () => {
    const corpus = JSON.stringify(opportunityStory);
    expect(corpus).toContain('janeiro de 2014');
    expect(corpus).not.toContain('fevereiro de 2012');
  });

  it('has accessible hotspot explanations and NASA sources', () => {
    expect(opportunityStory.hotspots.length).toBeGreaterThanOrEqual(2);
    for (const hotspot of opportunityStory.hotspots) {
      expect(hotspot.detail.length).toBeGreaterThan(50);
      expect(hotspot.sourceUrl).toMatch(/^https:\/\/science\.nasa\.gov|^https:\/\/www\.nasa\.gov/);
    }
  });

  it('has a solvable comprehension question', () => {
    expect(opportunityStory.quiz.answers[opportunityStory.quiz.correctAnswerIndex]).toBe(
      'Que Marte já teve condições com água',
    );
  });
});

