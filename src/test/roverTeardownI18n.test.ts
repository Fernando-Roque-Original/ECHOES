import { describe, expect, it } from 'vitest';
import {
  roverTeardownLayers,
  roverTeardownMaterialCount,
} from '../content/roverTeardown';
import { getRoverTeardownCopy } from '../i18n/roverTeardown';
import type { Locale } from '../i18n/types';

const locales: Locale[] = ['pt-BR', 'en'];

describe('localized rover teardown content', () => {
  it('provides complete interface copy and layer content for every locale', () => {
    for (const locale of locales) {
      const copy = getRoverTeardownCopy(locale);

      expect(Object.keys(copy.layerContent)).toHaveLength(
        roverTeardownLayers.length,
      );

      for (const layer of roverTeardownLayers) {
        const localized = copy.layerContent[layer.id];

        expect(localized.label.trim().length).toBeGreaterThan(2);
        expect(localized.eyebrow.trim().length).toBeGreaterThan(2);
        expect(localized.summary.length).toBeGreaterThan(35);
        expect(localized.detail.length).toBeGreaterThan(70);
        expect(localized.sourceLabel).toContain('NASA');
      }

      expect(copy.sectionAriaLabel.length).toBeGreaterThan(10);
      expect(copy.stage.ariaLabel.length).toBeGreaterThan(20);
      expect(copy.detail.honestyBody.length).toBeGreaterThan(40);
    }
  });

  it('keeps the six-group educational disclaimer tied to the nine materials', () => {
    for (const locale of locales) {
      const copy = getRoverTeardownCopy(locale);
      const disclaimer = copy.disclaimer(
        roverTeardownLayers.length,
        roverTeardownMaterialCount,
      );
      const help = copy.stage.help(
        roverTeardownLayers.length,
        roverTeardownMaterialCount,
      );

      expect(disclaimer).toContain(String(roverTeardownLayers.length));
      expect(disclaimer).toContain(String(roverTeardownMaterialCount));
      expect(help).toContain(String(roverTeardownLayers.length));
      expect(help).toContain(String(roverTeardownMaterialCount));

      const requiredDisclaimerTerms =
        locale === 'pt-BR'
          ? ['grupos visuais educacionais', 'desmontagem real', 'manual oficial']
          : ['educational visual groups', 'real teardown', 'official'];

      for (const term of requiredDisclaimerTerms) {
        expect(disclaimer).toContain(term);
      }
    }
  });

  it('uses distinct Portuguese and English layer copy', () => {
    const pt = getRoverTeardownCopy('pt-BR');
    const en = getRoverTeardownCopy('en');

    expect(pt.layerContent.body.label).not.toBe(en.layerContent.body.label);
    expect(pt.detail.chooseLayerTitle).not.toBe(
      en.detail.chooseLayerTitle,
    );
    expect(pt.actions.tourStart).not.toBe(en.actions.tourStart);
  });
});
