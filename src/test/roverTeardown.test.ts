import { describe, expect, it } from 'vitest';
import {
  getTeardownLayerByMaterial,
  roverTeardownLayers,
  roverTeardownMaterialCount,
} from '../content/roverTeardown';

describe('official GLB teardown content', () => {
  it('maps all nine NASA materials exactly once', () => {
    const materials = roverTeardownLayers.flatMap((layer) => layer.materials);

    expect(roverTeardownMaterialCount).toBe(9);
    expect(new Set(materials).size).toBe(9);
    expect(materials).toEqual(
      expect.arrayContaining([
        'tex_instruments',
        'tex_body_n',
        'tex_suspension_n',
        'Silver',
        'tex_panels_n',
        'tex_panels2_n',
        'tex_mast',
        'foil_silver',
        'tex_arm',
      ]),
    );

    for (const material of materials) {
      expect(getTeardownLayerByMaterial(material)?.materials).toContain(material);
    }
    expect(getTeardownLayerByMaterial('material-inexistente')).toBeUndefined();
  });

  it('keeps layer identifiers and educational copy unique and complete', () => {
    const ids = roverTeardownLayers.map((layer) => layer.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const layer of roverTeardownLayers) {
      expect(layer.label.trim().length).toBeGreaterThan(2);
      expect(layer.summary.length).toBeGreaterThan(35);
      expect(layer.detail.length).toBeGreaterThan(70);
      expect(layer.explode.some((value) => value !== 0)).toBe(true);
      expect(layer.sourceUrl).toMatch(/^https:\/\/[^/]*nasa\.gov\//);
      expect(layer.sourceLabel).toMatch(/NASA/);
    }
  });

  it('does not describe distributed hardware materials as a real subsystem', () => {
    const hardware = roverTeardownLayers.find(
      (layer) => layer.id === 'hardware',
    );

    expect(hardware?.detail).toContain('apenas para leitura visual');
    expect(hardware?.detail).toContain('não formam um subsistema separável real');
  });

  it('starts every separation vector finite and compact enough for the viewport', () => {
    for (const layer of roverTeardownLayers) {
      expect(layer.explode.every(Number.isFinite)).toBe(true);
      expect(Math.max(...layer.explode.map(Math.abs))).toBeLessThanOrEqual(1);
    }
  });
});
