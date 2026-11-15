import {
  ArrowRight,
  Compass,
  Crosshair,
  MapPin,
  Route,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { ArchiveImage } from '../components/ArchiveImage';
import { BigButton } from '../components/BigButton';
import { EvidenceLabel } from '../components/EvidenceLabel';
import { opportunityStory } from '../content/opportunity';
import { nasaUrls } from '../content/missions';
import { useExperienceStore } from '../state/experienceStore';

export function SurfaceMap() {
  const [focused, setFocused] = useState(false);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const openArtifact = useExperienceStore((state) => state.openArtifact);
  const asset = opportunityStory.mapImage;

  return (
    <section className="map-screen" aria-labelledby="map-title">
      <div className="map-screen__intro">
        <div>
          <p className="eyebrow">Arquivo cartográfico · Marte</p>
          <h1 id="map-title">
            Um pequeno rover.
            <br />
            Um rastro gigantesco.
          </h1>
        </div>
        <p className="map-screen__lede">
          O Opportunity percorreu cerca de 45 quilômetros. O mapa abaixo mostra
          a rota real entre Eagle Crater e Perseverance Valley.
        </p>
      </div>

      <div className={`map-layout ${focused ? 'is-focused' : ''}`}>
        <motion.div
          className="map-frame"
          animate={{ scale: focused ? 1.045 : 1 }}
          transition={{
            duration: reducedMotion ? 0.12 : 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="map-frame__grid" aria-hidden="true" />
          <ArchiveImage asset={asset!} className="map-frame__image" eager />
          <div className="map-frame__north" aria-hidden="true">
            <Compass />
            <span>N</span>
          </div>
          <button
            type="button"
            className={`map-marker ${focused ? 'is-active' : ''}`}
            style={{ left: '36.5%', top: '67%' }}
            onClick={() => setFocused(true)}
            aria-label="Opportunity, em Perseverance Valley. Abrir cartão da missão."
          >
            <span className="map-marker__pulse" aria-hidden="true" />
            <span className="map-marker__pin">
              <MapPin aria-hidden="true" />
            </span>
            <span className="map-marker__label">
              Opportunity
              <small>Perseverance Valley</small>
            </span>
          </button>
          <div className="map-frame__legend">
            <span>
              <Route aria-hidden="true" /> Rota: 45,16 km
            </span>
            <a href={nasaUrls.opportunityTraverse} target="_blank" rel="noreferrer">
              Mapa real NASA
              <ArrowRight aria-hidden="true" size={14} />
            </a>
          </div>
        </motion.div>

        <motion.aside
          className="map-record"
          aria-live="polite"
          initial={reducedMotion ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reducedMotion ? 0 : 0.25, duration: 0.55 }}
        >
          <div className="map-record__top">
            <EvidenceLabel kind="mapa-cientifico" sourceUrl={nasaUrls.opportunityTraverse} />
            <span className="map-record__coords">Meridiani Planum · Marte</span>
          </div>
          <p className="eyebrow">Objeto em exibição</p>
          <h2>Opportunity</h2>
          <p className="map-record__tagline">{opportunityStory.tagline}</p>
          <div className="map-record__location">
            <Crosshair aria-hidden="true" />
            <span>{opportunityStory.locationLabel}</span>
          </div>
          <p className="map-record__note">
            A posição no mapa corresponde ao percurso documentado pela NASA.
            Pequenos trechos do relevo ainda podem variar em escala.
          </p>
          <BigButton onClick={openArtifact} showArrow>
            Conhecer o Opportunity
          </BigButton>
          <p className="microcopy">
            Próximo: um objeto oficial da NASA em 3D.
          </p>
        </motion.aside>
      </div>
    </section>
  );
}

