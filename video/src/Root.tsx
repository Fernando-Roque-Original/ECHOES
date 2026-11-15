import type { ComponentType } from 'react';
import { Composition } from 'remotion';
import {
  ECHOS_30_FPS,
  ECHOS_30_HEIGHT,
  ECHOS_30_TOTAL_FRAMES,
  ECHOS_30_WIDTH,
  Echos30En,
} from './Echos30En';
import { PitchFilm, type PitchFilmProps } from './PitchFilm';
import {
  FILM_FPS,
  FILM_HEIGHT,
  FILM_TOTAL_FRAMES,
  FILM_WIDTH,
} from './timeline';

const defaultProps: PitchFilmProps = {
  showCaptions: true,
  animatic: false,
};

const PitchFilmComponent =
  PitchFilm as unknown as ComponentType<Record<string, unknown>>;
const Echos30EnComponent =
  Echos30En as unknown as ComponentType<Record<string, unknown>>;

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="PitchFilm"
        component={PitchFilmComponent}
        durationInFrames={FILM_TOTAL_FRAMES}
        fps={FILM_FPS}
        width={FILM_WIDTH}
        height={FILM_HEIGHT}
        defaultProps={defaultProps}
      />
      <Composition
        id="Echos30En"
        component={Echos30EnComponent}
        durationInFrames={ECHOS_30_TOTAL_FRAMES}
        fps={ECHOS_30_FPS}
        width={ECHOS_30_WIDTH}
        height={ECHOS_30_HEIGHT}
      />
    </>
  );
}
