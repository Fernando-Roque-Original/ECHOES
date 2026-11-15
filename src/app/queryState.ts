export type ExperienceMode = 'cinematic' | 'archive';
export type World = 'mars' | 'moon';

export type ExperienceQueryState = {
  mode: ExperienceMode;
  world: World | null;
};

export function readQueryState(search = window.location.search): ExperienceQueryState {
  const params = new URLSearchParams(search);
  const requestedMode = params.get('mode');
  const requestedWorld = params.get('world');

  return {
    mode: requestedMode === 'archive' ? 'archive' : 'cinematic',
    world:
      requestedWorld === 'mars' || requestedWorld === 'moon'
        ? requestedWorld
        : null,
  };
}
