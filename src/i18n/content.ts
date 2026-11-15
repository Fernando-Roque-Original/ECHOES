import type {
  ExperienceCopy,
  JourneyBeat,
  LegacyFact,
  Locale,
  Quiz,
} from './types';

const marsJourneyPt: JourneyBeat[] = [
  {
    id: 'ninety-days',
    kicker: 'O plano',
    headline: '90 dias',
    body: 'Era o tempo que o Opportunity deveria passar em Marte. Cerca de 92 dias terrestres.',
    detail: 'Um rover do tamanho de um carrinho de golfe, pousando em um mundo desconhecido.',
    visual: 'mars',
    credit: 'Textura global de Marte: NASA/JPL-Caltech',
  },
  {
    id: 'fourteen-years',
    kicker: 'O que aconteceu',
    headline: '14 anos',
    body: 'O Opportunity continuou. Por mais de 14 anos, estudou rochas e paisagens e enviou dados para a Terra.',
    detail:
      'A missão planejada para 90 dias se tornou uma das mais longas explorações da superfície de Marte.',
    image: '/assets/images/opportunity-selfie.jpg',
    imageAlt:
      'Autorretrato real do Opportunity em Marte, com painéis solares cobertos de poeira.',
    credit: 'NASA/JPL-Caltech/Cornell/ASU',
    visual: 'traverse',
  },
  {
    id: 'forty-five-kilometers',
    kicker: 'A jornada',
    headline: '45,16 km',
    body: 'Seis rodas atravessaram crateras, pedras e encostas. Cada trecho acrescentou uma nova pista sobre Marte.',
    detail:
      'As rodas, os painéis solares e as câmeras trabalharam juntos como um pequeno laboratório móvel.',
    image: '/assets/images/opportunity-final-panorama.jpg',
    imageAlt:
      'Panorama real do Opportunity em Perseverance Valley, com quadros anotados pela NASA.',
    credit: 'NASA/JPL-Caltech/Cornell/ASU',
    visual: 'traverse',
  },
  {
    id: 'last-signal',
    kicker: 'Sol 5111',
    headline: '10 de junho de 2018',
    body: 'Uma tempestade de poeira cobriu Marte e bloqueou a luz do Sol. O Opportunity enviou seu último conjunto de dados.',
    detail:
      'O último registro é uma imagem incompleta e ruidosa. Não é uma mensagem escrita nem uma despedida.',
    image: '/assets/images/opportunity-last-message.jpg',
    imageAlt:
      'Imagem escura e incompleta recebida do Opportunity em 10 de junho de 2018.',
    credit: 'NASA/JPL-Caltech',
    visual: 'signal',
  },
  {
    id: 'what-remains',
    kicker: 'A descoberta',
    headline: 'O que ficou',
    body: 'O Opportunity encontrou evidências de ambientes antigos com água em Marte.',
    detail:
      'A missão foi encerrada em 13 de fevereiro de 2019. O conhecimento e a história continuaram.',
    image: '/assets/images/opportunity-hematite-berries.jpg',
    imageAlt:
      'Pequenas esferas de hematita registradas pelo Opportunity na superfície de Marte.',
    credit: 'NASA/JPL-Caltech/Cornell/USGS',
    visual: 'evidence',
  },
  {
    id: 'opportunity-teardown',
    kicker: 'Engenharia visível',
    headline: 'Desmontar para entender',
    body: 'Uma leitura visual em camadas do GLB oficial do Opportunity destaca grupos de materiais para ajudar a observar a engenharia do rover.',
    detail:
      'As camadas formam uma vista explodida didática: não representam peças removíveis nem uma ordem oficial de desmontagem ou montagem.',
    visual: 'teardown',
  },
  {
    id: 'question',
    kicker: 'Sua vez',
    headline: 'O que você descobriu?',
    body: 'O Opportunity encontrou pistas sobre o passado de Marte. Qual delas é verdadeira?',
    visual: 'evidence',
  },
];

