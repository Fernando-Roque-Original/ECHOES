import { Clock3, Gauge } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useExperienceStore } from '../state/experienceStore';

export function DemoPilot() {
  const demoMode = useExperienceStore((state) => state.demoMode);
  const demoStartedAt = useExperienceStore((state) => state.demoStartedAt);
  const screen = useExperienceStore((state) => state.screen);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!demoStartedAt || screen === 'legacy') return;
    const interval = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, [demoStartedAt, screen]);

  if (!demoMode) return null;

  if (!demoStartedAt) {
    return (
      <aside className="demo-pilot" aria-label="Modo de apresentação">
        <Gauge aria-hidden="true" />
        <span>
          <strong>Modo pitch</strong>
          <small>Percurso de 90 segundos</small>
        </span>
      </aside>
    );
  }

  const elapsed = Math.floor((now - demoStartedAt) / 1000);
  const remaining = Math.max(0, 90 - elapsed);
  const overtime = elapsed > 90;

  return (
    <aside
      className={`demo-pilot demo-pilot--running ${overtime ? 'is-overtime' : ''}`}
      aria-label={`Demonstração: ${remaining} segundos restantes`}
      aria-live="off"
    >
      <Clock3 aria-hidden="true" />
      <span>
        <strong>{screen === 'legacy' ? `${elapsed}s de percurso` : `${remaining}s`}</strong>
        <small>{overtime ? 'Pitch concluído' : 'Demonstração'}</small>
      </span>
      <span className="demo-pilot__bar" aria-hidden="true">
        <span style={{ width: `${Math.min(100, (elapsed / 90) * 100)}%` }} />
      </span>
    </aside>
  );
}

