import RAW_CAPTIONS from './echos30Captions.json';

export interface Echos30Caption {
  id: string;
  startFrame: number;
  endFrame: number;
  text: string;
}

export const ECHOS_30_CAPTIONS =
  RAW_CAPTIONS satisfies readonly Echos30Caption[];

export function findEchos30Caption(frame: number) {
  return ECHOS_30_CAPTIONS.find(
    (cue) => frame >= cue.startFrame && frame < cue.endFrame,
  );
}