const marsJourneyEn: JourneyBeat[] = [
  {
    id: 'ninety-days',
    kicker: 'The plan',
    headline: '90 days',
    body: 'That was the time Opportunity was expected to spend on Mars. About 92 Earth days.',
    detail: 'A rover the size of a golf cart, landing on an unknown world.',
    visual: 'mars',
    credit: 'Global Mars texture: NASA/JPL-Caltech',
  },
  {
    id: 'fourteen-years',
    kicker: 'What happened',
    headline: '14 years',
    body: 'Opportunity kept going. For more than 14 years, it studied rocks and landscapes and sent data back to Earth.',
    detail:
      'A mission planned for 90 days became one of the longest explorations of the Martian surface.',
    image: '/assets/images/opportunity-selfie.jpg',
    imageAlt:
      'A real self-portrait of Opportunity on Mars, with solar panels covered in dust.',
    credit: 'NASA/JPL-Caltech/Cornell/ASU',
    visual: 'traverse',
  },
  {
    id: 'forty-five-kilometers',
    kicker: 'The journey',
    headline: '45.16 km',
    body: 'Six wheels crossed craters, rocks, and slopes. Every stretch added a new clue about Mars.',
    detail:
      'Its wheels, solar panels, and cameras worked together like a small mobile laboratory.',
    image: '/assets/images/opportunity-final-panorama.jpg',
    imageAlt:
      'A real Opportunity panorama in Perseverance Valley, with frames annotated by NASA.',
    credit: 'NASA/JPL-Caltech/Cornell/ASU',
    visual: 'traverse',
  },
  {
    id: 'last-signal',
    kicker: 'Sol 5111',
    headline: 'June 10, 2018',
    body: 'A dust storm covered Mars and blocked sunlight. Opportunity sent its last dataset.',
    detail:
      'The last record is an incomplete, noisy image. It is not a written message or a goodbye.',
    image: '/assets/images/opportunity-last-message.jpg',
    imageAlt:
      'A dark, incomplete image received from Opportunity on June 10, 2018.',
    credit: 'NASA/JPL-Caltech',
    visual: 'signal',
  },
  {
    id: 'what-remains',
    kicker: 'The discovery',
    headline: 'What remains',
    body: 'Opportunity found evidence of ancient environments with water on Mars.',
    detail:
      'The mission ended on February 13, 2019. The knowledge and the story continued.',
    image: '/assets/images/opportunity-hematite-berries.jpg',
    imageAlt:
      'Small hematite spheres recorded by Opportunity on the Martian surface.',
    credit: 'NASA/JPL-Caltech/Cornell/USGS',
    visual: 'evidence',
  },
  {
    id: 'opportunity-teardown',
    kicker: 'Visible engineering',
    headline: 'Take it apart to understand',
    body: "A layered visual reading of the official Opportunity GLB highlights material groups to help observe the rover's engineering.",
    detail:
      'The layers form an educational exploded view: they do not represent removable parts or an official disassembly or assembly sequence.',
    visual: 'teardown',
  },
  {
    id: 'question',
    kicker: 'Your turn',
    headline: 'What did you discover?',
    body: "Opportunity found clues about Mars's past. Which one is true?",
    visual: 'evidence',
  },
];

