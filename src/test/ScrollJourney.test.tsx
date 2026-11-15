import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Journey } from '../i18n';

const mockProgress = vi.hoisted(() => {
  let value = 0.9;
  const listeners = new Set<() => void>();

  return {
    get: () => value,
    reset: () => {
      value = 0.9;
      listeners.forEach((listener) => listener());
    },
    set: (nextValue: number) => {
      value = nextValue;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
});

vi.mock('../experience/scrollProgress', async () => {
  const { useSyncExternalStore } = await import('react');

  return {
    getSectionProgress: () => mockProgress.get(),
    useSectionProgress: () =>
      useSyncExternalStore(
        mockProgress.subscribe,
        mockProgress.get,
        mockProgress.get,
      ),
  };
});

vi.mock('../components/RoverTeardown', () => ({
  default: ({
    active,
    progress,
  }: {
    active?: boolean;
    progress?: number;
  }) => (
    <div
      data-active={String(active)}
      data-progress={String(progress)}
      data-testid="rover-teardown"
    />
  ),
}));

vi.mock('../components/LunarModuleTeardown', () => ({
  default: ({
    active,
    progress,
  }: {
    active?: boolean;
    progress?: number;
  }) => (
    <div
      data-active={String(active)}
      data-progress={String(progress)}
      data-testid="lunar-teardown"
    />
  ),
}));

import {
  DEFAULT_JOURNEY_BEAT_SPAN,
  TEARDOWN_JOURNEY_BEAT_SPAN,
  ScrollJourney,
  createJourneyBeatLayout,
  getJourneyBeatAtProgress,
  getJourneyBeatProgress,
  getJourneyBeatSpan,
} from '../components/scroll/ScrollJourney';

const journey: Journey = {
  world: 'mars',
  name: 'Mars',
  introduction: 'Test journey',
  sectionLabel: 'Test journey',
  backToOrbit: 'Back',
  scrollCue: 'Scroll',
  beats: [
    {
      id: 'intro',
      kicker: '01',
      headline: 'Intro',
      body: 'Intro body',
      visual: 'mars',
    },
    {
      id: 'opportunity-teardown',
      kicker: '02',
      headline: 'Teardown',
      body: 'Teardown body',
      visual: 'teardown',
    },
    {
      id: 'question',
      kicker: '03',
      headline: 'Question',
      body: 'Question body',
    },
  ],
};

beforeEach(() => {
  mockProgress.reset();
});

describe('weighted scroll journey', () => {
  it('sums the real beat spans instead of counting beats', () => {
    const layout = createJourneyBeatLayout(journey.beats);

    expect(DEFAULT_JOURNEY_BEAT_SPAN).toBe(1);
    expect(TEARDOWN_JOURNEY_BEAT_SPAN).toBe(1.6);
    expect(getJourneyBeatSpan({ visual: 'lunar-teardown' })).toBe(1.6);
    expect(layout.ranges.map((range) => range.span)).toEqual([
      1,
      1.6,
      1,
    ]);
    expect(layout.totalSpan).toBeCloseTo(3.6, 10);
  });

  it('maps global progress onto weighted beat ranges', () => {
    const layout = createJourneyBeatLayout(journey.beats);
    const middle = getJourneyBeatAtProgress(layout, 0.5);
    const first = getJourneyBeatAtProgress(layout, 0.5 / layout.totalSpan);

    expect(first).toMatchObject({ index: 0 });
    expect(
      getJourneyBeatProgress(0.5 / layout.totalSpan, first!),
    ).toBeCloseTo(0.5, 10);
    expect(middle).toMatchObject({ index: 1 });
    expect(getJourneyBeatProgress(0.5, middle!)).toBeCloseTo(0.5, 10);
    expect(
      getJourneyBeatAtProgress(layout, 1),
    ).toMatchObject({ index: 2 });
  });

  it('gives the teardown 1.6x the scroll distance and progresses 0 to 1', () => {
    const layout = createJourneyBeatLayout(journey.beats);
    const teardown = layout.ranges[1];

    expect(teardown.span).toBe(
      DEFAULT_JOURNEY_BEAT_SPAN * TEARDOWN_JOURNEY_BEAT_SPAN,
    );
    expect(getJourneyBeatProgress(teardown.start, teardown)).toBe(0);
    expect(
      getJourneyBeatProgress(
        (teardown.start + teardown.end) / 2,
        teardown,
      ),
    ).toBeCloseTo(0.5, 10);
    expect(getJourneyBeatProgress(teardown.end, teardown)).toBe(1);
  });

  it('hands the teardown beat to the next beat exactly at its boundary', () => {
    const layout = createJourneyBeatLayout(journey.beats);
    const teardown = layout.ranges[1];
    const before = teardown.start - 0.000001;
    const beforeEnd = teardown.end - 0.000001;

    expect(getJourneyBeatAtProgress(layout, before)?.index).toBe(0);
    expect(getJourneyBeatAtProgress(layout, teardown.start)?.index).toBe(1);
    expect(getJourneyBeatAtProgress(layout, beforeEnd)?.index).toBe(1);
    expect(getJourneyBeatAtProgress(layout, teardown.end)?.index).toBe(2);
    expect(getJourneyBeatAtProgress(layout, Number.NaN)?.index).toBe(0);
  });

  it('handles an empty journey without dividing by zero', () => {
    const layout = createJourneyBeatLayout([]);

    expect(layout).toEqual({ totalSpan: 0, ranges: [] });
    expect(getJourneyBeatAtProgress(layout, 0.5)).toBeNull();
  });
});

describe('ScrollJourney teardown lifecycle', () => {
  it('reflects the weighted span in CSS and keeps the canvas mounted', () => {
    render(
      <ScrollJourney
        journey={journey}
        locale="pt-BR"
        reducedMotion={false}
        onExit={vi.fn()}
        onFinish={vi.fn()}
      />,
    );

    const section = screen.getByRole('region', { name: 'Test journey' });
    const teardown = screen.getByTestId('rover-teardown');

    expect(section.style.getPropertyValue('--journey-span')).toBe('3.6');
    expect(teardown).toHaveAttribute('data-active', 'false');
    expect(Number(teardown.getAttribute('data-progress'))).toBe(1);

    act(() => mockProgress.set(0.5));

    expect(screen.getByTestId('rover-teardown')).toBe(teardown);
    expect(teardown).toHaveAttribute('data-active', 'true');
    expect(Number(teardown.getAttribute('data-progress'))).toBeCloseTo(
      0.5,
      10,
    );
  });

  it('marks the active questionnaire and keeps its back control available', () => {
    render(
      <ScrollJourney
        journey={journey}
        locale="pt-BR"
        reducedMotion={false}
        onExit={vi.fn()}
        onFinish={vi.fn()}
      />,
    );

    const section = screen.getByRole('region', { name: 'Test journey' });
    const question = screen.getByRole('heading', { name: 'Question' })
      .closest('article');

    expect(section).toHaveClass('cine-journey--quiz');
    expect(question).toHaveClass('cine-beat--quiz', 'is-active');
    expect(
      screen.getByRole('button', { name: 'Back' }),
    ).toBeInTheDocument();
  });
});
