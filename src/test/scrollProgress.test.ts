import { describe, expect, it } from 'vitest';
import { getSectionProgress } from '../experience/scrollProgress';

describe('scroll section progress', () => {
  it('clamps progress before and after the section', () => {
    expect(getSectionProgress(-200, 100, 800)).toBe(0);
    expect(getSectionProgress(1200, 100, 800)).toBe(1);
  });

  it('maps the scrollable part of a sticky section to 0..1', () => {
    expect(getSectionProgress(500, 100, 800)).toBe(0.5);
  });
});
