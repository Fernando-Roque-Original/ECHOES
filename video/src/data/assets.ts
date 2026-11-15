import { staticFile } from 'remotion';

export const FILM_ASSETS = {
  marsTexture: staticFile('assets/maps/mars-texture-nasa.jpg'),
  traverseMap: staticFile('assets/maps/opportunity-traverse-nasa.jpg'),
  finalPanorama: staticFile('assets/images/opportunity-final-panorama.jpg'),
  roverSelfie: staticFile('assets/images/opportunity-selfie.jpg'),
  lastSignal: staticFile('assets/images/opportunity-last-message.jpg'),
  hematite: staticFile('assets/images/opportunity-hematite-berries.jpg'),
  milkyWay: staticFile('assets/space/milky-way-eso.jpg'),
  mercury: staticFile('assets/planets/mercury-solarsystemscope.jpg'),
  venus: staticFile('assets/planets/venus-solarsystemscope.jpg'),
  earth: staticFile('assets/planets/earth-solarsystemscope.jpg'),
  moon: staticFile('assets/planets/moon-solarsystemscope.jpg'),
  jupiter: staticFile('assets/planets/jupiter-solarsystemscope.jpg'),
  saturn: staticFile('assets/planets/saturn-solarsystemscope.jpg'),
  saturnRing: staticFile('assets/planets/saturn-ring-solarsystemscope.png'),
  uranus: staticFile('assets/planets/uranus-solarsystemscope.jpg'),
  neptune: staticFile('assets/planets/neptune-solarsystemscope.jpg'),
} as const;

export const FACT_CREDITS = {
  opportunity:
    'NASA Science / NASA JPL-Caltech. Opportunity: missão MER-B.',
  selfie:
    'NASA/JPL-Caltech/Cornell/ASU — PIA17759, autorretrato de janeiro de 2014.',
  panorama:
    'NASA/JPL-Caltech/Cornell/ASU — PIA-22908, panorama final.',
  lastSignal:
    'NASA/JPL-Caltech — PIA22929, último conjunto de dados recebido.',
  hematite:
    'NASA/JPL-Caltech/Cornell/USGS — PIA05273, esferas de hematita.',
  traverse:
    'NASA/JPL-Caltech/University of Arizona — PIA23178, mapa da rota final.',
  solarSystem:
    'Texturas planetárias: Solar System Scope, CC BY 4.0. Via Láctea: ESO/S. Brunier, CC BY 4.0.',
} as const;
