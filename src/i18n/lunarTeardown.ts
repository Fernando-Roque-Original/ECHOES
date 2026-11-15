import type { Locale } from './types';

export type LunarModulePartId =
  | 'ascent'
  | 'descent'
  | 'engine'
  | 'landing-gear'
  | 'antennas';

export type LunarModulePartCopy = {
  id: LunarModulePartId;
  label: string;
  eyebrow: string;
  summary: string;
  detail: string;
  sourceUrl: string;
  sourceLabel: string;
  color: string;
};

export type LunarModuleTeardownCopy = {
  sectionAriaLabel: string;
  diagramAriaLabel: string;
  diagramDescription: string;
  kicker: string;
  intro: string;
  viewer: {
    modeLabel: string;
    model3d: string;
    diagram: string;
    loading: string;
    fallback: string;
    scrollMode: string;
    modelCredit: string;
  };
  chips: {
    didactic: string;
    assemblies: string;
    exploded: string;
  };
  partsGroupLabel: string;
  detail: {
    partLabel: string;
    honestyTitle: string;
    honestyBody: string;
    sourceModel: string;
    sourceLanding: string;
    sourceModelUrl: string;
    sourceLandingUrl: string;
  };
  parts: LunarModulePartCopy[];
};

const NASA_MODEL_URL = 'https://science.nasa.gov/3d-resources/apollo-lunar-module/';
const NASA_LANDING_URL = 'https://science.nasa.gov/resource/apollo-11-landing-site/';

export const lunarModuleTeardownCopy: Record<
  Locale,
  LunarModuleTeardownCopy
