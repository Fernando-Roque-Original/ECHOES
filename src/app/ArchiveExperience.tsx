import { ArrowLeft, ExternalLink } from 'lucide-react';
import { OdsBadges } from '../components/OdsBadges';
import { SourcesPanel } from '../components/SourcesPanel';
import { journeys, type JourneyBeat } from '../experience/journey';
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
  const openSources = useExperienceStore((state) => state.openSources);
  const marsBeats = journeys.mars.beats.filter((beat) => beat.id !== 'question');
  const moonBeats = journeys.moon.beats;

  return (
    <div className="archive-app">
      <a className="skip-link" href="#archive-main">
        Pular para o conteúdo
      </a>
      <header className="archive-header">
        <a className="cine-wordmark" href="/">
          <span aria-hidden="true" />
          ECHOES
        </a>
        <nav aria-label="Ações do modo arquivo">
          <button type="button" onClick={openSources}>
            Fontes
          </button>
          <a href="/">
            <ArrowLeft aria-hidden="true" size={18} />
            Experiência interativa
          </a>
        </nav>
      </header>

      <main id="archive-main" className="archive-main">
        <section className="archive-hero" aria-labelledby="archive-title">
          <p className="cine-kicker">Modo arquivo · leitura linear</p>
          <h1 id="archive-title">
            O sinal termina.
            <br />
            A luz continua.
          </h1>
          <p>
            O ECHOES transforma o arquivo científico da NASA em uma
            experiência que crianças de escolas públicas podem explorar. Esta é
            a versão de leitura completa, sem WebGL e sem movimento automático.
          </p>
        </section>

        <section className="archive-world" aria-labelledby="archive-mars">
          <p className="cine-kicker">Marte · Opportunity</p>
          <h2 id="archive-mars">Jornada de Marte</h2>
          <p className="archive-lede">{journeys.mars.introduction}</p>
          <div className="archive-beats">
            {marsBeats.map((beat) => (
              <ArchiveBeat beat={beat} key={beat.id} />
            ))}
          </div>
          <aside className="archive-quiz">
            <strong>O que o Opportunity encontrou em Marte?</strong>
            <p>
              Evidências de ambientes antigos com água. Os minerais encontrados
              ajudaram a contar a história de um Marte mais úmido.
            </p>
          </aside>
        </section>

        <section className="archive-world" aria-labelledby="archive-moon">
          <p className="cine-kicker">Lua · Apollo</p>
          <h2 id="archive-moon">Jornada da Lua</h2>
          <p className="archive-lede">{journeys.moon.introduction}</p>
          <div className="archive-beats">
            {moonBeats.map((beat) => (
              <ArchiveBeat beat={beat} key={beat.id} />
            ))}
          </div>
        </section>

        <section className="archive-legacy" aria-labelledby="archive-legacy-title">
          <p className="cine-kicker">O legado</p>
          <h2 id="archive-legacy-title">
            A missão terminou. A descoberta ficou.
          </h2>
          <dl>
            <div>
              <dt>90 dias</dt>
              <dd>planejados</dd>
            </div>
            <div>
              <dt>14 anos</dt>
              <dd>explorando</dd>
            </div>
            <div>
              <dt>45,16 km</dt>
              <dd>percorridos</dd>
            </div>
          </dl>
          <p className="archive-signature">
            O sinal termina. <strong>A luz continua.</strong>
          </p>
        </section>

        <footer className="archive-footer">
          <p>
            Fatos, imagens e modelos: NASA/JPL-Caltech, Cornell, ASU e USGS.
            Texturas do Sistema Solar: Solar System Scope, CC BY 4.0. Via
            Láctea: ESO/S. Brunier, CC BY 4.0.
          </p>
          <button type="button" onClick={openSources}>
            Ver todas as fontes
            <ExternalLink aria-hidden="true" size={16} />
          </button>
        </footer>
      </main>
      <OdsBadges locale="pt-BR" />
      <SourcesPanel />
    </div>
  );
}
