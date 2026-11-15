import type { ComponentType } from 'react';
import { Composition } from 'remotion';
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

export function RemotionRoot() {
  return (
    <Composition
      id="PitchFilm"
      component={PitchFilmComponent}
      durationInFrames={FILM_TOTAL_FRAMES}
      fps={FILM_FPS}
      width={FILM_WIDTH}
      height={FILM_HEIGHT}
      defaultProps={defaultProps}
    />
  );
}
