export const CARD_INTERACTION_PROGRESS = 0.48;

export type IgnitionPhase =
  | 'pending'
  | 'armed'
  | 'entry'
  | 'settled'
  | 'interactive'
  | 'returning';

export type IgnitionState = {
  phase: IgnitionPhase;
  orbitVisible: boolean;
  sceneReady: boolean;
  orbitProgress: number;
};

export type IgnitionEvent =
  | { type: 'USER_INTENT' }
  | { type: 'ORBIT_VISIBILITY'; visible: boolean }
  | { type: 'SCENE_READY' }
  | { type: 'ENTRY_SETTLED' }
  | { type: 'ORBIT_PROGRESS'; progress: number }
  | { type: 'INSTANT' }
  | { type: 'RESET' };

export const initialIgnitionState: IgnitionState = {
  phase: 'pending',
  orbitVisible: false,
  sceneReady: false,
  orbitProgress: 0,
};

function clampProgress(progress: number) {
  if (!Number.isFinite(progress)) return 0;
  return Math.max(0, Math.min(1, progress));
}

function beginEntryIfReady(state: IgnitionState): IgnitionState {
  if (
    state.phase === 'armed' &&
    state.orbitVisible &&
    state.sceneReady
  ) {
    return { ...state, phase: 'entry' };
  }

  return state;
}

function finishEntry(state: IgnitionState): IgnitionState {
  if (state.phase !== 'entry') return state;

  return {
    ...state,
    phase:
      state.orbitProgress >= CARD_INTERACTION_PROGRESS
        ? 'interactive'
        : 'settled',
  };
}

export function transitionIgnition(
  state: IgnitionState,
  event: IgnitionEvent,
): IgnitionState {
  switch (event.type) {
    case 'USER_INTENT': {
      if (state.phase !== 'pending') return state;
      return beginEntryIfReady({ ...state, phase: 'armed' });
    }

    case 'ORBIT_VISIBILITY': {
      if (state.orbitVisible === event.visible) return state;
      return beginEntryIfReady({
        ...state,
        orbitVisible: event.visible,
      });
    }

    case 'SCENE_READY': {
      if (state.sceneReady) return state;
      return beginEntryIfReady({ ...state, sceneReady: true });
    }

    case 'ENTRY_SETTLED':
      return finishEntry(state);

    case 'ORBIT_PROGRESS': {
      const progress = clampProgress(event.progress);
      if (state.orbitProgress === progress) return state;

      const next = { ...state, orbitProgress: progress };
      if (
        next.phase === 'settled' &&
        progress >= CARD_INTERACTION_PROGRESS
      ) {
        next.phase = 'interactive';
      }
      return next;
    }

    case 'INSTANT':
      return {
        ...state,
        phase: 'interactive',
        orbitVisible: true,
      };

    case 'RESET':
      return {
        ...initialIgnitionState,
        orbitProgress: state.orbitProgress,
      };
  }
}

export function isIgnitionActive(state: IgnitionState) {
  return (
    state.phase === 'entry' ||
    state.phase === 'settled' ||
    state.phase === 'interactive'
  );
}

export function isSelectionEnabled(state: IgnitionState) {
  return state.phase === 'interactive' && state.sceneReady;
}
