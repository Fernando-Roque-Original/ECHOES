import { ArrowLeft, RotateCcw } from 'lucide-react';
import type { World } from '../../app/queryState';
import type { Locale } from '../../i18n';
import { getFinale, getLegacyFacts } from '../../i18n';

export function JourneyFinale({
  world,
  locale,
  onExplore,
  onHome,
}: {
  world: World;
  locale: Locale;
  onExplore: () => void;
  onHome: () => void;
}) {
  const copy = getFinale(world, locale);
  const facts = copy.showLegacyFacts ? getLegacyFacts(locale) : [];

  return (
    <section
      id="legado"
      className={`cine-finale cine-finale--${world}`}
      aria-label={copy.ariaLabel}
    >
      <div className="cine-finale__signal" aria-hidden="true" />
      <p className="cine-kicker">{copy.kicker}</p>
      <h2 id="legacy-title">{copy.title}</h2>

      {copy.showLegacyFacts ? (
        <div className="cine-finale__facts">
          {facts.map((fact) => (
            <div key={`${fact.value}-${fact.label}`}>
              <strong>{fact.value}</strong>
              <span>{fact.label}</span>
            </div>
          ))}
        </div>
      ) : copy.body ? (
        <p className="cine-finale__moon-copy">{copy.body}</p>
      ) : null}

      <p className="cine-finale__signature">
        {copy.signatureLead} <strong>{copy.signatureEmphasis}</strong>
      </p>

      <div className="cine-finale__actions">
        <button className="cine-action" type="button" onClick={onExplore}>
          <RotateCcw aria-hidden="true" size={19} />
          {copy.explore}
        </button>
        <button className="cine-text-action" type="button" onClick={onHome}>
          <ArrowLeft aria-hidden="true" size={18} />
          {copy.home}
        </button>
      </div>
    </section>
  );
}
