import { nasaUrls } from '../content/missions';
import type { Locale } from './types';

export type SettingsUiCopy = {
  ariaLabel: string;
  title: string;
  description: string;
  sound: string;
  soundOn: string;
  soundOff: string;
  captions: string;
  captionsVisible: string;
  captionsHidden: string;
  motion: string;
  motionReduced: string;
  motionDefault: string;
  text: string;
  textLarge: string;
  textDefault: string;
  sourcesLink: string;
  close: string;
};

export type SourceGroupCopy = {
  title: string;
  items: ReadonlyArray<readonly [label: string, url: string, note: string]>;
};

export type SourcesUiCopy = {
  eyebrow: string;
  title: string;
  summary: string;
  correctionTitle: string;
  correctionBody: string;
  groups: readonly SourceGroupCopy[];
};

export type ArchiveUiCopy = {
  skipToContent: string;
  navLabel: string;
  sources: string;
  interactive: string;
  kicker: string;
  title: string;
  intro: string;
  marsKicker: string;
  marsTitle: string;
  marsQuizTitle: string;
  marsQuizBody: string;
  moonKicker: string;
  moonTitle: string;
  legacyKicker: string;
  legacyTitle: string;
  signatureLead: string;
  signatureEmphasis: string;
  footer: string;
  allSources: string;
};

export type NoticeUiCopy = {
  close: string;
  moon: {
    eyebrow: string;
    title: string;
    body: string;
    detail: string;
    source: string;
    back: string;
  };
  silent: {
    eyebrow: string;
    title: string;
    recordLead: string;
    recordBody: string;
    noSignal: string;
    inResearch: string;
    nasaCatalog: string;
    catalogDetail: string;
    body: string;
    source: string;
    back: string;
  };
};

export type UiCopy = {
  settings: SettingsUiCopy;
  sources: SourcesUiCopy;
  archive: ArchiveUiCopy;
  notices: NoticeUiCopy;
};

const nasaSourceGroupsPt: readonly SourceGroupCopy[] = [
  {
    title: 'Modelos e texturas 3D',
    items: [
      [
        'Marte',
        nasaUrls.marsTexture,
        'Textura NASA aplicada a uma esfera 3D',
      ],
      [
        'Spirit e Opportunity',
        nasaUrls.opportunityModel,
        'GLB carregado sob demanda',
      ],
    ],
  },
  {
    title: 'Imagens e dados históricos',
    items: [
      ['Último dado recebido', nasaUrls.opportunityLastMessage, 'PIA22929'],
      ['Autorretrato do Opportunity', nasaUrls.opportunitySelfie, 'PIA17759'],
      ['Panorama final', nasaUrls.opportunityFinalPanorama, 'PIA-22908'],
      ['Esferas de hematita', nasaUrls.opportunityBerries, 'PIA05273'],
      ['Mapa da rota final', nasaUrls.opportunityTraverse, 'PIA23178'],
    ],
  },
  {
    title: 'Contexto da missão',
    items: [
      ['Visão geral da Opportunity', nasaUrls.opportunityMission, 'NASA Science'],
      ['Fim da missão', nasaUrls.opportunityEnd, 'NASA/JPL'],
      ['Mars Trek', nasaUrls.marsTrek, 'Mapa interativo NASA'],
      ['Catálogo NSSDCA', nasaUrls.nssdca, 'Arquivo público de missões NASA'],
    ],
  },
  {
    title: 'Mapa celeste e licenças',
    items: [
      [
        'Texturas de planetas e da Lua',
        'https://www.solarsystemscope.com/textures/',
        'Solar System Scope · CC BY 4.0',
      ],
      [
        'Via Láctea',
        'https://www.eso.org/public/images/eso0932a/',
        'ESO/S. Brunier · CC BY 4.0',
      ],
      [
        'Licença Creative Commons BY 4.0',
        'https://creativecommons.org/licenses/by/4.0/',
        'Atribuição',
      ],
    ],
  },
];