> = {
  'pt-BR': {
    sectionAriaLabel: 'Demonstração didática do Módulo Lunar Eagle',
    diagramAriaLabel: 'Vista explodida didática do Módulo Lunar Eagle',
    diagramDescription:
      'Ilustração interpretativa com o estágio de subida, o estágio de descida, o motor de descida, o trem de pouso e as antenas do Eagle.',
    kicker: 'Apollo 11 · LM-5',
    intro:
      'O Eagle era um veículo em dois estágios. Explore os conjuntos que tornavam possível descer, pousar e voltar à órbita lunar.',
    viewer: {
      modeLabel: 'Modo de visualização do Eagle',
      model3d: 'Modelo 3D NASA',
      diagram: 'Esquema didático',
      loading: 'Carregando modelo NASA…',
      fallback:
        'O modelo 3D não carregou. O esquema didático continua disponível.',
      scrollMode: 'A rotação acompanha a leitura científica',
      modelCredit: 'Modelo NASA · sem separação mecânica real',
    },
    chips: {
      didactic: 'Vista didática',
      assemblies: '5 conjuntos',
      exploded: 'Separação',
    },
    partsGroupLabel: 'Conjuntos do Módulo Lunar Eagle',
    detail: {
      partLabel: 'CONJUNTO',
      honestyTitle: 'O que esta vista é',
      honestyBody:
        'Ilustração esquemática e interpretativa baseada em referências públicas da NASA. Não é CAD oficial, não reproduz cada componente interno e não representa uma sequência real de desmontagem.',
      sourceModel: 'NASA · modelo 3D do Módulo Lunar',
      sourceLanding: 'NASA · local de pouso da Apollo 11',
      sourceModelUrl: NASA_MODEL_URL,
      sourceLandingUrl: NASA_LANDING_URL,
    },
    parts: [
      {
        id: 'ascent',
        label: 'Estágio de subida',
        eyebrow: 'Tripulação',
        summary:
          'A cabine pressurizada que levou Armstrong e Aldrin de volta à órbita lunar.',
        detail:
          'O estágio de subida continha a cabine da tripulação, os controles de voo e o motor usado para decolar da Lua. Depois do encontro com o módulo de comando Columbia, ele não voltou à superfície.',
        sourceUrl: NASA_MODEL_URL,
        sourceLabel: 'NASA · anatomia do Módulo Lunar',
        color: '#f2c26b',
      },
      {
        id: 'descent',
        label: 'Estágio de descida',
        eyebrow: 'Base de pouso',
        summary:
          'A base que funcionou como plataforma de pouso e permaneceu na Lua.',
        detail:
          'O estágio de descida carregava o motor de descida, os tanques e boa parte do suprimento necessário para o pouso. Na Apollo 11, ele ficou para trás na superfície lunar.',
        sourceUrl: NASA_LANDING_URL,
        sourceLabel: 'NASA · local de pouso da Apollo 11',
        color: '#d9a441',
      },
      {
        id: 'engine',
        label: 'Motor de descida',
        eyebrow: 'Propulsão',
        summary:
          'O motor que desacelerou o Eagle durante a descida final.',
        detail:
          'O motor de descida era ajustável em potência e permitia controlar a aproximação ao solo. Nesta vista, sua posição e forma são esquemáticas.',
        sourceUrl: NASA_MODEL_URL,
        sourceLabel: 'NASA · modelo de referência do LM',
        color: '#d56f45',
      },
      {
        id: 'landing-gear',
        label: 'Trem de pouso',
        eyebrow: 'Contato com o solo',
        summary:
          'As pernas e as sapatas que estabilizaram o Eagle na superfície.',
        detail:
          'Quatro pernas absorveram o contato com o regolito. Sensores presos às pernas ajudaram a indicar à tripulação quando o pouso havia ocorrido.',
        sourceUrl: NASA_MODEL_URL,
        sourceLabel: 'NASA · engenharia do pouso lunar',
        color: '#9acbd4',
      },
      {
        id: 'antennas',
        label: 'Antenas e sensores',
        eyebrow: 'Comunicação',
        summary:
          'Os sistemas que mantiveram o Eagle em contato com a Terra e com Columbia.',
        detail:
          'Antenas de comunicação e rastreamento faziam parte dos conjuntos de superfície. O esquema destaca apenas alguns pontos visíveis; a posição de cada equipamento não é um desenho técnico exato.',
        sourceUrl: NASA_MODEL_URL,
        sourceLabel: 'NASA · sistemas de comunicação do LM',
        color: '#a7ddd2',
      },
    ],
  },
  en: {
    sectionAriaLabel: 'Educational demonstration of the Eagle Lunar Module',
    diagramAriaLabel: 'Educational exploded view of the Eagle Lunar Module',
    diagramDescription:
      'Interpretive illustration showing the Eagle ascent stage, descent stage, descent engine, landing gear, and antennas.',
    kicker: 'Apollo 11 · LM-5',
    intro:
      'Eagle was a two-stage vehicle. Explore the assemblies that made it possible to descend, land, and return to lunar orbit.',
    viewer: {
      modeLabel: 'Eagle viewing mode',
      model3d: 'NASA 3D model',
      diagram: 'Didactic schematic',
      loading: 'Loading NASA model…',
      fallback:
        'The 3D model did not load. The didactic schematic remains available.',
      scrollMode: 'Rotation follows the scientific reading',
      modelCredit: 'NASA model · no real mechanical separation',
    },
    chips: {
      didactic: 'Didactic view',
      assemblies: '5 assemblies',
      exploded: 'Separation',
    },
    partsGroupLabel: 'Eagle Lunar Module assemblies',
    detail: {
      partLabel: 'ASSEMBLY',
      honestyTitle: 'What this view is',
      honestyBody:
        'A schematic, interpretive illustration based on public NASA references. It is not official CAD, does not reproduce every internal component, and does not represent a real disassembly sequence.',
      sourceModel: 'NASA · Lunar Module 3D resource',
      sourceLanding: 'NASA · Apollo 11 landing site',
      sourceModelUrl: NASA_MODEL_URL,
      sourceLandingUrl: NASA_LANDING_URL,
    },
    parts: [
      {
        id: 'ascent',
        label: 'Ascent stage',
        eyebrow: 'Crew',
        summary:
          'The pressurized cabin that carried Armstrong and Aldrin back to lunar orbit.',
        detail:
          'The ascent stage contained the crew cabin, flight controls, and the engine used to lift off from the Moon. After rendezvousing with the command module Columbia, it did not return to the surface.',
        sourceUrl: NASA_MODEL_URL,
        sourceLabel: 'NASA · Lunar Module anatomy',
        color: '#f2c26b',
      },
      {
        id: 'descent',
        label: 'Descent stage',
        eyebrow: 'Landing platform',
        summary:
          'The base that served as the landing platform and remained on the Moon.',
        detail:
          'The descent stage carried the descent engine, propellant tanks, and much of the equipment needed to land. On Apollo 11, it was left behind on the lunar surface.',
        sourceUrl: NASA_LANDING_URL,
        sourceLabel: 'NASA · Apollo 11 landing site',
        color: '#d9a441',
      },
      {
        id: 'engine',
        label: 'Descent engine',
        eyebrow: 'Propulsion',
        summary:
          'The engine that slowed Eagle during its final descent.',
        detail:
          'The descent engine could be throttled to control the approach to the surface. Its placement and shape are schematic in this view.',
        sourceUrl: NASA_MODEL_URL,
        sourceLabel: 'NASA · LM reference model',
        color: '#d56f45',
      },
      {
        id: 'landing-gear',
        label: 'Landing gear',
        eyebrow: 'Surface contact',
        summary:
          'The legs and footpads that stabilized Eagle on the surface.',
        detail:
          'Four legs absorbed contact with the regolith. Probes attached to the legs helped indicate to the crew when landing had occurred.',
        sourceUrl: NASA_MODEL_URL,
        sourceLabel: 'NASA · lunar landing engineering',
        color: '#9acbd4',
      },
      {
        id: 'antennas',
        label: 'Antennas and sensors',
        eyebrow: 'Communication',
        summary:
          'The systems that kept Eagle in contact with Earth and Columbia.',
        detail:
          'Communication and tracking antennas were part of the surface assemblies. This schematic highlights only some visible features; each item is not shown at an exact engineering position.',
        sourceUrl: NASA_MODEL_URL,
        sourceLabel: 'NASA · LM communication systems',
        color: '#a7ddd2',
      },
    ],
  },
};

export function getLunarModuleTeardownCopy(
  locale: Locale,
): LunarModuleTeardownCopy {
  return lunarModuleTeardownCopy[locale];
}
