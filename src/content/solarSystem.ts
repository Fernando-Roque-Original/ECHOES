export type SolarSystemBody = {
  id:
    | 'mercury'
    | 'venus'
    | 'earth'
    | 'moon'
    | 'mars'
    | 'jupiter'
    | 'saturn'
    | 'uranus'
    | 'neptune';
  archiveCode: string;
  texture: string;
  radius: number;
  orbitRadius: number;
  phase: number;
  speed: number;
  tint: string;
  displayRadius: number;
  unlocked: boolean;
  ringed?: boolean;
};

export const solarSystemBodies: SolarSystemBody[] = [
  {
    id: 'mercury',
    archiveCode: 'ARQ-03',
    texture: '/assets/planets/mercury-solarsystemscope.jpg',
    radius: 0.14,
    orbitRadius: 1.1,
    phase: 0.4,
    speed: 0.48,
    tint: '#7c858b',
    displayRadius: 0.9,
    unlocked: false,
  },
  {
    id: 'venus',
    archiveCode: 'ARQ-04',
    texture: '/assets/planets/venus-solarsystemscope.jpg',
    radius: 0.19,
    orbitRadius: 1.42,
    phase: 2.2,
    speed: 0.38,
    tint: '#8f877b',
    displayRadius: 0.94,
    unlocked: false,
  },
  {
    id: 'earth',
    archiveCode: 'ARQ-05',
    texture: '/assets/planets/earth-solarsystemscope.jpg',
    radius: 0.2,
    orbitRadius: 1.75,
    phase: 4.95,
    speed: 0.31,
    tint: '#647888',
    displayRadius: 0.98,
    unlocked: false,
  },
  {
    id: 'moon',
    archiveCode: 'MOON-01',
    texture: '/assets/planets/moon-solarsystemscope.jpg',
    radius: 0.1,
    orbitRadius: 0.32,
    phase: 1.1,
    speed: 1.15,
    tint: '#c2c2b9',
    displayRadius: 1.02,
    unlocked: true,
  },
  {
    id: 'mars',
    archiveCode: 'MER-B',
    texture: '/assets/maps/mars-texture-nasa.jpg',
    radius: 0.28,
    orbitRadius: 2.18,
    phase: 0.75,
    speed: 0.25,
    tint: '#d56f45',
    displayRadius: 1.2,
    unlocked: true,
  },
  {
    id: 'jupiter',
    archiveCode: 'ARQ-06',
    texture: '/assets/planets/jupiter-solarsystemscope.jpg',
    radius: 0.38,
    orbitRadius: 2.72,
    phase: 0.62,
    speed: 0.18,
    tint: '#807970',
    displayRadius: 1.3,
    unlocked: false,
  },
  {
    id: 'saturn',
    archiveCode: 'ARQ-07',
    texture: '/assets/planets/saturn-solarsystemscope.jpg',
    radius: 0.32,
    orbitRadius: 3.36,
    phase: 2.84,
    speed: 0.145,
    tint: '#807d73',
    displayRadius: 1.22,
    unlocked: false,
    ringed: true,
  },
  {
    id: 'uranus',
    archiveCode: 'ARQ-08',
    texture: '/assets/planets/uranus-solarsystemscope.jpg',
    radius: 0.25,
    orbitRadius: 3.93,
    phase: 5.5,
    speed: 0.115,
    tint: '#718087',
    displayRadius: 1.05,
    unlocked: false,
  },
  {
    id: 'neptune',
    archiveCode: 'ARQ-09',
    texture: '/assets/planets/neptune-solarsystemscope.jpg',
    radius: 0.24,
    orbitRadius: 4.46,
    phase: 1.58,
    speed: 0.095,
    tint: '#64717f',
    displayRadius: 1.04,
    unlocked: false,
  },
];

export const unlockedWorlds = solarSystemBodies.filter((body) => body.unlocked);
export const silentWorlds = solarSystemBodies.filter(
  (body) => !body.unlocked,
);

