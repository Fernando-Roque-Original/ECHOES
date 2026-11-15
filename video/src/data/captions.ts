import {
  FILM_FPS,
  FILM_TOTAL_FRAMES,
  type MovementId,
} from '../timeline';

export interface CaptionCue {
  id: string;
  movementId: MovementId;
  startFrame: number;
  endFrame: number;
  text: string;
}

export const NARRATION_CAPTIONS: readonly CaptionCue[] = [
  {
    id: 'c01',
    movementId: 'interrupcao',
    startFrame: 0,
    endFrame: 160,
    text: 'Toda criança já olhou para o céu.',
  },
  {
    id: 'c02',
    movementId: 'interrupcao',
    startFrame: 160,
    endFrame: 300,
    text: 'Mas nem toda criança encontra uma porta para entrar nele.',
  },
  {
    id: 'c03',
    movementId: 'interrupcao',
    startFrame: 300,
    endFrame: 420,
    text: 'Em 10 de junho de 2018, o último conjunto de dados do Opportunity chegou de Marte.',
  },
  {
    id: 'c04',
    movementId: 'interrupcao',
    startFrame: 420,
    endFrame: 540,
    text: 'A missão terminou.',
  },
  {
    id: 'c05',
    movementId: 'interrupcao',
    startFrame: 540,
    endFrame: 600,
    text: 'A história, não.',
  },
  {
    id: 'c06',
    movementId: 'problema',
    startFrame: 600,
    endFrame: 780,
    text: 'A NASA já produziu algumas das histórias mais extraordinárias da humanidade.',
  },
  {
    id: 'c07',
    movementId: 'problema',
    startFrame: 780,
    endFrame: 930,
    text: 'Mas elas vivem em arquivos técnicos, em inglês, feitos para especialistas.',
  },
  {
    id: 'c08',
    movementId: 'problema',
    startFrame: 930,
    endFrame: 1170,
    text: 'Para muitas crianças, a ciência parece estar do outro lado de uma porta que ninguém abriu.',
  },
  {
    id: 'c09',
    movementId: 'problema',
    startFrame: 1170,
    endFrame: 1350,
    text: 'Não falta curiosidade. Falta acesso.',
  },
  {
    id: 'c10',
    movementId: 'solucao',
    startFrame: 1350,
    endFrame: 1560,
    text: 'O After the Signal transforma o arquivo científico da NASA em uma experiência interativa.',
  },
  {
    id: 'c11',
    movementId: 'solucao',
    startFrame: 1560,
    endFrame: 1650,
    text: 'Uma criança consegue explorar sozinha.',
  },
  {
    id: 'c12',
    movementId: 'solucao',
    startFrame: 1650,
    endFrame: 1800,
    text: 'Você começa no sistema solar.',
  },
  {
    id: 'c13',
    movementId: 'solucao',
    startFrame: 1800,
    endFrame: 1950,
    text: 'Marte e Lua estão abertos.',
  },
  {
    id: 'c14',
    movementId: 'solucao',
    startFrame: 1950,
    endFrame: 2100,
    text: 'Escolha Marte.',
  },
  {
    id: 'c15',
    movementId: 'solucao',
    startFrame: 2100,
    endFrame: 2250,
    text: 'Atravesse o espaço. E desça até o Opportunity.',
  },
  {
    id: 'c16',
    movementId: 'transformacao',
    startFrame: 2250,
    endFrame: 2430,
    text: 'Em 2004, o Opportunity pousou em Marte.',
  },
  {
    id: 'c17',
    movementId: 'transformacao',
    startFrame: 2430,
    endFrame: 2550,
    text: 'Planejada para cerca de 90 sols. Quase 92 dias terrestres.',
  },
  {
    id: 'c18',
    movementId: 'transformacao',
    startFrame: 2550,
    endFrame: 2700,
    text: 'Continuou por mais de 14 anos.',
  },
  {
    id: 'c19',
    movementId: 'transformacao',
    startFrame: 2700,
    endFrame: 2850,
    text: 'Percorreu 45,16 quilômetros.',
  },
  {
    id: 'c20',
    movementId: 'transformacao',
    startFrame: 2850,
    endFrame: 3000,
    text: 'As rodas contam uma jornada real.',
  },
  {
    id: 'c21',
    movementId: 'transformacao',
    startFrame: 3000,
    endFrame: 3150,
    text: 'As câmeras registraram a paisagem.',
  },
  {
    id: 'c22',
    movementId: 'transformacao',
    startFrame: 3150,
    endFrame: 3300,
    text: 'Em 10 de junho de 2018, sol 5111, o último conjunto de dados chegou.',
  },
  {
    id: 'c23',
    movementId: 'transformacao',
    startFrame: 3300,
    endFrame: 3450,
    text: 'Uma imagem incompleta e ruidosa, durante uma tempestade de poeira.',
  },
  {
    id: 'c24',
    movementId: 'transformacao',
    startFrame: 3450,
    endFrame: 3600,
    text: 'Não uma despedida. O Opportunity encontrou evidências de ambientes antigos com água.',
  },
  {
    id: 'c25',
    movementId: 'transformacao',
    startFrame: 3600,
    endFrame: 3750,
    text: 'Ela não está só vendo ciência. Está fazendo as perguntas que a ciência faz.',
  },
  {
    id: 'c26',
    movementId: 'impacto-fechamento',
    startFrame: 3750,
    endFrame: 3900,
    text: 'Uma história real pode ser o começo de um novo cientista.',
  },
  {
    id: 'c27',
    movementId: 'impacto-fechamento',
    startFrame: 3900,
    endFrame: 4110,
    text: 'Funciona no navegador, em português, para escolas públicas, professores e famílias.',
  },
  {
    id: 'c28',
    movementId: 'impacto-fechamento',
    startFrame: 4110,
    endFrame: 4410,
    text: 'Quando a curiosidade encontra acesso, a distância vira descoberta.',
  },
  {
    id: 'c29',
    movementId: 'impacto-fechamento',
    startFrame: 4410,
    endFrame: 4650,
    text: 'A Lua já está aberta.',
  },
  {
    id: 'c30',
    movementId: 'impacto-fechamento',
    startFrame: 4650,
    endFrame: 4770,
    text: 'Novos mundos podem continuar chegando.',
  },
  {
    id: 'c31',
    movementId: 'impacto-fechamento',
    startFrame: 4770,
    endFrame: 4950,
    text: '90 sols planejados. Quase 92 dias terrestres.',
  },
  {
    id: 'c32',
    movementId: 'impacto-fechamento',
    startFrame: 4950,
    endFrame: 5070,
    text: 'Mais de 14 anos.',
  },
  {
    id: 'c33',
    movementId: 'impacto-fechamento',
    startFrame: 5070,
    endFrame: 5160,
    text: '45,16 quilômetros.',
  },
  {
    id: 'c34',
    movementId: 'impacto-fechamento',
    startFrame: 5160,
    endFrame: 5280,
    text: 'A missão terminou. A descoberta ficou.',
  },
  {
    id: 'c35',
    movementId: 'impacto-fechamento',
    startFrame: 5280,
    endFrame: 5400,
    text: 'O sinal termina. A luz continua.',
  },
];

export function findCaptionAtFrame(frame: number) {
  return (
    NARRATION_CAPTIONS.find(
      (caption) =>
        frame >= caption.startFrame && frame < caption.endFrame,
    ) ?? null
  );
}

function framesToSrtTimestamp(frame: number, fps = FILM_FPS) {
  const totalMilliseconds = Math.round((frame / fps) * 1000);
  const milliseconds = totalMilliseconds % 1000;
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    `${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`,
  ].join(':');
}

export function captionsToSrt(
  captions: readonly CaptionCue[] = NARRATION_CAPTIONS,
) {
  return `${captions
    .map((caption, index) => {
      const start = framesToSrtTimestamp(caption.startFrame);
      const end = framesToSrtTimestamp(caption.endFrame);
      return `${index + 1}\n${start} --> ${end}\n${caption.text}`;
    })
    .join('\n\n')}\n`;
}

export const CAPTION_COVERAGE = {
  from: NARRATION_CAPTIONS[0]?.startFrame ?? 0,
  to: NARRATION_CAPTIONS.at(-1)?.endFrame ?? 0,
  totalFrames: FILM_TOTAL_FRAMES,
} as const;
