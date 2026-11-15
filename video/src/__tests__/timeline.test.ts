import { describe, expect, it } from 'vitest';
import {
  CAPTION_COVERAGE,
  NARRATION_CAPTIONS,
  captionsToSrt,
} from '../data/captions';
import {
  FILM_FPS,
  FILM_HEIGHT,
  FILM_MOVEMENTS,
  FILM_SCENES,
  FILM_TOTAL_FRAMES,
  FILM_WIDTH,
} from '../timeline';

describe('PitchFilm timeline', () => {
  it('declara o formato master aprovado', () => {
    expect(FILM_WIDTH).toBe(1920);
    expect(FILM_HEIGHT).toBe(1080);
    expect(FILM_FPS).toBe(30);
    expect(FILM_TOTAL_FRAMES).toBe(5400);
    expect(FILM_TOTAL_FRAMES / FILM_FPS).toBe(180);
  });

  it('tem exatamente cinco movimentos na ordem narrativa', () => {
    expect(FILM_MOVEMENTS.map((movement) => movement.id)).toEqual([
      'interrupcao',
      'problema',
      'solucao',
      'transformacao',
      'impacto-fechamento',
    ]);
  });

  it('mantém movimentos e cenas contíguos, positivos e somando 5400 frames', () => {
    let nextMovementFrame = 0;
    let movementFrameTotal = 0;

    for (const movement of FILM_MOVEMENTS) {
      expect(movement.from).toBe(nextMovementFrame);
      expect(movement.durationInFrames).toBeGreaterThan(0);
      expect(Number.isInteger(movement.durationInFrames)).toBe(true);

      let nextSceneFrame = movement.from;
      let sceneFrameTotal = 0;

      for (const scene of movement.scenes) {
        expect(scene.from).toBe(nextSceneFrame);
        expect(scene.durationInFrames).toBeGreaterThan(0);
        expect(Number.isInteger(scene.durationInFrames)).toBe(true);

        nextSceneFrame += scene.durationInFrames;
        sceneFrameTotal += scene.durationInFrames;
      }

      expect(sceneFrameTotal).toBe(movement.durationInFrames);
      expect(nextSceneFrame).toBe(
        movement.from + movement.durationInFrames,
      );

      nextMovementFrame += movement.durationInFrames;
      movementFrameTotal += movement.durationInFrames;
    }

    expect(nextMovementFrame).toBe(5400);
    expect(movementFrameTotal).toBe(5400);
  });

  it('monta a sequência completa sem lacunas entre cenas', () => {
    let nextFrame = 0;
    let frameTotal = 0;

    for (const scene of FILM_SCENES) {
      expect(scene.from).toBe(nextFrame);
      nextFrame += scene.durationInFrames;
      frameTotal += scene.durationInFrames;
    }

    expect(frameTotal).toBe(5400);
    expect(nextFrame).toBe(5400);
  });

  it('mantém legendas contíguas cobrindo o filme inteiro', () => {
    expect(CAPTION_COVERAGE).toEqual({
      from: 0,
      to: 5400,
      totalFrames: 5400,
    });
    expect(NARRATION_CAPTIONS[0]?.startFrame).toBe(0);
    expect(NARRATION_CAPTIONS.at(-1)?.endFrame).toBe(5400);

    for (let index = 1; index < NARRATION_CAPTIONS.length; index += 1) {
      expect(NARRATION_CAPTIONS[index].startFrame).toBe(
        NARRATION_CAPTIONS[index - 1].endFrame,
      );
    }

    expect(captionsToSrt()).toContain('00:00:00,000 --> 00:00:05,333');
    expect(captionsToSrt()).toContain('00:02:56,000 --> 00:03:00,000');
  });
});