const moonJourneyPt: JourneyBeat[] = [
  {
    id: 'apollo',
    kicker: '20 de julho de 1969',
    headline: '1969',
    body: 'A Apollo 11 levou pessoas à superfície da Lua pela primeira vez.',
    detail:
      'A Lua deixou de ser apenas um ponto no céu e passou a ser um lugar que a humanidade conseguiu tocar.',
    visual: 'moon',
    credit: 'Fonte: NASA — Apollo 11',
  },
  {
    id: 'no-wind',
    kicker: 'Quase vácuo',
    headline: 'Exosfera fina',
    body: 'A Lua tem uma exosfera extremamente fina. Ela não é um vácuo absoluto.',
    detail:
      'Essa camada é tão tênue que, para muitas medições, se comporta quase como vácuo — mas ainda contém partículas.',
    visual: 'moon',
    credit: 'Fonte: NASA Science — Moon Facts',
  },
  {
    id: 'regolith',
    kicker: 'Sob os pés',
    headline: 'Poeira afiada',
    body: 'A superfície da Lua é coberta por regolito: uma camada de poeira e fragmentos finos.',
    detail:
      'Os grãos podem ser afiados e abrasivos. Por isso, o regolito é um desafio para roupas, ferramentas e equipamentos.',
    visual: 'moon',
    credit: 'Fonte: NASA Science — Moon Facts',
  },
  {
    id: 'water-ice',
    kicker: 'Uma pista escondida',
    headline: 'Gelo nas sombras',
    body: 'A NASA encontrou evidências de gelo de água em regiões permanentemente sombreadas da Lua.',
    detail:
      'Essas regiões incluem crateras polares que não recebem luz solar direta. O gelo é uma pista importante sobre a água na Lua.',
    visual: 'moon',
    credit: 'Fonte: NASA Science — Moon Facts',
  },
  {
    id: 'next-step',
    kicker: 'O futuro',
    headline: 'Próximo passo',
    body: 'A NASA prepara novas missões tripuladas à Lua com o programa Artemis.',
    detail:
      'A agência também estuda a superfície lunar para aprender a viver e trabalhar por mais tempo no espaço.',
    visual: 'moon',
    credit: 'Fonte: NASA — Artemis',
  },
  {
    id: 'lunar-module',
    kicker: 'Apollo 11 · LM-5',
    headline: 'Eagle, por dentro',
    body: 'O Módulo Lunar Eagle era dividido em dois estágios: uma base de descida que permaneceu na Lua e uma cabine de subida que retornou à órbita lunar.',
    detail:
      'Vista explodida interpretativa; não é CAD oficial nem uma sequência real de desmontagem.',
    visual: 'lunar-teardown',
    credit: 'Fonte: NASA — Módulo Lunar Apollo',
  },
  {
    id: 'question',
    kicker: 'Sua vez',
    headline: 'O que você descobriu?',
    body: 'Qual destas pistas sobre a Lua é verdadeira?',
    detail: 'Escolha uma resposta para concluir a jornada lunar.',
    visual: 'moon',
    credit: 'Fonte: NASA Science — Moon Facts',
  },
];

