import type { Locale } from '../i18n';

export type ScienceLensWorld = 'mars' | 'moon';
export type SciencePhaseId = 'physics' | 'chemistry' | 'biology';

export type ScienceLensPhase = {
  id: SciencePhaseId;
  discipline: string;
  indexLabel: string;
  title: string;
  body: string;
  formula: string;
  formulaLabel: string;
  focusLabel: string;
  source: string;
  image?: string;
  imageAlt?: string;
  focal: {
    x: number;
    y: number;
  };
  zoom: number;
};

export type ScienceLensContent = {
  ariaLabel: string;
  progressLabel: string;
  phases: [ScienceLensPhase, ScienceLensPhase, ScienceLensPhase];
};

export type ScienceLensState = {
  phase: ScienceLensPhase;
  index: number;
  localProgress: number;
  reveal: number;
  offsetY: number;
  blur: number;
  zoom: number;
};

const scienceLenses: Record<
  ScienceLensWorld,
  Record<Locale, ScienceLensContent>
> = {
  mars: {
    'pt-BR': {
      ariaLabel: 'Leitura científica da engenharia do Opportunity',
      progressLabel: 'Fase científica',
      phases: [
        {
          id: 'physics',
          discipline: 'Física',
          indexLabel: 'Mobilidade',
          title: 'Seis rodas negociam com o atrito',
          body:
            'A suspensão rocker-bogie distribui o contato das seis rodas. Torque, raio da roda e atrito definem quanto o rover consegue avançar sem perder tração.',
          formula: 'τ = r × F',
          formulaLabel: 'torque = raio × força',
          focusLabel: 'Rodas e suspensão',
          source: 'Leitura física aplicada ao Opportunity',
          focal: { x: 58, y: 67 },
          zoom: 1.16,
        },
        {
          id: 'chemistry',
          discipline: 'Química',
          indexLabel: 'Hematita',
          title: 'Uma assinatura mineral de água antiga',
          body:
            'As pequenas esferas de hematita encontradas pelo Opportunity ajudaram a reconstruir ambientes antigos. O mineral e a água permanecem como pistas químicas distintas, não como uma reação única.',
          formula: 'Fe₂O₃ · H₂O',
          formulaLabel: 'hematita · evidência de água',
          focusLabel: 'Esferas de hematita',
          source: 'NASA/JPL-Caltech · Opportunity',
          image: '/assets/images/opportunity-hematite-berries.jpg',
          imageAlt:
            'Pequenas esferas de hematita fotografadas pelo Opportunity em Marte.',
          focal: { x: 47, y: 50 },
          zoom: 1.24,
        },
        {
          id: 'biology',
          discipline: 'Biologia',
          indexLabel: 'Habitabilidade',
          title: 'Vida exige condições, não apenas água',
          body:
            'Radiação, temperatura, disponibilidade de água e elementos químicos entram na análise. Encontrar pistas de habitabilidade não significa afirmar que exista vida em Marte.',
          formula: 'H₂O + C + N + P + S',
          formulaLabel: 'condições a investigar',
          focusLabel: 'Ambiente habitável?',
          source: 'NASA Astrobiology · habitabilidade',
          focal: { x: 43, y: 42 },
          zoom: 1.1,
        },
      ],
    },
    en: {
      ariaLabel: "Scientific reading of Opportunity's engineering",
      progressLabel: 'Science phase',
      phases: [
        {
          id: 'physics',
          discipline: 'Physics',
          indexLabel: 'Mobility',
          title: 'Six wheels negotiate with friction',
          body:
            'The rocker-bogie suspension distributes contact across six wheels. Torque, wheel radius, and friction determine how far the rover can move without losing traction.',
          formula: 'τ = r × F',
          formulaLabel: 'torque = radius × force',
          focusLabel: 'Wheels and suspension',
          source: 'Physics reading applied to Opportunity',
          focal: { x: 58, y: 67 },
          zoom: 1.16,
        },
        {
          id: 'chemistry',
          discipline: 'Chemistry',
          indexLabel: 'Hematite',
          title: 'A mineral signature of ancient water',
          body:
            'The small hematite spheres found by Opportunity helped reconstruct ancient environments. The mineral and the water remain separate chemical clues, not one single reaction.',
          formula: 'Fe₂O₃ · H₂O',
          formulaLabel: 'hematite · water evidence',
          focusLabel: 'Hematite spheres',
          source: 'NASA/JPL-Caltech · Opportunity',
          image: '/assets/images/opportunity-hematite-berries.jpg',
          imageAlt:
            'Small hematite spheres photographed by Opportunity on Mars.',
          focal: { x: 47, y: 50 },
          zoom: 1.24,
        },
        {
          id: 'biology',
          discipline: 'Biology',
          indexLabel: 'Habitability',
          title: 'Life requires conditions, not water alone',
          body:
            'Radiation, temperature, water availability, and chemical elements all matter. Finding habitability clues does not mean claiming that life exists on Mars.',
          formula: 'H₂O + C + N + P + S',
          formulaLabel: 'conditions to investigate',
          focusLabel: 'Habitable environment?',
          source: 'NASA Astrobiology · habitability',
          focal: { x: 43, y: 42 },
          zoom: 1.1,
        },
      ],
    },
  },
  moon: {
    'pt-BR': {
      ariaLabel: 'Leitura científica do Módulo Lunar Eagle',
      progressLabel: 'Fase científica',
      phases: [
        {
          id: 'physics',
          discipline: 'Física',
          indexLabel: 'Propulsão',
          title: 'Descer é controlar energia',
          body:
            'O motor de descida precisava reduzir a velocidade de uma massa grande em um ambiente de baixa gravidade. Empuxo, massa e aceleração mudavam durante a queima.',
          formula: 'F = m · a',
          formulaLabel: 'força = massa × aceleração',
          focusLabel: 'Motor de descida',
          source: 'Leitura física aplicada ao Eagle',
          focal: { x: 50, y: 72 },
          zoom: 1.18,
        },
        {
          id: 'chemistry',
          discipline: 'Química',
          indexLabel: 'Água e propelentes',
          title: 'Água lunar não é água líquida disponível',
          body:
            'Gelo existe em regiões permanentemente sombreadas, e o oxigênio também aparece ligado a minerais do regolito. Isso não cria uma atmosfera respirável.',
          formula: 'H₂O ↔ gelo · O em minerais',
          formulaLabel: 'pistas químicas distintas',
          focusLabel: 'Reservatórios e propelentes',
          source: 'NASA Science · Moon Facts',
          focal: { x: 48, y: 55 },
          zoom: 1.2,
        },
        {
          id: 'biology',
          discipline: 'Biologia',
          indexLabel: 'Habitabilidade',
          title: 'Proteção antes de qualquer organismo',
          body:
            'Radiação, quase-vácuo e poeira abrasiva tornam a superfície lunar hostil. A discussão biológica começa pelo desenho de proteção, não pela afirmação de vida.',
          formula: 'radiação + vácuo = desafio',
          formulaLabel: 'critérios de sobrevivência',
          focusLabel: 'Cabine e proteção',
          source: 'NASA · Artemis e saúde humana',
          focal: { x: 51, y: 34 },
          zoom: 1.12,
        },
      ],
    },
    en: {
      ariaLabel: 'Scientific reading of the Eagle Lunar Module',
      progressLabel: 'Science phase',
      phases: [
        {
          id: 'physics',
          discipline: 'Physics',
          indexLabel: 'Propulsion',
          title: 'Descent is energy control',
          body:
            'The descent engine had to slow a large mass in low gravity. Thrust, mass, and acceleration changed throughout the burn.',
          formula: 'F = m · a',
          formulaLabel: 'force = mass × acceleration',
          focusLabel: 'Descent engine',
          source: 'Physics reading applied to Eagle',
          focal: { x: 50, y: 72 },
          zoom: 1.18,
        },
        {
          id: 'chemistry',
          discipline: 'Chemistry',
          indexLabel: 'Water and propellants',
          title: 'Lunar water is not readily liquid water',
          body:
            'Ice exists in permanently shadowed regions, and oxygen is also bound to regolith minerals. This does not create a breathable atmosphere.',
          formula: 'H₂O ↔ ice · O in minerals',
          formulaLabel: 'separate chemical clues',
          focusLabel: 'Reservoirs and propellants',
          source: 'NASA Science · Moon Facts',
          focal: { x: 48, y: 55 },
          zoom: 1.2,
        },
        {
          id: 'biology',
          discipline: 'Biology',
          indexLabel: 'Habitability',
          title: 'Protection comes before organisms',
          body:
            'Radiation, near-vacuum, and abrasive dust make the lunar surface hostile. The biological discussion starts with protection design, not with a claim of life.',
          formula: 'radiation + vacuum = challenge',
          formulaLabel: 'survival criteria',
          focusLabel: 'Cabin and protection',
          source: 'NASA · Artemis and human health',
          focal: { x: 51, y: 34 },
          zoom: 1.12,
        },
      ],
    },
  },
};

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function smoothstep(start: number, end: number, value: number) {
  if (end === start) return value >= end ? 1 : 0;
  const amount = clamp01((value - start) / (end - start));
  return amount * amount * (3 - 2 * amount);
}

export function getScienceLensContent(
  world: ScienceLensWorld,
  locale: Locale,
) {
  return scienceLenses[world][locale];
}

export function getScienceLensState(
  world: ScienceLensWorld,
  progress: number,
  locale: Locale,
): ScienceLensState {
  const content = getScienceLensContent(world, locale);
  const clamped = clamp01(progress);
  const index = Math.min(
    content.phases.length - 1,
    Math.floor(clamped * content.phases.length),
  );
  const start = index / content.phases.length;
  const end = (index + 1) / content.phases.length;
  const localProgress = smoothstep(start, end, clamped);
  const reveal =
    smoothstep(0.02, 0.16, localProgress) *
    (1 - smoothstep(0.9, 1, localProgress));
  const phase = content.phases[index];
  const pulse = Math.sin(localProgress * Math.PI);

  return {
    phase,
    index,
    localProgress,
    reveal,
    offsetY: (1 - reveal) * 22,
    blur: (1 - reveal) * 7,
    zoom: 1 + (phase.zoom - 1) * (0.45 + pulse * 0.55),
  };
}
