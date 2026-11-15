import type { RoverTeardownLayerId } from '../content/roverTeardown';
import type { Locale } from './types';

export type RoverTeardownLayerCopy = {
  label: string;
  eyebrow: string;
  summary: string;
  detail: string;
  sourceLabel: string;
};

type CountCopy = (layerCount: number, materialCount: number) => string;

export type RoverTeardownCopy = {
  sectionAriaLabel: string;
  kicker: string;
  intro: string;
  actions: {
    tourStart: string;
    tourPause: string;
    reducedMotionTourTitle: string;
    reassemble: string;
    openAll: string;
    explore3d: string;
    resumeJourney: string;
  };
  separation: {
    label: string;
    assembled: string;
    open: string;
  };
  layersGroupLabel: string;
  stage: {
    ariaLabel: string;
    renderFallback: string;
    officialGlb: string;
    materialGroups: (count: number) => string;
    openPercent: (percent: number) => string;
    focusEyebrowFallback: string;
    focusLabelFallback: string;
    help: CountCopy;
  };
  detail: {
    layerLabel: string;
    exploreMode: string;
    exploreEyebrow: string;
    chooseLayerTitle: string;
    exploreSummary: string;
    exploreCopy: string;
    honestyTitle: string;
    honestyBody: string;
    modelSourceLabel: string;
  };
  disclaimer: CountCopy;
  layerContent: Record<RoverTeardownLayerId, RoverTeardownLayerCopy>;
  announcements: {
    initial: string;
    tourLayer: (label: string, summary: string) => string;
    selectedLayer: (label: string) => string;
    reassembled: string;
    tourPaused: string;
    tourStarted: string;
    allOpen: string;
    exploreStarted: string;
    exploreEnded: string;
    separation: (percent: number) => string;
  };
};