const moonJourneyEn: JourneyBeat[] = [
  {
    id: 'apollo',
    kicker: 'July 20, 1969',
    headline: '1969',
    body: "Apollo 11 brought people to the Moon's surface for the first time.",
    detail:
      'The Moon stopped being just a point in the sky and became a place humanity could touch.',
    visual: 'moon',
    credit: 'Source: NASA — Apollo 11',
  },
  {
    id: 'no-wind',
    kicker: 'Almost a vacuum',
    headline: 'Thin exosphere',
    body: 'The Moon has an extremely thin exosphere. It is not an absolute vacuum.',
    detail:
      'This layer is so tenuous that, for many measurements, it behaves almost like a vacuum — but it still contains particles.',
    visual: 'moon',
    credit: 'Source: NASA Science — Moon Facts',
  },
  {
    id: 'regolith',
    kicker: 'Beneath your feet',
    headline: 'Sharp dust',
    body: "The Moon's surface is covered by regolith: a layer of dust and fine fragments.",
    detail:
      'The grains can be sharp and abrasive. That makes regolith a challenge for suits, tools, and equipment.',
    visual: 'moon',
    credit: 'Source: NASA Science — Moon Facts',
  },
  {
    id: 'water-ice',
    kicker: 'A hidden clue',
    headline: 'Ice in shadows',
    body: 'NASA has found evidence of water ice in permanently shadowed regions of the Moon.',
    detail:
      'These regions include polar craters that receive no direct sunlight. The ice is an important clue about water on the Moon.',
    visual: 'moon',
    credit: 'Source: NASA Science — Moon Facts',
  },
  {
    id: 'next-step',
    kicker: 'The future',
    headline: 'Next step',
    body: 'NASA is preparing new crewed missions to the Moon through the Artemis program.',
    detail:
      'The agency is also studying the lunar surface to learn how people can live and work in space for longer.',
    visual: 'moon',
    credit: 'Source: NASA — Artemis',
  },
  {
    id: 'lunar-module',
    kicker: 'Apollo 11 · LM-5',
    headline: 'Eagle, inside out',
    body: 'The Eagle Lunar Module had two stages: a descent stage left on the Moon and an ascent cabin that returned to lunar orbit.',
    detail:
      'Interpretive exploded view; not official CAD or a real disassembly sequence.',
    visual: 'lunar-teardown',
    credit: 'Source: NASA — Apollo Lunar Module',
  },
  {
    id: 'question',
    kicker: 'Your turn',
    headline: 'What did you discover?',
    body: 'Which of these clues about the Moon is true?',
    detail: 'Choose an answer to complete the Moon journey.',
    visual: 'moon',
    credit: 'Source: NASA Science — Moon Facts',
  },
];

const legacyFactsPt: LegacyFact[] = [
  { value: '90 dias', label: 'planejados' },
  { value: '14 anos', label: 'explorando' },
  { value: '45,16 km', label: 'percorridos' },
];

const legacyFactsEn: LegacyFact[] = [
  { value: '90 days', label: 'planned' },
  { value: '14 years', label: 'exploring' },
  { value: '45.16 km', label: 'traveled' },
];

const marsQuizPt: Quiz = {
  answersLabel: 'Respostas',
  idleFeedback: 'Escolha uma pista.',
  correctFeedback:
    'Pista encontrada. O Opportunity encontrou minerais ligados a ambientes antigos com água.',
  incorrectFeedback:
    'Ainda não. Volte à imagem das esferas de hematita e tente outra pista.',
  finishLabel: 'Ver o que ficou',
  answers: [
    {
      label: 'Evidências de ambientes antigos com água',
      correct: true,
    },
    {
      label: 'Florestas ainda vivas na superfície',
      correct: false,
    },
    {
      label: 'Uma mensagem escrita deixada pelo rover',
      correct: false,
    },
  ],
};

const marsQuizEn: Quiz = {
  answersLabel: 'Answers',
  idleFeedback: 'Choose a clue.',
  correctFeedback:
    'Clue found. Opportunity found minerals linked to ancient environments with water.',
  incorrectFeedback:
    'Not yet. Go back to the hematite spheres image and try another clue.',
  finishLabel: 'See what remains',
  answers: [
    {
      label: 'Evidence of ancient environments with water',
      correct: true,
    },
    {
      label: 'Forests still alive on the surface',
      correct: false,
    },
    {
      label: 'A written message left by the rover',
      correct: false,
    },
  ],
};

const moonQuizPt: Quiz = {
  answersLabel: 'Respostas',
  idleFeedback: 'Escolha uma pista.',
  correctFeedback:
    'Pista encontrada. A NASA encontrou evidências de gelo de água em regiões permanentemente sombreadas da Lua.',
  incorrectFeedback:
    'Ainda não. Releia a pista sobre as sombras e tente outra resposta.',
  finishLabel: 'Ver o legado lunar',
  answers: [
    {
      label: 'Gelo de água em regiões permanentemente sombreadas',
      correct: true,
    },
    {
      label: 'A Lua é um vácuo absoluto e não tem exosfera',
      correct: false,
    },
    {
      label: 'O regolito lunar é macio e liso',
      correct: false,
    },
  ],
};

