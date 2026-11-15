import { nasaUrls } from './missions';

export type RoverSystem = 'corpo' | 'energia' | 'sensores' | 'comunicacao' | 'mobilidade';

export type RoverSchematicPart = {
  id:
    | 'body'
    | 'solar-panels'
    | 'pancam-mast'
    | 'navigation-cameras'
    | 'high-gain-antenna'
    | 'radio-antennas'
    | 'robotic-arm'
    | 'hazard-cameras'
    | 'rocker-bogie'
    | 'wheels'
    | 'internal-core';
  label: string;
  system: RoverSystem;
  summary: string;
  detail: string;
  inside?: string;
  sourceUrl: string;
  sourceLabel: string;
  explode: { x: number; y: number; rotate?: number };
  callout: { x: number; y: number };
};

export const roverSystems: Array<{
  id: RoverSystem | 'todos';
  label: string;
}> = [
  { id: 'todos', label: 'Todas as peças' },
  { id: 'energia', label: 'Energia' },
  { id: 'sensores', label: 'Sentidos' },
  { id: 'comunicacao', label: 'Comunicação' },
  { id: 'mobilidade', label: 'Mobilidade' },
  { id: 'corpo', label: 'Corpo e interior' },
];

export const roverSchematicParts: RoverSchematicPart[] = [
  {
    id: 'solar-panels',
    label: 'Painéis solares',
    system: 'energia',
    summary: 'A usina de energia que transformava luz em eletricidade.',
    detail:
      'As asas cobertas por células solares ficavam abertas como uma grande mesa. Com o tempo, a poeira marciana foi cobrindo o vidro e reduzindo a energia disponível.',
    sourceUrl: nasaUrls.opportunityInstruments,
    sourceLabel: 'NASA · instrumentos do Spirit e Opportunity',
    explode: { x: 0, y: -78 },
    callout: { x: 142, y: 172 },
  },
  {
    id: 'pancam-mast',
    label: 'Mastro e Pancam',
    system: 'sensores',
    summary: 'A torre com os dois olhos coloridos do rover.',
    detail:
      'O mastro elevava a Pancam acima da poeira. Suas duas câmeras olhavam da mesma direção com pequena diferença de posição, como nossos olhos, para medir distâncias e montar vistas panorâmicas.',
    sourceUrl: nasaUrls.opportunityInstruments,
    sourceLabel: 'NASA · Pancam',
    explode: { x: 0, y: -84 },
    callout: { x: 590, y: 116 },
  },
  {
    id: 'navigation-cameras',
    label: 'Câmeras de navegação',
    system: 'sensores',
    summary: 'Um par de olhos em preto e branco para escolher o caminho.',
    detail:
      'As Navcams tinham um campo de visão mais amplo que a Pancam. Elas ajudavam a equipe a enxergar obstáculos próximos e planejar os próximos metros do percurso.',
    sourceUrl: nasaUrls.opportunityPoster,
    sourceLabel: 'NASA · pôster com o rover identificado',
    explode: { x: -98, y: -102 },
    callout: { x: 232, y: 104 },
  },
  {
    id: 'high-gain-antenna',
    label: 'Antena de alto ganho',
    system: 'comunicacao',
    summary: 'A antena que apontava para a Terra.',
    detail:
      'A antena parabólica de alto ganho permitia conversar diretamente com as grandes antenas da Terra. O rover precisava apontá-la com cuidado para enviar dados e receber comandos.',
    sourceUrl: nasaUrls.opportunityPoster,
    sourceLabel: 'NASA · pôster com o rover identificado',
    explode: { x: 98, y: -58 },
    callout: { x: 816, y: 158 },
  },
  {
    id: 'radio-antennas',
    label: 'Antenas de baixo ganho e UHF',
    system: 'comunicacao',
    summary: 'Um caminho de reserva e uma ponte pelos orbitadores.',
    detail:
      'A antena de baixo ganho funcionava como alternativa mais lenta. A antena UHF enviava grandes pacotes para sondas em órbita de Marte, que depois repassavam os dados para a Terra.',
    sourceUrl: nasaUrls.opportunityPoster,
    sourceLabel: 'NASA · pôster com o rover identificado',
    explode: { x: -92, y: -68 },
    callout: { x: 192, y: 228 },
  },
  {
    id: 'robotic-arm',
    label: 'Braço robótico',
    system: 'sensores',
    summary: 'O braço que aproximava ferramentas das rochas.',
    detail:
      'No braço ficavam ferramentas como o espectrômetro Mössbauer, o APXS, o imageador microscópico e o RAT. Juntas, elas examinavam a textura e a composição das rochas sem trazer amostras para a Terra.',
    sourceUrl: nasaUrls.opportunityInstruments,
    sourceLabel: 'NASA · instrumentos do braço',
    explode: { x: -132, y: 82, rotate: -7 },
    callout: { x: 104, y: 486 },
  },
  {
    id: 'hazard-cameras',
    label: 'Câmeras de perigo',
    system: 'sensores',
    summary: 'Câmeras baixas que vigiavam pedras e buracos.',
    detail:
      'Pares de Hazard Cameras olhavam para a frente e para trás, perto do chão. Elas davam ao rover e à equipe uma visão imediata do terreno sob as rodas e do próximo obstáculo.',
    sourceUrl: nasaUrls.opportunityPoster,
    sourceLabel: 'NASA · pôster com o rover identificado',
    explode: { x: -28, y: 72 },
    callout: { x: 262, y: 566 },
  },
  {
    id: 'body',
    label: 'Corpo e caixa aquecida',
    system: 'corpo',
    summary: 'A “mochila” que protegia a eletrônica do frio.',
    detail:
      'A Warm Electronics Box ficava no centro do rover. Ela ajudava a manter computadores, baterias e outros sistemas em uma faixa de temperatura mais segura durante as noites geladas de Marte.',
    inside:
      'O corte mostra placas, baterias e caminhos de energia de forma simplificada. A posição dos blocos internos é ilustrativa, não uma vista de engenharia.',
    sourceUrl: nasaUrls.opportunityInstruments,
    sourceLabel: 'NASA · sistemas do rover',
    explode: { x: 28, y: 18 },
    callout: { x: 642, y: 360 },
  },
  {
    id: 'internal-core',
    label: 'Núcleo interno ilustrativo',
    system: 'corpo',
    summary: 'Computadores, baterias e eletrônica dentro do corpo.',
    detail:
      'Esta camada mostra, de modo simplificado, os sistemas que ficavam abrigados na caixa central. O desenho não representa o arranjo exato dos componentes do Opportunity.',
    inside:
      'Use “Ver por dentro” para tornar a casca translúcida. As formas internas são ilustrativas e servem para explicar a função, não para representar fiação ou medidas reais.',
    sourceUrl: nasaUrls.opportunityPoster,
    sourceLabel: 'NASA · pôster e vista externa',
    explode: { x: 0, y: 62 },
    callout: { x: 684, y: 448 },
  },
  {
    id: 'rocker-bogie',
    label: 'Suspensão rocker-bogie',
    system: 'mobilidade',
    summary: 'Barras articuladas que mantêm as seis rodas no chão.',
    detail:
      'O sistema rocker-bogie ligava as rodas em dois conjuntos articulados. Quando uma roda subia em uma pedra, as barras distribuíam o movimento e ajudavam as outras a continuar em contato com o solo.',
    sourceUrl: nasaUrls.opportunityPoster,
    sourceLabel: 'NASA · pôster com o rover identificado',
    explode: { x: 0, y: 72 },
    callout: { x: 742, y: 510 },
  },
  {
    id: 'wheels',
    label: 'Seis rodas',
    system: 'mobilidade',
    summary: 'Cada roda tinha seu próprio motor.',
    detail:
      'As seis rodas podiam girar independentemente. Isso ajudava o Opportunity a virar com precisão, subir terrenos irregulares e até escapar de areia solta.',
    sourceUrl: nasaUrls.opportunityMission,
    sourceLabel: 'NASA · missão Opportunity',
    explode: { x: 0, y: 108 },
    callout: { x: 824, y: 594 },
  },
];

