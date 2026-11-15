import { nasaUrls, type MissionStory } from './missions';

export const opportunityStory: MissionStory = {
  id: 'opp-1',
  world: 'mars',
  title: 'Opportunity',
  tagline: 'Planejado para 90 dias. Explorou por mais de 14 anos.',
  artifactModel: '/assets/artifacts/opportunity-rover.glb',
  artifactFallbackImage: {
    src: '/assets/images/opportunity-selfie.jpg',
    alt: 'Autorretrato real do rover Opportunity em Marte, com painéis solares cobertos de poeira.',
    kind: 'foto-real',
    credit: 'NASA/JPL-Caltech/Cornell/ASU',
    caption:
      'Autorretrato do Opportunity, montado com imagens registradas entre 3 e 6 de janeiro de 2014.',
  },
  mapImage: {
    src: '/assets/maps/opportunity-traverse-nasa.jpg',
    alt: 'Mapa NASA com a rota final do Opportunity entre Eagle Crater e Perseverance Valley.',
    kind: 'mapa-cientifico',
    credit: 'NASA/JPL-Caltech/University of Arizona',
    caption:
      'Mapa do percurso completo do Opportunity, baseado em imagens da Mars Reconnaissance Orbiter.',
  },
  locationLabel: 'Perseverance Valley, borda oeste da Endeavour Crater',
  approximateLocation: false,
  chapters: [
    {
      id: 'arrival',
      title: 'Uma pequena missão',
      text: 'O Opportunity chegou a Marte em janeiro de 2004. A missão foi planejada para 90 dias marcianos.',
      media: {
        src: '/assets/images/opportunity-selfie.jpg',
        alt: 'Autorretrato do Opportunity em Marte, mostrando painéis solares e instrumentos.',
        kind: 'foto-real',
        externalUrl: nasaUrls.opportunitySelfie,
        credit: 'NASA/JPL-Caltech/Cornell/ASU',
        caption:
          'O rover fotografou a si mesmo em janeiro de 2014. A imagem é real, mas não foi feita no dia em que chegou.',
      },
    },
    {
      id: 'long-journey',
      title: 'Muito além do esperado',
      text: 'Mas ele continuou. Por mais de 14 anos examinou rochas, crateras e pistas sobre a antiga água de Marte.',
      media: {
        src: '/assets/images/opportunity-final-panorama.jpg',
        alt: 'Panorama real do Opportunity em Perseverance Valley com anotações da NASA.',
        kind: 'foto-real',
        externalUrl: nasaUrls.opportunityFinalPanorama,
        credit: 'NASA/JPL-Caltech/Cornell/ASU',
        caption:
          'Panorama final do Opportunity, com quadros incompletos mostrando como a imagem foi montada.',
      },
    },
    {
      id: 'last-signal',
      title: 'O último sinal',
      text: 'Em junho de 2018, uma enorme tempestade de poeira cobriu Marte. O último dado chegou no dia 10.',
      media: {
        src: '/assets/images/opportunity-last-message.jpg',
        alt: 'Imagem escura e incompleta recebida do Opportunity em 10 de junho de 2018.',
        kind: 'dado-real',
        externalUrl: nasaUrls.opportunityLastMessage,
        credit: 'NASA/JPL-Caltech',
        caption:
          'Este é o último dado recebido: uma imagem incompleta e ruidosa, não uma mensagem escrita.',
      },
    },
    {
      id: 'what-remains',
      title: 'O que ficou',
      text: 'A missão terminou em 2019. Suas descobertas ajudaram a mostrar que Marte já teve ambientes com água.',
      media: {
        src: '/assets/images/opportunity-hematite-berries.jpg',
        alt: 'Formações esféricas de hematita na superfície de Marte vistos pelo Opportunity.',
        kind: 'foto-real',
        externalUrl: nasaUrls.opportunityBerries,
        credit: 'NASA/JPL-Caltech/Cornell/USGS',
        caption:
          'Pequenas esferas de hematita encontradas em Marte. Minerais como este ajudaram a contar a história da água.',
      },
    },
  ],
  hotspots: [
    {
      id: 'wheels',
      label: 'Rodas',
      detail:
        'São seis rodas com motores próprios. Elas ajudaram o rover a subir rochas e a atravessar terrenos irregulares.',
      sourceUrl: nasaUrls.opportunityMission,
      screenPosition: { left: '55%', top: '53%' },
    },
    {
      id: 'solar-panels',
      label: 'Painéis solares',
      detail:
        'Os painéis transformavam luz do Sol em eletricidade. Durante a tempestade de 2018, a poeira bloqueou essa luz.',
      sourceUrl: nasaUrls.opportunityEnd,
      screenPosition: { left: '33%', top: '43%' },
    },
    {
      id: 'cameras',
      label: 'Câmeras',
      detail:
        'As câmeras do mastro funcionavam como dois olhos, criando imagens em 3D e registrando o caminho de Marte.',
      sourceUrl: nasaUrls.opportunitySelfie,
      screenPosition: { left: '48%', top: '29%' },
    },
  ],
  finalEvidence: {
    src: '/assets/images/opportunity-last-message.jpg',
    alt: 'Última transmissão incompleta do Opportunity em 10 de junho de 2018.',
    kind: 'dado-real',
    credit: 'NASA/JPL-Caltech',
    caption:
      'Último dado recebido do Opportunity, em 10 de junho de 2018, durante a grande tempestade de poeira.',
  },
  quiz: {
    prompt: 'O que as rochas estudadas pelo Opportunity ajudaram a revelar?',
    answers: [
      'Que Marte já teve condições com água',
      'Que existem árvores em Marte',
      'Que o rover ainda está enviando fotos',
    ],
    correctAnswerIndex: 0,
    explanation:
      'O Opportunity encontrou minerais que se formam em presença de água. Essa é uma das pistas de que Marte já foi um mundo mais úmido.',
  },
  sources: [
    nasaUrls.opportunityMission,
    nasaUrls.opportunityEnd,
    nasaUrls.opportunityLastMessage,
    nasaUrls.opportunitySelfie,
    nasaUrls.opportunityFinalPanorama,
    nasaUrls.opportunityTraverse,
    nasaUrls.opportunityModel,
    nasaUrls.marsTexture,
    nasaUrls.opportunityBerries,
  ],
};

