export const FILM_FPS = 30;
export const FILM_WIDTH = 1920;
export const FILM_HEIGHT = 1080;
export const FILM_TOTAL_FRAMES = 5400;

export type MovementId =
  | 'interrupcao'
  | 'problema'
  | 'solucao'
  | 'transformacao'
  | 'impacto-fechamento';

export type SceneId =
  | 'abertura'
  | 'chegada-do-sinal'
  | 'interrupcao'
  | 'arquivo'
  | 'distancia'
  | 'acesso'
  | 'solucao'
  | 'orbita'
  | 'mergulho'
  | 'noventa-dias'
  | 'quatorze-anos'
  | 'trajeto'
  | 'ultimo-sinal'
  | 'evidencia'
  | 'impacto'
  | 'transformacao'
  | 'futuro'
  | 'legado'
  | 'assinatura';

export interface ScenePlan {
  id: SceneId;
  title: string;
  from: number;
  durationInFrames: number;
  purpose: string;
}

export interface MovementPlan {
  id: MovementId;
  title: string;
  from: number;
  durationInFrames: number;
  summary: string;
  scenes: readonly ScenePlan[];
}

export const FILM_MOVEMENTS = [
  {
    id: 'interrupcao',
    title: 'Interrupção',
    from: 0,
    durationInFrames: 600,
    summary:
      'Uma porta para o céu e um sinal real que chega de Marte. Emoção antes de estatística.',
    scenes: [
      {
        id: 'abertura',
        title: 'A porta',
        from: 0,
        durationInFrames: 180,
        purpose:
          'Apresentar uma criança representativa olhando para o céu, sem enquadramento de pena.',
      },
      {
        id: 'chegada-do-sinal',
        title: 'O sinal',
        from: 180,
        durationInFrames: 240,
        purpose:
          'Materializar Marte e a data do último conjunto de dados recebido do Opportunity.',
      },
      {
        id: 'interrupcao',
        title: 'A história não',
        from: 420,
        durationInFrames: 180,
        purpose:
          'Encerrar o primeiro movimento com a assinatura conceitual do projeto.',
      },
    ],
  },
  {
    id: 'problema',
    title: 'Problema',
    from: 600,
    durationInFrames: 750,
    summary:
      'O conhecimento existe, mas chega como arquivo técnico. O problema é acesso, não curiosidade.',
    scenes: [
      {
        id: 'arquivo',
        title: 'O arquivo',
        from: 600,
        durationInFrames: 330,
        purpose:
          'Mostrar a distância entre a descoberta científica e a linguagem dos documentos.',
      },
      {
        id: 'distancia',
        title: 'A distância',
        from: 930,
        durationInFrames: 240,
        purpose:
          'Relacionar a criança, o arquivo e Marte em uma única composição de escala.',
      },
      {
        id: 'acesso',
        title: 'A falta de acesso',
        from: 1170,
        durationInFrames: 180,
        purpose:
          'Nomear a tese sem transformar escola pública em cenário de abandono.',
      },
    ],
  },
  {
    id: 'solucao',
    title: 'Solução',
    from: 1350,
    durationInFrames: 900,
    summary:
      'O After the Signal transforma o arquivo em uma experiência navegável e mostra o mergulho.',
    scenes: [
      {
        id: 'solucao',
        title: 'After the Signal',
        from: 1350,
        durationInFrames: 300,
        purpose:
          'Apresentar o produto em uma frase e com identidade cinematográfica.',
      },
      {
        id: 'orbita',
        title: 'Sistema solar',
        from: 1650,
        durationInFrames: 300,
        purpose:
          'Demonstrar o sistema solar como porta de entrada e Marte e Lua como mundos abertos.',
      },
      {
        id: 'mergulho',
        title: 'Mergulho em Marte',
        from: 1950,
        durationInFrames: 300,
        purpose:
          'Transformar a seleção de Marte em aproximação de câmera, não em troca de slide.',
      },
    ],
  },
  {
    id: 'transformacao',
    title: 'Transformação',
    from: 2250,
    durationInFrames: 1500,
    summary:
      'A criança percorre os fatos reais do Opportunity e termina fazendo uma pergunta científica.',
    scenes: [
      {
        id: 'noventa-dias',
        title: '90 sols',
        from: 2250,
        durationInFrames: 300,
        purpose:
          'Mostrar a missão planejada e a escala humana da chegada a Marte.',
      },
      {
        id: 'quatorze-anos',
        title: 'Mais de 14 anos',
        from: 2550,
        durationInFrames: 300,
        purpose:
          'Revelar a longevidade real da missão como consequência das máquinas e decisões.',
      },
      {
        id: 'trajeto',
        title: '45,16 km',
        from: 2850,
        durationInFrames: 300,
        purpose:
          'Conectar rodas, deslocamento e uma jornada verificável.',
      },
      {
        id: 'ultimo-sinal',
        title: '10.06.2018',
        from: 3150,
        durationInFrames: 300,
        purpose:
          'Tratar o último dado como imagem incompleta e ruidosa, nunca como despedida.',
      },
      {
        id: 'evidencia',
        title: 'O que ficou',
        from: 3450,
        durationInFrames: 300,
        purpose:
          'Levar a descoberta científica a uma pergunta que a criança consegue responder.',
      },
    ],
  },
  {
    id: 'impacto-fechamento',
    title: 'Impacto + Fechamento',
    from: 3750,
    durationInFrames: 1650,
    summary:
      'O acesso vira transformação, a plataforma aponta para novos mundos e o filme fecha no legado.',
    scenes: [
      {
        id: 'impacto',
        title: 'O começo de um cientista',
        from: 3750,
        durationInFrames: 360,
        purpose:
          'Mostrar escolas, professores e famílias sem transformar a experiência em lista de recursos.',
      },
      {
        id: 'transformacao',
        title: 'Fazer ciência',
        from: 4110,
        durationInFrames: 300,
        purpose:
          'Relacionar a descoberta da criança à prática de investigar e perguntar.',
      },
      {
        id: 'futuro',
        title: 'Novos mundos',
        from: 4410,
        durationInFrames: 360,
        purpose:
          'Demonstrar que a plataforma continua viva com a Lua e novas histórias.',
      },
      {
        id: 'legado',
        title: 'O que ficou',
        from: 4770,
        durationInFrames: 390,
        purpose:
          'Sintetizar 90 sols, mais de 14 anos e 45,16 km em uma única imagem de legado.',
      },
      {
        id: 'assinatura',
        title: 'O sinal termina',
        from: 5160,
        durationInFrames: 240,
        purpose:
          'Fechar com a frase, o nome e a assinatura do projeto.',
      },
    ],
  },
] as const satisfies readonly MovementPlan[];

export type FilmMovement = (typeof FILM_MOVEMENTS)[number];
export type FilmScene = FilmMovement['scenes'][number];

export const FILM_SCENES = FILM_MOVEMENTS.flatMap((movement) =>
  movement.scenes.map((scene) => ({
    ...scene,
    movementId: movement.id,
  })),
);

export const MOVEMENT_BOUNDARIES = FILM_MOVEMENTS.map((movement) => ({
  id: movement.id,
  title: movement.title,
  from: movement.from,
  to: movement.from + movement.durationInFrames,
}));

export function frameToSeconds(frame: number) {
  return frame / FILM_FPS;
}

export function frameToTimecode(frame: number) {
  const totalSeconds = Math.floor(frame / FILM_FPS);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