const moonQuizEn: Quiz = {
  answersLabel: 'Answers',
  idleFeedback: 'Choose a clue.',
  correctFeedback:
    'Clue found. NASA has found evidence of water ice in permanently shadowed regions of the Moon.',
  incorrectFeedback:
    'Not yet. Revisit the clue about shadows and try another answer.',
  finishLabel: 'See the lunar legacy',
  answers: [
    {
      label: 'Water ice in permanently shadowed regions',
      correct: true,
    },
    {
      label: 'The Moon is an absolute vacuum and has no exosphere',
      correct: false,
    },
    {
      label: 'Lunar regolith is soft and smooth',
      correct: false,
    },
  ],
};

export const experienceContent: Record<Locale, ExperienceCopy> = {
  'pt-BR': {
    header: {
      skipToContent: 'Pular para o conteúdo',
      brand: 'ECHOES',
      team: 'ECHOES',
      navLabel: 'Ações da experiência',
      instrument: {
        orbit: 'ORB-01',
        mars: 'MER-B',
        moon: 'LUNA',
      },
      actions: {
        settings: 'Ajustes',
        settingsAria: 'Abrir ajustes de leitura',
        sources: 'Fontes',
        sourcesAria: 'Abrir fontes e proveniência',
        archive: 'Arquivo',
        archiveAria: 'Abrir modo arquivo acessível',
      },
      language: {
        label: 'Idioma',
        ariaLabel: 'Selecionar idioma',
        options: {
          'pt-BR': 'PT-BR',
          en: 'EN',
        },
      },
    },
    ignition: {
      sectionLabel: 'Abertura da experiência',
      titleLead: 'Abandonados,',
      titleEmphasis: 'mas não esquecidos.',
      start: 'Começar',
      startAriaLabel: 'Começar a explorar o Sistema Solar',
    },
    orbit: {
      sectionLabel: 'Sistema Solar',
      headingDefault: 'Escolha um astro',
      worldsLabel: 'Mundos disponíveis',
      explorePrefix: 'Explorar',
      lockedSuffix: 'mundo ainda em silêncio',
      stateUnlocked: 'História disponível',
      stateLocked: 'Em silêncio',
      previousPlanet: 'Astro anterior',
      nextPlanet: 'Próximo astro',
      silentToast: 'Ainda em silêncio',
      scrollHint: 'Role para explorar',
      planetNames: {
        mercury: 'Mercúrio',
        venus: 'Vênus',
        earth: 'Terra',
        moon: 'Lua',
        mars: 'Marte',
        jupiter: 'Júpiter',
        saturn: 'Saturno',
        uranus: 'Urano',
        neptune: 'Netuno',
      },
    },
    journeys: {
      mars: {
        world: 'mars',
        name: 'Marte',
        introduction:
          'A história do rover que continuou além do plano.',
        sectionLabel: 'Jornada por Marte',
        backToOrbit: 'Voltar à órbita',
        scrollCue: 'Role',
        beats: marsJourneyPt,
      },
      moon: {
        world: 'moon',
        name: 'Lua',
        introduction: 'A primeira pegada e o próximo horizonte.',
        sectionLabel: 'Jornada pela Lua',
        backToOrbit: 'Voltar à órbita',
        scrollCue: 'Role',
        beats: moonJourneyPt,
      },
    },
    quiz: {
      mars: marsQuizPt,
      moon: moonQuizPt,
    },
    finale: {
      mars: {
        ariaLabel: 'O legado do Opportunity',
        kicker: 'O legado do Opportunity',
        title: 'A missão terminou. A descoberta ficou.',
        body: null,
        showLegacyFacts: true,
        signatureLead: 'O sinal termina.',
        signatureEmphasis: 'A luz continua.',
        explore: 'Explorar outro mundo',
        home: 'Voltar ao início',
      },
      moon: {
        ariaLabel: 'O legado lunar',
        kicker: 'O legado lunar',
        title: 'A primeira pegada abriu o caminho.',
        body: 'Cada nova pergunta sobre a Lua aproxima o próximo passo da exploração humana.',
        showLegacyFacts: false,
        signatureLead: 'O sinal termina.',
        signatureEmphasis: 'A luz continua.',
        explore: 'Explorar outro mundo',
        home: 'Voltar ao início',
      },
    },
  },
  en: {
    header: {
      skipToContent: 'Skip to content',
      brand: 'ECHOES',
      team: 'ECHOES',
      navLabel: 'Experience actions',
      instrument: {
        orbit: 'ORB-01',
        mars: 'MER-B',
        moon: 'LUNA',
      },
      actions: {
        settings: 'Settings',
        settingsAria: 'Open reading settings',
        sources: 'Sources',
        sourcesAria: 'Open sources and provenance',
        archive: 'Archive',
        archiveAria: 'Open accessible archive mode',
      },
      language: {
        label: 'Language',
        ariaLabel: 'Select language',
        options: {
          'pt-BR': 'PT-BR',
          en: 'EN',
        },
      },
    },
    ignition: {
      sectionLabel: 'Experience opening',
      titleLead: 'Abandoned,',
      titleEmphasis: 'but not forgotten.',
      start: 'Begin',
      startAriaLabel: 'Begin exploring the Solar System',
    },
    orbit: {
      sectionLabel: 'Solar System',
      headingDefault: 'Choose a celestial body',
      worldsLabel: 'Available worlds',
      explorePrefix: 'Explore',
      lockedSuffix: 'world still in silence',
      stateUnlocked: 'Story available',
      stateLocked: 'In silence',
      previousPlanet: 'Previous celestial body',
      nextPlanet: 'Next celestial body',
      silentToast: 'Still in silence',
      scrollHint: 'Scroll to explore',
      planetNames: {
        mercury: 'Mercury',
        venus: 'Venus',
        earth: 'Earth',
        moon: 'Moon',
        mars: 'Mars',
        jupiter: 'Jupiter',
        saturn: 'Saturn',
        uranus: 'Uranus',
        neptune: 'Neptune',
      },
    },
    journeys: {
      mars: {
        world: 'mars',
        name: 'Mars',
        introduction: 'The story of the rover that kept going beyond the plan.',
        sectionLabel: 'Journey through Mars',
        backToOrbit: 'Back to orbit',
        scrollCue: 'Scroll',
        beats: marsJourneyEn,
      },
      moon: {
        world: 'moon',
        name: 'Moon',
        introduction: 'The first footprint and the next horizon.',
        sectionLabel: 'Journey through the Moon',
        backToOrbit: 'Back to orbit',
        scrollCue: 'Scroll',
        beats: moonJourneyEn,
      },
    },
    quiz: {
      mars: marsQuizEn,
      moon: moonQuizEn,
    },
    finale: {
      mars: {
        ariaLabel: 'The Opportunity legacy',
        kicker: 'The Opportunity legacy',
        title: 'The mission ended. The discovery remained.',
        body: null,
        showLegacyFacts: true,
        signatureLead: 'The signal ends.',
        signatureEmphasis: 'The light continues.',
        explore: 'Explore another world',
        home: 'Back to the beginning',
      },
      moon: {
        ariaLabel: 'The lunar legacy',
        kicker: 'The lunar legacy',
        title: 'The first footprint opened the way.',
        body: 'Every new question about the Moon brings the next step in human exploration closer.',
        showLegacyFacts: false,
        signatureLead: 'The signal ends.',
        signatureEmphasis: 'The light continues.',
        explore: 'Explore another world',
        home: 'Back to the beginning',
      },
    },
  },
};

export const legacyFactsByLocale: Record<Locale, LegacyFact[]> = {
  'pt-BR': legacyFactsPt,
  en: legacyFactsEn,
};
