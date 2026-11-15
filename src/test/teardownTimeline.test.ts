import { describe, expect, it } from 'vitest';
import {
  TEARDOWN_FEATURED_LAYER_ORDER,
  TEARDOWN_PHASES,
  clampTeardownProgress,
  getTeardownFeaturedLayer,
  getTeardownLayerStaggerAmount,
  getTeardownPhase,
  getTeardownSeparation,
  getTeardownTimelineState,
} from '../content/teardownTimeline';

describe('scroll-driven teardown timeline', () => {
  it('clamps progress and phase boundaries deterministically', () => {
    expect(clampTeardownProgress(-4)).toBe(0);
    expect(clampTeardownProgress(12)).toBe(1);
    expect(clampTeardownProgress(Number.NaN)).toBe(0);

    expect(getTeardownPhase(0)).toBe('assembled');
    expect(getTeardownPhase(0.12)).toBe('callouts');
    expect(getTeardownPhase(0.28)).toBe('separating');
    expect(getTeardownPhase(0.52)).toBe('inspection');
    expect(getTeardownPhase(0.7)).toBe('cutaway');
    expect(getTeardownPhase(0.84)).toBe('reassembling');
    expect(getTeardownPhase(1)).toBe('reassembling');

    expect(getTeardownTimelineState(-1).progress).toBe(0);
    expect(getTeardownTimelineState(2).progress).toBe(1);
  });

  it('moves separation upward through the cutaway, then reassembles', () => {
    expect(getTeardownSeparation(0)).toBe(0);
    expect(getTeardownSeparation(0.12)).toBe(0);
    expect(getTeardownSeparation(0.84)).toBeCloseTo(100, 5);
    expect(getTeardownSeparation(1)).toBe(0);

    let previous = 0;
    for (let progress = 0; progress <= 0.84; progress += 0.01) {
      const separation = getTeardownSeparation(progress);
      expect(separation).toBeGreaterThanOrEqual(previous - 0.0001);
      expect(separation).toBeGreaterThanOrEqual(0);
      expect(separation).toBeLessThanOrEqual(100);
      previous = separation;
    }

    previous = getTeardownSeparation(0.84);
    for (let progress = 0.85; progress <= 1; progress += 0.01) {
      const separation = getTeardownSeparation(progress);
      expect(separation).toBeLessThanOrEqual(previous + 0.0001);
      previous = separation;
    }
  });

  it('exposes monotonic stagger and cutaway motion with normalized values', () => {
    let previousStagger = 0;
    let previousInspection = 0;
    let previousCutaway = 0;

    for (let progress = 0; progress <= 0.84; progress += 0.01) {
      const state = getTeardownTimelineState(progress);
      expect(state.stagger).toBeGreaterThanOrEqual(previousStagger - 0.0001);
      expect(state.inspectOpacity).toBeGreaterThanOrEqual(
        previousInspection - 0.0001,
      );
      expect(state.cutawayAmount).toBeGreaterThanOrEqual(
        previousCutaway - 0.0001,
      );

      expect(state.stagger).toBeGreaterThanOrEqual(0);
      expect(state.stagger).toBeLessThanOrEqual(1);
      expect(state.labelOpacity).toBeGreaterThanOrEqual(0);
      expect(state.labelOpacity).toBeLessThanOrEqual(1);
      expect(state.schematicOpacity).toBeGreaterThanOrEqual(0);
      expect(state.schematicOpacity).toBeLessThanOrEqual(1);
      expect(state.glbOpacity).toBeGreaterThanOrEqual(0);
      expect(state.glbOpacity).toBeLessThanOrEqual(1);

      previousStagger = state.stagger;
      previousInspection = state.inspectOpacity;
      previousCutaway = state.cutawayAmount;
    }
  });

  it('crossfades the illustrative schematic only around the cutaway', () => {
    expect(getTeardownTimelineState(0.7).cutawayAmount).toBe(0);
    expect(getTeardownTimelineState(0.7).schematicOpacity).toBe(0);
    expect(getTeardownTimelineState(0.79).cutawayAmount).toBeCloseTo(1, 5);
    expect(getTeardownTimelineState(0.79).schematicOpacity).toBeCloseTo(1, 5);
    expect(getTeardownTimelineState(0.84).schematicOpacity).toBeCloseTo(1, 5);
    expect(getTeardownTimelineState(0.96).schematicOpacity).toBe(0);
    expect(getTeardownTimelineState(1).cutawayAmount).toBe(0);
  });

  it('visits every featured rover layer in the declared order', () => {
    const visited = new Set(
      Array.from({ length: 145 }, (_, index) => index / 144)
        .filter((progress) => progress >= 0.12 && progress <= 0.84)
        .map(getTeardownFeaturedLayer),
    );

    expect([...visited]).toEqual([...TEARDOWN_FEATURED_LAYER_ORDER]);
    expect(getTeardownTimelineState(0).featuredLayerId).toBe('body');
  });

  it('staggers layers without changing their final visibility', () => {
    expect(getTeardownLayerStaggerAmount(0, 0, 6)).toBe(0);
    expect(getTeardownLayerStaggerAmount(0, 5, 6)).toBe(0);
    expect(getTeardownLayerStaggerAmount(1, 0, 6)).toBe(1);
    expect(getTeardownLayerStaggerAmount(1, 5, 6)).toBe(1);

    for (let index = 1; index < 6; index += 1) {
      expect(
        getTeardownLayerStaggerAmount(0.5, index, 6),
      ).toBeLessThanOrEqual(
        getTeardownLayerStaggerAmount(0.5, index - 1, 6),
      );
    }
  });

  it('keeps timeline phases and finite camera values ordered', () => {
    expect(new Set(TEARDOWN_PHASES).size).toBe(TEARDOWN_PHASES.length);

    let previousPhaseIndex = 0;
    for (let progress = 0; progress <= 1; progress += 0.01) {
      const state = getTeardownTimelineState(progress);
      const phaseIndex = TEARDOWN_PHASES.indexOf(state.phase);
      expect(phaseIndex).toBeGreaterThanOrEqual(previousPhaseIndex);
      expect(Number.isFinite(state.modelRotation)).toBe(true);
      expect(Number.isFinite(state.camera.distance)).toBe(true);
      expect(Number.isFinite(state.camera.orbitDegrees)).toBe(true);
      expect(Number.isFinite(state.camera.elevationDegrees)).toBe(true);
      expect(state.camera.distance).toBeGreaterThan(5);
      expect(state.camera.distance).toBeLessThan(10);
      previousPhaseIndex = phaseIndex;
    }
  });
});
