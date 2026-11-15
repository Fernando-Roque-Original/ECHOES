import { describe, expect, it } from 'vitest';
import {
  CARD_INTERACTION_PROGRESS,
  initialIgnitionState,
  isIgnitionActive,
  isSelectionEnabled,
  transitionIgnition,
  type IgnitionEvent,
  type IgnitionState,
} from '../experience/ignitionMachine';

function run(events: IgnitionEvent[], start = initialIgnitionState) {
  return events.reduce(transitionIgnition, start);
}

describe('ignition machine', () => {
  it('does not start from programmatic progress without user intent', () => {
    const state = run([
      { type: 'ORBIT_PROGRESS', progress: 0.7 },
      { type: 'ORBIT_VISIBILITY', visible: true },
      { type: 'SCENE_READY' },
    ]);

    expect(state.phase).toBe('pending');
    expect(isIgnitionActive(state)).toBe(false);
  });

  it('waits for user intent, visibility and scene readiness in any order', () => {
    const armedFirst = run([
      { type: 'USER_INTENT' },
      { type: 'SCENE_READY' },
      { type: 'ORBIT_VISIBILITY', visible: true },
    ]);
    const readyFirst = run([
      { type: 'SCENE_READY' },
      { type: 'ORBIT_VISIBILITY', visible: true },
      { type: 'USER_INTENT' },
    ]);

    expect(armedFirst.phase).toBe('entry');
    expect(readyFirst.phase).toBe('entry');
  });

  it('keeps cards locked until entry settles and the visitor scrolls further', () => {
    const settled = run([
      { type: 'USER_INTENT' },
      { type: 'ORBIT_VISIBILITY', visible: true },
      { type: 'SCENE_READY' },
      { type: 'ENTRY_SETTLED' },
    ]);

    expect(settled.phase).toBe('settled');
    expect(isSelectionEnabled(settled)).toBe(false);

    const revealed = transitionIgnition(settled, {
      type: 'ORBIT_PROGRESS',
      progress: CARD_INTERACTION_PROGRESS,
    });

    expect(revealed.phase).toBe('interactive');
    expect(isSelectionEnabled(revealed)).toBe(true);
  });

  it('goes straight to interactive when the visitor already scrolled far', () => {
    const state = run([
      { type: 'USER_INTENT' },
      { type: 'ORBIT_VISIBILITY', visible: true },
      { type: 'SCENE_READY' },
      { type: 'ORBIT_PROGRESS', progress: CARD_INTERACTION_PROGRESS + 0.02 },
      { type: 'ENTRY_SETTLED' },
    ]);

    expect(state.phase).toBe('interactive');
    expect(isSelectionEnabled(state)).toBe(true);
  });

  it('supports deep links and reduced motion without replaying the entry', () => {
    const state = run([
      { type: 'INSTANT' },
      { type: 'SCENE_READY' },
    ]);

    expect(state.phase).toBe('interactive');
    expect(isSelectionEnabled(state)).toBe(true);
  });

  it('resets for a new scene epoch while preserving measured scroll', () => {
    const before = run([
      { type: 'INSTANT' },
      { type: 'SCENE_READY' },
      { type: 'ORBIT_PROGRESS', progress: 0.62 },
    ]);
    const after = transitionIgnition(before, { type: 'RESET' });

    expect(after).toEqual<IgnitionState>({
      ...initialIgnitionState,
      orbitProgress: 0.62,
    });
    expect(isSelectionEnabled(after)).toBe(false);
  });
});