const nasaSourceGroupsEn: readonly SourceGroupCopy[] = [
  {
    title: '3D models and textures',
    items: [
      [
        'Mars',
        nasaUrls.marsTexture,
        'NASA texture applied to a 3D sphere',
      ],
      [
        'Spirit and Opportunity',
        nasaUrls.opportunityModel,
        'GLB loaded on demand',
      ],
    ],
  },
  {
    title: 'Images and historical data',
    items: [
      ['Last data received', nasaUrls.opportunityLastMessage, 'PIA22929'],
      ['Opportunity self-portrait', nasaUrls.opportunitySelfie, 'PIA17759'],
      ['Final panorama', nasaUrls.opportunityFinalPanorama, 'PIA-22908'],
      ['Hematite spheres', nasaUrls.opportunityBerries, 'PIA05273'],
      ['Final route map', nasaUrls.opportunityTraverse, 'PIA23178'],
    ],
  },
  {
    title: 'Mission context',
    items: [
      ['Opportunity overview', nasaUrls.opportunityMission, 'NASA Science'],
      ['Mission end', nasaUrls.opportunityEnd, 'NASA/JPL'],
      ['Mars Trek', nasaUrls.marsTrek, 'NASA interactive map'],
      ['NSSDCA catalog', nasaUrls.nssdca, 'NASA public mission archive'],
    ],
  },
  {
    title: 'Sky map and licenses',
    items: [
      [
        'Planet and Moon textures',
        'https://www.solarsystemscope.com/textures/',
        'Solar System Scope · CC BY 4.0',
      ],
      [
        'Milky Way',
        'https://www.eso.org/public/images/eso0932a/',
        'ESO/S. Brunier · CC BY 4.0',
      ],
      [
        'Creative Commons BY 4.0 license',
        'https://creativecommons.org/licenses/by/4.0/',
        'Attribution',
      ],
    ],
  },
];

