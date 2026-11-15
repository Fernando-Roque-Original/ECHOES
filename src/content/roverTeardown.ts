import {
  roverTeardownCopy,
  type RoverTeardownLayerCopy,
} from '../i18n/roverTeardown';
import { nasaUrls } from './missions';

export type RoverTeardownLayerId =
  | 'body'
  | 'solar'
  | 'mast'
  | 'instruments'
  | 'mobility'
  | 'hardware';

export type RoverTeardownLayer = {
  id: RoverTeardownLayerId;
  label: string;
  eyebrow: string;
  color: string;
  materials: string[];
  explode: [number, number, number];
  summary: string;
  detail: string;
  sourceUrl: string;
  sourceLabel: string;
};

type RoverTeardownLayerVisual = Omit<
  RoverTeardownLayer,
  keyof RoverTeardownLayerCopy
>;

/**
 * The NASA GLB is one mesh with nine material groups, not an engineered
 * assembly. These layers follow those authored material names so the visual
 * teardown stays tied to the supplied geometry instead of inventing parts.
 */
const roverTeardownLayerVisuals: RoverTeardownLayerVisual[] = [
  {
    id: 'body',
    color: '#f2c26b',
    materials: ['tex_body_n'],
    explode: [0, 0.06, 0],
    sourceUrl: nasaUrls.opportunityPoster,
  },
  {
    id: 'solar',
    color: '#8bc7dc',
    materials: ['tex_panels_n', 'tex_panels2_n'],
    explode: [0, 0.92, 0.02],
    sourceUrl: nasaUrls.opportunityInstruments,
  },
  {
    id: 'mast',
    color: '#d9a7ff',
    materials: ['tex_mast'],
    explode: [0.08, 0.82, -0.22],
    sourceUrl: nasaUrls.opportunityInstruments,
  },
  {
    id: 'instruments',
    color: '#ff997a',
    materials: ['tex_instruments', 'tex_arm'],
    explode: [0.72, 0.04, 0.64],
    sourceUrl: nasaUrls.opportunityInstruments,
  },
  {
    id: 'mobility',
    color: '#9ac2b2',
    materials: ['tex_suspension_n'],
    explode: [0.02, -0.78, 0.08],
    sourceUrl: nasaUrls.opportunityPoster,
  },
  {
    id: 'hardware',
    color: '#cbd5dc',
    materials: ['Silver', 'foil_silver'],
    explode: [-0.64, 0.18, -0.48],
    sourceUrl: nasaUrls.opportunityModel,
  },
];

/**
 * PT-BR remains the compatibility default for existing consumers. The
 * localized copy lives in i18n/roverTeardown.ts and is shared with the
 * component instead of being duplicated here.
 */
export const roverTeardownLayers: RoverTeardownLayer[] =
  roverTeardownLayerVisuals.map((layer) => ({
    ...layer,
    ...roverTeardownCopy['pt-BR'].layerContent[layer.id],
  }));

export const roverTeardownMaterialCount = roverTeardownLayers.reduce(
  (total, layer) => total + layer.materials.length,
  0,
);

export function getTeardownLayerByMaterial(
  materialName: string | undefined,
): RoverTeardownLayer | undefined {
  if (!materialName) return undefined;
  return roverTeardownLayers.find((layer) =>
    layer.materials.includes(materialName),
  );
}
