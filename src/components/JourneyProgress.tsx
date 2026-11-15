import { useExperienceStore, type Screen } from '../state/experienceStore';

const steps = [
  { id: 'planeta', label: 'Planeta' },
  { id: 'mapa', label: 'Mapa' },
  { id: 'objeto', label: 'Objeto' },
  { id: 'historia', label: 'História' },
  { id: 'pista', label: 'Pista' },
  { id: 'legado', label: 'Legado' },
] as const;

const screenStep: Record<Screen, number> = {
  home: -1,
  approach: 0,
  map: 1,
  artifact: 2,
  story: 3,
  evidence: 4,
  legacy: 5,
};

export function JourneyProgress() {
  const screen = useExperienceStore((state) => state.screen);
  const chapterIndex = useExperienceStore((state) => state.chapterIndex);
  const active = screenStep[screen];

  if (active < 0) return null;

  return (
    <nav className="journey-progress" aria-label="Progresso da jornada">
      <span className="sr-only">
        Etapa {active + 1} de {steps.length}: {steps[active].label}
        {screen === 'story' ? `. Capítulo ${chapterIndex + 1} de 4.` : '.'}
      </span>
      <div className="journey-progress__track" aria-hidden="true">
        <span style={{ width: `${(Math.max(active, 0) / (steps.length - 1)) * 100}%` }} />
      </div>
      <ol>
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={index === active ? 'is-current' : index < active ? 'is-done' : ''}
            aria-hidden="true"
          >
            <span>{index + 1}</span>
            <small>{step.label}</small>
          </li>
        ))}
      </ol>
    </nav>
  );
}

