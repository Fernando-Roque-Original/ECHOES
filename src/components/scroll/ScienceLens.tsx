import {
  Atom,
  Dna,
  FlaskConical,
  ScanSearch,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import {
  type ScienceLensContent,
  type ScienceLensState,
  type SciencePhaseId,
} from '../../content/scienceLens';

const PHASE_ICONS = {
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
} satisfies Record<SciencePhaseId, typeof Atom>;

type ScienceLensProps = {
  content: ScienceLensContent;
  state: ScienceLensState;
  total: number;
};

export function ScienceLens({
  content,
  state,
  total,
}: ScienceLensProps) {
  const { phase } = state;
  const PhaseIcon = PHASE_ICONS[phase.id];
  const style = {
    '--science-lens-reveal': state.reveal,
    '--science-lens-y': `${state.offsetY}px`,
    '--science-lens-blur': `${state.blur}px`,
    '--science-lens-x': `${phase.focal.x}%`,
    '--science-lens-y-focus': `${phase.focal.y}%`,
  } as CSSProperties;

  return (
    <div
      className="science-lens"
      aria-label={content.ariaLabel}
      role="group"
      style={style}
    >
      <div className="science-lens__reticle" aria-hidden="true">
        <span />
        <i />
        <b>{phase.focusLabel}</b>
      </div>

      <div
        key={phase.id}
        className={`science-lens__card is-${phase.id}`}
      >
        <div className="science-lens__rail" aria-hidden="true">
          <span>{content.progressLabel}</span>
          <i />
          <strong>
            {String(state.index + 1).padStart(2, '0')} /{' '}
            {String(total).padStart(2, '0')}
          </strong>
        </div>

        <div className="science-lens__heading">
          <span className="science-lens__icon">
            <PhaseIcon aria-hidden="true" size={17} />
          </span>
          <span>
            <small>{phase.discipline}</small>
            {phase.indexLabel}
          </span>
        </div>

        <h3>{phase.title}</h3>
        <p>{phase.body}</p>

        <div className="science-lens__formula">
          <span>{phase.formulaLabel}</span>
          <strong>{phase.formula}</strong>
        </div>

        {phase.image ? (
          <figure className="science-lens__evidence">
            <img src={phase.image} alt={phase.imageAlt ?? ''} />
            <figcaption>
              <ScanSearch aria-hidden="true" size={14} />
              {phase.focusLabel}
            </figcaption>
          </figure>
        ) : null}

        <p className="science-lens__source">{phase.source}</p>
      </div>
    </div>
  );
}
