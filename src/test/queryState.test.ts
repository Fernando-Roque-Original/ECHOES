import { describe, expect, it } from 'vitest';
import { readQueryState } from '../app/queryState';

describe('experience query state', () => {
  it('opens the cinematic experience by default', () => {
    expect(readQueryState('')).toEqual({
      mode: 'cinematic',
      world: null,
    });
  });

  it('reads the archive mode and a valid world', () => {
    expect(readQueryState('?mode=archive&world=moon')).toEqual({
      mode: 'archive',
      world: 'moon',
    });
  });

  it('ignores unknown worlds and modes', () => {
    expect(readQueryState('?mode=other&world=venus')).toEqual({
      mode: 'cinematic',
      world: null,
    });
  });
});