export const roverTeardownCopy: Record<Locale, RoverTeardownCopy> = {
  'pt-BR': {
    sectionAriaLabel: 'Leitura em camadas do Opportunity',
    kicker: 'Modelo NASA / leitura por materiais',
    intro:
      'Arraste para orbitar. Toque ou clique em uma superfície do modelo, ou use as camadas abaixo para navegar pela vista.',
    actions: {
      tourStart: 'Tour guiado',
      tourPause: 'Pausar tour',
      reducedMotionTourTitle:
        'Tour automático desativado com movimento reduzido',
      reassemble: 'Reunir visualmente',
      openAll: 'Abrir tudo',
      explore3d: 'Explorar em 3D',
      resumeJourney: 'Voltar ao percurso',
    },
    separation: {
      label: 'Separação das camadas',
      assembled: 'Camadas reunidas',
      open: 'Camadas abertas',
    },
    layersGroupLabel: 'Camadas de materiais do modelo',
    stage: {
      ariaLabel:
        'Modelo 3D oficial do Opportunity em vista explodida didática. Use os botões de camada como alternativa acessível.',
      renderFallback:
        'O modelo 3D não pôde ser iniciado. O esquema ilustrativo continua disponível na outra aba.',
      officialGlb: 'GLB oficial',
      materialGroups: (count) => `${count} grupos de material`,
      openPercent: (percent) => `${percent}% aberto`,
      focusEyebrowFallback: 'Leitura de superfícies',
      focusLabelFallback: 'Opportunity completo',
      help: (layerCount, materialCount) =>
        `Arraste o modelo com o mouse ou toque para orbitar. As ${layerCount} camadas são agrupamentos visuais educacionais derivados dos ${materialCount} materiais do arquivo GLB da NASA. Elas não correspondem a peças removíveis no projeto real.`,
    },
    detail: {
      layerLabel: 'CAMADA',
      exploreMode: 'MODO EXPLORAR',
      exploreEyebrow: 'Do exterior ao detalhe',
      chooseLayerTitle: 'Escolha uma camada',
      exploreSummary:
        'O modelo inteiro é o centro. A separação revela o que cada grupo de material ajuda a contar.',
      exploreCopy:
        'O arquivo da NASA é uma malha única organizada por nove materiais. Esta leitura os distribui em seis grupos visuais educacionais para explicar forma e função — não para sugerir uma ordem real de desmontagem.',
      honestyTitle: 'O que esta vista é',
      honestyBody:
        'Uma experiência educacional sobre o GLB oficial. Os contornos internos exatos, a fiação e a sequência de montagem não são fornecidos pelo arquivo.',
      modelSourceLabel: 'NASA/JPL-Caltech · modelo 3D',
    },
    disclaimer: (layerCount, materialCount) =>
      `Superfícies separadas a partir dos ${materialCount} grupos de material do GLB oficial. Esta é uma leitura em ${layerCount} grupos visuais educacionais derivados dos ${materialCount} grupos de materiais; a vista é ilustrativa e não representa uma desmontagem real, peças internas, tolerâncias ou um manual oficial do Opportunity.`,
    layerContent: {
      body: {
        label: 'Corpo e proteção térmica',
        eyebrow: 'Estrutura central',
        summary: 'A caixa que reunia e protegia os sistemas centrais.',
        detail:
          'A superfície do corpo aparece em dourado no experimento. O GLB não informa quais chapas, componentes ou camadas térmicas existiam por baixo dela.',
        sourceLabel: 'NASA · pôster com o rover identificado',
      },
      solar: {
        label: 'Painéis solares',
        eyebrow: 'Energia',
        summary: 'As asas que transformavam luz marciana em eletricidade.',
        detail:
          'Os dois grupos de material dos painéis podem ser levantados juntos. A poeira acumulada ao longo da missão reduziu a energia disponível para o rover.',
        sourceLabel: 'NASA · instrumentos do Spirit e Opportunity',
      },
      mast: {
        label: 'Mastro e câmeras',
        eyebrow: 'Sentidos',
        summary: 'A torre que elevava os olhos do rover acima da poeira.',
        detail:
          'Esta camada contém o mastro, a Pancam e as câmeras de navegação que estavam ligadas a ele. A separação mostra a posição do conjunto, não uma sequência de montagem.',
        sourceLabel: 'NASA · Pancam e Navcam',
      },
      instruments: {
        label: 'Braço e instrumentos',
        eyebrow: 'Análise',
        summary: 'As ferramentas que examinavam rochas e o solo.',
        detail:
          'O braço robótico levava o APXS, o espectrômetro Mössbauer, o imageador microscópico e o RAT até os alvos. O agrupamento reúne superfícies do braço e dos instrumentos.',
        sourceLabel: 'NASA · instrumentos científicos',
      },
      mobility: {
        label: 'Suspensão e rodas',
        eyebrow: 'Mobilidade',
        summary: 'A estrutura rocker-bogie e o conjunto de seis rodas.',
        detail:
          'As barras articuladas mantinham as rodas em contato com o terreno. Esta camada visual destaca a geometria de mobilidade fornecida no modelo oficial.',
        sourceLabel: 'NASA · geometria rocker-bogie',
      },
      hardware: {
        label: 'Superfícies metálicas distribuídas',
        eyebrow: 'Detalhes',
        summary:
          'Pequenas superfícies metálicas distribuídas pelo rover.',
        detail:
          'Os materiais “Silver” e “foil_silver” incluem peças e revestimentos em várias regiões. Eles são agrupados apenas para leitura visual; não formam um subsistema separável real.',
        sourceLabel: 'NASA · modelo 3D oficial',
      },
    },
    announcements: {
      initial:
        'Camadas reunidas. Escolha uma camada para destacar as superfícies.',
      tourLayer: (label, summary) => `Tour guiado: ${label}. ${summary}`,
      selectedLayer: (label) => `Camada selecionada: ${label}.`,
      reassembled: 'Camadas reunidas visualmente.',
      tourPaused: 'Tour guiado pausado.',
      tourStarted:
        'Tour guiado iniciado. Cada camada recebe uma pausa.',
      allOpen: 'Todas as camadas separadas ao máximo.',
      exploreStarted:
        'Modo de exploração ativado. O percurso está pausado; arraste para orbitar o rover.',
      exploreEnded: 'Exploração encerrada. Percurso retomado.',
      separation: (percent) => `Separação em ${percent} por cento.`,
    },
  },
  en: {
    sectionAriaLabel: 'Layered reading of Opportunity',
    kicker: 'NASA model / read by material',
    intro:
      'Drag to orbit. Tap or click a surface on the model, or use the layers below to navigate the view.',
    actions: {
      tourStart: 'Guided tour',
      tourPause: 'Pause tour',
      reducedMotionTourTitle:
        'Automatic tour disabled with reduced motion',
      reassemble: 'Reunite visually',
      openAll: 'Open all',
      explore3d: 'Explore in 3D',
      resumeJourney: 'Resume journey',
    },
    separation: {
      label: 'Layer separation',
      assembled: 'Layers reunited',
      open: 'Layers open',
    },
    layersGroupLabel: 'Model material layers',
    stage: {
      ariaLabel:
        'Official Opportunity 3D model in an educational exploded view. Use the layer buttons as an accessible alternative.',
      renderFallback:
        'The 3D model could not start. The illustrative schematic remains available in the other tab.',
      officialGlb: 'Official GLB',
      materialGroups: (count) =>
        `${count} material groups`,
      openPercent: (percent) => `${percent}% open`,
      focusEyebrowFallback: 'Surface reading',
      focusLabelFallback: 'Complete Opportunity',
      help: (layerCount, materialCount) =>
        `Drag the model with the mouse or tap to orbit. The ${layerCount} layers are educational visual groupings derived from the ${materialCount} materials in NASA's GLB file. They do not correspond to removable parts on the real vehicle.`,
    },
    detail: {
      layerLabel: 'LAYER',
      exploreMode: 'EXPLORE MODE',
      exploreEyebrow: 'From exterior to detail',
      chooseLayerTitle: 'Choose a layer',
      exploreSummary:
        'The whole model is the center. Separation reveals what each material group helps tell.',
      exploreCopy:
        "NASA's file is a single mesh organized by nine materials. This reading distributes them into six educational visual groups to explain form and function — not to suggest a real disassembly order.",
      honestyTitle: 'What this view is',
      honestyBody:
        'An educational experience based on the official GLB. The exact internal contours, wiring, and assembly sequence are not provided in the file.',
      modelSourceLabel: 'NASA/JPL-Caltech · 3D model',
    },
    disclaimer: (layerCount, materialCount) =>
      `Surfaces separated from the ${materialCount} material groups in the official GLB. This is a view in ${layerCount} educational visual groups derived from the ${materialCount} material groups; it is illustrative and does not represent a real teardown, internal parts, tolerances, or an official Opportunity manual.`,
    layerContent: {
      body: {
        label: 'Body and thermal protection',
        eyebrow: 'Central structure',
        summary: 'The box that gathered and protected the central systems.',
        detail:
          'The body surface appears in gold in this experiment. The GLB does not identify which panels, components, or thermal layers were beneath it.',
        sourceLabel: 'NASA · poster with the identified rover',
      },
      solar: {
        label: 'Solar panels',
        eyebrow: 'Power',
        summary: 'The wings that turned Martian light into electricity.',
        detail:
          'The two material groups for the panels can be lifted together. Dust accumulated over the mission reduced the energy available to the rover.',
        sourceLabel: 'NASA · Spirit and Opportunity instruments',
      },
      mast: {
        label: 'Mast and cameras',
        eyebrow: 'Senses',
        summary: "The tower that raised the rover's eyes above the dust.",
        detail:
          'This layer contains the mast, Pancam, and navigation cameras connected to it. The separation shows the assembly position, not an assembly sequence.',
        sourceLabel: 'NASA · Pancam and Navcam',
      },
      instruments: {
        label: 'Arm and instruments',
        eyebrow: 'Analysis',
        summary: 'The tools that examined rocks and the soil.',
        detail:
          'The robotic arm carried APXS, the Mössbauer spectrometer, the microscopic imager, and the RAT to targets. This grouping brings together surfaces from the arm and instruments.',
        sourceLabel: 'NASA · science instruments',
      },
      mobility: {
        label: 'Suspension and wheels',
        eyebrow: 'Mobility',
        summary: 'The rocker-bogie structure and the six-wheel set.',
        detail:
          'The articulated bars kept the wheels in contact with the terrain. This visual layer highlights the mobility geometry supplied in the official model.',
        sourceLabel: 'NASA · rocker-bogie geometry',
      },
      hardware: {
        label: 'Distributed metallic surfaces',
        eyebrow: 'Details',
        summary: 'Small metallic surfaces distributed across the rover.',
        detail:
          'The “Silver” and “foil_silver” materials include parts and coverings in several regions. They are grouped only for visual reading; they do not form a real separable subsystem.',
        sourceLabel: 'NASA · official 3D model',
      },
    },
    announcements: {
      initial:
        'Layers reunited. Choose a layer to highlight its surfaces.',
      tourLayer: (label, summary) => `Guided tour: ${label}. ${summary}`,
      selectedLayer: (label) => `Layer selected: ${label}.`,
      reassembled: 'Layers reunited visually.',
      tourPaused: 'Guided tour paused.',
      tourStarted: 'Guided tour started. Each layer receives a pause.',
      allOpen: 'All layers separated to the maximum.',
      exploreStarted:
        'Explore mode enabled. The journey is paused; drag to orbit the rover.',
      exploreEnded: 'Explore mode closed. Journey resumed.',
      separation: (percent) => `Layer separation: ${percent} percent.`,
    },
  },
};

export function getRoverTeardownCopy(locale: Locale): RoverTeardownCopy {
  return roverTeardownCopy[locale];
}