export const uiCopy: Record<Locale, UiCopy> = {
  'pt-BR': {
    settings: {
      ariaLabel: 'Ajustes de acessibilidade',
      title: 'Leitura e som',
      description: 'Você controla a experiência.',
      sound: 'Som',
      soundOn: 'Ligado',
      soundOff: 'Desligado',
      captions: 'Legendas',
      captionsVisible: 'Sempre visíveis',
      captionsHidden: 'Ocultas',
      motion: 'Movimento',
      motionReduced: 'Reduzido',
      motionDefault: 'Padrão',
      text: 'Texto',
      textLarge: 'Maior',
      textDefault: 'Padrão',
      sourcesLink: 'O que é real aqui?',
      close: 'Fechar ajustes',
    },
    sources: {
      eyebrow: 'Transparência',
      title: 'O que é real aqui?',
      summary:
        'O modelo do Opportunity, as imagens e o mapa vêm de páginas oficiais da NASA. A Lua e os planetas bloqueados usam texturas Solar System Scope, via HyperMemoria, sob CC BY 4.0; o céu é de ESO/S. Brunier. A voz é uma narração do navegador, não uma transmissão da missão.',
      correctionTitle: 'Uma correção importante',
      correctionBody:
        'O Opportunity não enviou uma frase como “minha bateria está baixa”. Esse texto foi criado depois por outras pessoas. O último dado real foi uma imagem incompleta recebida em 10 de junho de 2018.',
      groups: nasaSourceGroupsPt,
    },
    archive: {
      skipToContent: 'Pular para o conteúdo',
      navLabel: 'Ações do modo arquivo',
      sources: 'Fontes',
      interactive: 'Experiência interativa',
      kicker: 'Modo arquivo · leitura linear',
      title: 'O sinal termina. A luz continua.',
      intro:
        'O ECHOES transforma o arquivo científico da NASA em uma experiência que crianças de escolas públicas podem explorar. Esta é a versão de leitura completa, sem WebGL e sem movimento automático.',
      marsKicker: 'Marte · Opportunity',
      marsTitle: 'Jornada de Marte',
      marsQuizTitle: 'O que o Opportunity encontrou em Marte?',
      marsQuizBody:
        'Evidências de ambientes antigos com água. Os minerais encontrados ajudaram a contar a história de um Marte mais úmido.',
      moonKicker: 'Lua · Apollo',
      moonTitle: 'Jornada da Lua',
      legacyKicker: 'O legado',
      legacyTitle: 'A missão terminou. A descoberta ficou.',
      signatureLead: 'O sinal termina.',
      signatureEmphasis: 'A luz continua.',
      footer:
        'Fatos, imagens e modelos: NASA/JPL-Caltech, Cornell, ASU e USGS. Texturas do Sistema Solar: Solar System Scope, CC BY 4.0. Via Láctea: ESO/S. Brunier, CC BY 4.0.',
      allSources: 'Ver todas as fontes',
    },
    notices: {
      close: 'Fechar',
      moon: {
        eyebrow: 'Próxima vitrine',
        title: 'A Lua está chegando.',
        body:
          'O próximo objeto do museu será o estágio de descida do módulo lunar Eagle, da Apollo 11. Ele ficou na Lua depois de levar astronautas à superfície.',
        detail:
          'A história de Marte está completa. A nova história só entra quando todo o conteúdo e as fontes estiverem prontos.',
        source: 'Ver fonte Apollo 11',
        back: 'Voltar ao museu',
      },
      silent: {
        eyebrow: 'Arquivo orbital · sinal interrompido',
        title: 'Este mundo ainda está em silêncio.',
        recordLead: 'O registro',
        recordBody:
          'existe no mapa, mas ainda não tem uma história publicada neste museu.',
        noSignal: 'Sem transmissão',
        inResearch: 'história em pesquisa',
        nasaCatalog: 'Catálogo NASA',
        catalogDetail: 'dados disponíveis para uma próxima etapa',
        body:
          'O NSSDCA reúne o catálogo público de espaçonaves, instrumentos e destinos da NASA. Um ponto no mapa não é uma história inventada: é um convite para pesquisar mais.',
        source: 'Abrir o catálogo NSSDCA',
        back: 'Voltar ao Sistema Solar',
      },
    },
  },
  en: {
    settings: {
      ariaLabel: 'Accessibility settings',
      title: 'Reading and sound',
      description: 'You control the experience.',
      sound: 'Sound',
      soundOn: 'On',
      soundOff: 'Off',
      captions: 'Captions',
      captionsVisible: 'Always visible',
      captionsHidden: 'Hidden',
      motion: 'Motion',
      motionReduced: 'Reduced',
      motionDefault: 'Default',
      text: 'Text',
      textLarge: 'Larger',
      textDefault: 'Default',
      sourcesLink: 'What is real here?',
      close: 'Close settings',
    },
    sources: {
      eyebrow: 'Transparency',
      title: 'What is real here?',
      summary:
        'The Opportunity model, images, and map come from official NASA pages. The Moon and locked planets use Solar System Scope textures, via HyperMemoria, under CC BY 4.0; the sky is by ESO/S. Brunier. The voice is browser narration, not a transmission from the mission.',
      correctionTitle: 'An important correction',
      correctionBody:
        'Opportunity did not send a line such as “my battery is low.” That text was written later by other people. The last real data was an incomplete image received on June 10, 2018.',
      groups: nasaSourceGroupsEn,
    },
    archive: {
      skipToContent: 'Skip to content',
      navLabel: 'Archive mode actions',
      sources: 'Sources',
      interactive: 'Interactive experience',
      kicker: 'Archive mode · linear reading',
      title: 'The signal ends. The light continues.',
      intro:
        'ECHOES turns NASA’s scientific archive into an experience that public-school students can explore. This is the complete reading version, without WebGL or automatic motion.',
      marsKicker: 'Mars · Opportunity',
      marsTitle: 'Mars Journey',
      marsQuizTitle: 'What did Opportunity find on Mars?',
      marsQuizBody:
        'Evidence of ancient environments with water. The minerals it found helped tell the story of a wetter Mars.',
      moonKicker: 'Moon · Apollo',
      moonTitle: 'Moon Journey',
      legacyKicker: 'The legacy',
      legacyTitle: 'The mission ended. The discovery remained.',
      signatureLead: 'The signal ends.',
      signatureEmphasis: 'The light continues.',
      footer:
        'Facts, images, and models: NASA/JPL-Caltech, Cornell, ASU, and USGS. Solar System textures: Solar System Scope, CC BY 4.0. Milky Way: ESO/S. Brunier, CC BY 4.0.',
      allSources: 'View all sources',
    },
    notices: {
      close: 'Close',
      moon: {
        eyebrow: 'Next exhibit',
        title: 'The Moon is coming.',
        body:
          'The museum’s next object will be the descent stage of Apollo 11’s Eagle lunar module. It remained on the Moon after carrying astronauts to the surface.',
        detail:
          'The Mars story is complete. The new story will open only when all content and sources are ready.',
        source: 'View the Apollo 11 source',
        back: 'Back to the museum',
      },
      silent: {
        eyebrow: 'Orbital archive · interrupted signal',
        title: 'This world is still silent.',
        recordLead: 'Record',
        recordBody:
          'exists on the map, but it does not yet have a published story in this museum.',
        noSignal: 'No transmission',
        inResearch: 'story in research',
        nasaCatalog: 'NASA catalog',
        catalogDetail: 'data available for a future stage',
        body:
          'NSSDCA brings together NASA’s public catalog of spacecraft, instruments, and destinations. A point on the map is not an invented story: it is an invitation to research further.',
        source: 'Open the NSSDCA catalog',
        back: 'Back to the Solar System',
      },
    },
  },
};

export function getUiCopy(locale: Locale): UiCopy {
  return uiCopy[locale];
}
