export type EvidenceKind =
  | 'foto-real'
  | 'dado-real'
  | 'mapa-cientifico'
  | 'modelo-3d-nasa'
  | 'textura-3d-nasa'
  | 'reconstrucao-artistica'
  | 'narracao-da-equipe';

export type MediaAsset = {
  src?: string;
  externalUrl?: string;
  alt: string;
  kind: EvidenceKind;
  credit: string;
  caption: string;
};

export type Chapter = {
  id: string;
  title: string;
  text: string;
  audioSrc?: string;
  media?: MediaAsset;
};

export type Hotspot = {
  id: string;
  label: string;
  detail: string;
  sourceUrl: string;
  position?: [number, number, number];
  screenPosition?: { left: string; top: string };
};

export type MissionStory = {
  id: string;
  world: 'mars' | 'moon';
  title: string;
  tagline: string;
  artifactModel?: string;
  artifactFallbackImage?: MediaAsset;
  mapImage?: MediaAsset;
  locationLabel: string;
  approximateLocation: boolean;
  chapters: Chapter[];
  hotspots: Hotspot[];
  finalEvidence: MediaAsset;
  quiz: {
    prompt: string;
    answers: string[];
    correctAnswerIndex: number;
    explanation: string;
  };
  sources: string[];
};

export const evidenceLabels: Record<EvidenceKind, string> = {
  'foto-real': 'Foto real NASA',
  'dado-real': 'Dado real NASA',
  'mapa-cientifico': 'Mapa científico NASA',
  'modelo-3d-nasa': 'Modelo oficial NASA',
  'textura-3d-nasa': 'Textura 3D NASA',
  'reconstrucao-artistica': 'Reconstrução artística',
  'narracao-da-equipe': 'Narração produzida pela equipe',
};

export const nasaUrls = {
  opportunityMission: 'https://science.nasa.gov/mission/mer-opportunity/',
  opportunityEnd:
    'https://www.nasa.gov/news-release/nasas-record-setting-opportunity-rover-mission-on-mars-comes-to-end/',
  opportunityLastMessage: 'https://science.nasa.gov/resource/opportunitys-last-message/',
  opportunitySelfie:
    'https://science.nasa.gov/resource/self-portrait-by-opportunity-mars-rover-in-january-2014/',
  opportunityFinalPanorama:
    'https://science.nasa.gov/resource/opportunity-rovers-final-mars-images/',
  opportunityTraverse:
    'https://science.nasa.gov/photojournal/opportunitys-final-traverse-map/',
  opportunityModel:
    'https://science.nasa.gov/resource/spirit-and-opportunity-rover-3d-model/',
  opportunityPoster:
    'https://mars.nasa.gov/files/resources/OpportunityPoster.pdf',
  opportunityInstruments:
    'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-instruments/',
  marsTexture: 'https://science.nasa.gov/3d-resources/mars/',
  opportunityBerries: 'https://science.nasa.gov/resource/berries-on-the-ground/',
  marsTrek: 'https://trek.nasa.gov/mars/',
  apolloNext: 'https://science.nasa.gov/resource/apollo-11-landing-site/',
  nssdca: 'https://nssdc.gsfc.nasa.gov/',
};

