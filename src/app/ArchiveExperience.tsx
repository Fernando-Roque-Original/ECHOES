import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LanguageControl } from '../components/LanguageControl';
import { OdsBadges } from '../components/OdsBadges';
import { SourcesPanel } from '../components/SourcesPanel';
import type { JourneyBeat } from '../experience/journey';
import {
  getExperienceContent,
  getLegacyFacts,
  type Locale,
} from '../i18n';
import {
  applyLocalePreference,
  readInitialLocale,
} from '../i18n/locale';
import { getUiCopy } from '../i18n/ui';
import { useExperienceStore } from '../state/experienceStore';

function ArchiveBeat({ beat }: { beat: JourneyBeat }) {
  return (
    <article className="archive-beat">
      <div className="archive-beat__copy">
        <p className="cine-kicker">{beat.kicker}</p>
        <h3>{beat.headline}</h3>
        <p>{beat.body}</p>
        {beat.detail ? <p>{beat.detail}</p> : null}
      </div>
      {beat.image ? (
        <figure>
          <img src={beat.image} alt={beat.imageAlt ?? ''} loading="lazy" />
          <figcaption>{beat.credit}</figcaption>
        </figure>
      ) : null}
    </article>
  );
}

export function ArchiveExperience() {
  const [locale, setLocale] = useState<Locale>(readInitialLocale);
  const openSources = useExperienceStore((state) => state.openSources);
  const content = getExperienceContent(locale);
  const copy = getUiCopy(locale);
  const legacyFacts = getLegacyFacts(locale);
  const marsBeats = content.journeys.mars.beats.filter(
    (beat) => beat.id !== 'question',
  );
  const moonBeats = content.journeys.moon.beats;

  useEffect(() => {
    applyLocalePreference(locale);
  }, [locale]);

  return (
    <div className="archive-app">
      <a className="skip-link" href="#archive-main">
        {copy.archive.skipToContent}
      </a>
      <header className="archive-header">
        <a className="cine-wordmark" href="/" aria-label="ECHOES">
          ECHOES
        </a>
        <nav aria-label={copy.archive.navLabel}>
          <LanguageControl
            locale={locale}
            onChange={setLocale}
            copy={content.header.language}
            className="archive-language"
          />
          <button type="button" onClick={openSources}>
            {copy.archive.sources}
          </button>
          <a href="/">
            <ArrowLeft aria-hidden="true" size={18} />
            <span>{copy.archive.interactive}</span>
          </a>
        </nav>
      </header>

      <main id="archive-main" className="archive-main">
        <section className="archive-hero" aria-labelledby="archive-title">
          <p className="cine-kicker">{copy.archive.kicker}</p>
          <h1 id="archive-title">{copy.archive.title}</h1>
          <p>{copy.archive.intro}</p>
        </section>

        <section className="archive-world" aria-labelledby="archive-mars">
          <p className="cine-kicker">{copy.archive.marsKicker}</p>
          <h2 id="archive-mars">{copy.archive.marsTitle}</h2>
          <p className="archive-lede">
            {content.journeys.mars.introduction}
          </p>
          <div className="archive-beats">
            {marsBeats.map((beat) => (
              <ArchiveBeat beat={beat} key={beat.id} />
            ))}
          </div>
          <aside className="archive-quiz">
            <strong>{copy.archive.marsQuizTitle}</strong>
            <p>{copy.archive.marsQuizBody}</p>
          </aside>
        </section>

        <section className="archive-world" aria-labelledby="archive-moon">
          <p className="cine-kicker">{copy.archive.moonKicker}</p>
          <h2 id="archive-moon">{copy.archive.moonTitle}</h2>
          <p className="archive-lede">
            {content.journeys.moon.introduction}
          </p>
          <div className="archive-beats">
            {moonBeats.map((beat) => (
              <ArchiveBeat beat={beat} key={beat.id} />
            ))}
          </div>
        </section>

        <section className="archive-legacy" aria-labelledby="archive-legacy-title">
          <p className="cine-kicker">{copy.archive.legacyKicker}</p>
          <h2 id="archive-legacy-title">{copy.archive.legacyTitle}</h2>
          <dl>
            {legacyFacts.map((fact) => (
              <div key={fact.value}>
                <dt>{fact.value}</dt>
                <dd>{fact.label}</dd>
              </div>
            ))}
          </dl>
          <p className="archive-signature">
            {copy.archive.signatureLead}{' '}
            <strong>{copy.archive.signatureEmphasis}</strong>
          </p>
        </section>

        <footer className="archive-footer">
          <p>{copy.archive.footer}</p>
          <button type="button" onClick={openSources}>
            {copy.archive.allSources}
            <ExternalLink aria-hidden="true" size={16} />
          </button>
        </footer>
      </main>
      <OdsBadges locale={locale} className="archive-ods" />
      <SourcesPanel locale={locale} />
    </div>
  );
}
