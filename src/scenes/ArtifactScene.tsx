import {
  ArrowUpRight,
  Camera,
  Expand,
  Info,
  Layers,
  Move3D,
  RotateCcw,
  SunMedium,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  Suspense,
  lazy,
  useMemo,
  useState,
  type KeyboardEvent,
} from 'react';
import { ArchiveImage } from '../components/ArchiveImage';
import { BigButton } from '../components/BigButton';
import { EvidenceLabel } from '../components/EvidenceLabel';
import { Modal } from '../components/Modal';
import { RoverSchematic } from '../components/RoverSchematic';
import { opportunityStory } from '../content/opportunity';
import { nasaUrls } from '../content/missions';
import { supportsWebGL } from '../lib/webgl';
import { useExperienceStore } from '../state/experienceStore';
import { WebGLFallback } from './WebGLCapability';

const RoverViewer = lazy(() => import('./RoverViewer'));
const RoverTeardown = lazy(() => import('../components/RoverTeardown'));

type AnatomyView = 'modelo' | 'esquema';

const hotspotIcons = {
  wheels: Move3D,
  'solar-panels': SunMedium,
  cameras: Camera,
};

export function ArtifactScene() {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [anatomyOpen, setAnatomyOpen] = useState(false);
  const [anatomyView, setAnatomyView] = useState<AnatomyView>('modelo');
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const openStory = useExperienceStore((state) => state.openStory);
  const historicPhotoOpen = useExperienceStore((state) => state.historicPhotoOpen);
  const setHistoricPhotoOpen = useExperienceStore(
    (state) => state.setHistoricPhotoOpen,
  );
  const webgl = useMemo(supportsWebGL, []);
  const effectiveAnatomyView = webgl ? anatomyView : 'esquema';
  const activeHotspot = opportunityStory.hotspots.find(
    (hotspot) => hotspot.id === selectedHotspot,
  );

  const handleAnatomyTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (!webgl) return;
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }

    event.preventDefault();
    const next =
      event.key === 'Home'
        ? 'modelo'
        : event.key === 'End'
          ? 'esquema'
          : effectiveAnatomyView === 'modelo'
            ? 'esquema'
            : 'modelo';
    setAnatomyView(next);
    window.requestAnimationFrame(() => {
      document.getElementById(`anatomy-tab-${next}`)?.focus();
    });
  };

  return (
    <section className="artifact-screen" aria-labelledby="artifact-title">
      <div className="artifact-stage">
        <div className="artifact-stage__label">
          <EvidenceLabel kind="modelo-3d-nasa" sourceUrl={nasaUrls.opportunityModel} />
          <span className="artifact-stage__instructions">
            <RotateCcw aria-hidden="true" size={15} />
            Arraste para girar
          </span>
        </div>

        <div className="artifact-viewer">
          {webgl ? (
            <Suspense
              fallback={
                <div className="artifact-loading" role="status">
                  <span className="loading-orbit" aria-hidden="true" />
                  <strong>Preparando o Opportunity...</strong>
                  <span>Carregando o modelo oficial da NASA.</span>
                </div>
              }
            >
              <RoverViewer resetKey={resetKey} reducedMotion={reducedMotion} />
            </Suspense>
          ) : (
            <div className="artifact-viewer__fallback">
              <ArchiveImage
                asset={opportunityStory.artifactFallbackImage!}
                eager
                showCaption
              />
              <WebGLFallback
                title="Objeto em 2D"
                body="A foto real substitui o modelo 3D e os pontos continuam disponíveis."
              />
            </div>
          )}

          {opportunityStory.hotspots.map((hotspot, index) => {
            const Icon = hotspotIcons[hotspot.id as keyof typeof hotspotIcons] ?? Info;
            return (
              <button
                key={hotspot.id}
                type="button"
                className={`hotspot-pin ${selectedHotspot === hotspot.id ? 'is-active' : ''}`}
                style={hotspot.screenPosition}
                onClick={() => setSelectedHotspot(hotspot.id)}
                aria-label={`Hotspot ${index + 1}: ${hotspot.label}`}
                aria-pressed={selectedHotspot === hotspot.id}
              >
                <span>
                  <Icon aria-hidden="true" size={16} />
                </span>
                <small>{hotspot.label}</small>
              </button>
            );
          })}

          {webgl ? (
            <button
              className="artifact-recenter"
              type="button"
              onClick={() => setResetKey((key) => key + 1)}
            >
              <RotateCcw aria-hidden="true" size={16} />
              Recentrar
            </button>
          ) : null}
        </div>
      </div>

      <motion.aside
        className="artifact-plaque"
        initial={reducedMotion ? false : { opacity: 0, x: 22 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reducedMotion ? 0.12 : 0.55 }}
      >
        <p className="eyebrow">Objeto 001 · Mars Exploration Rover</p>
        <h1 id="artifact-title">Opportunity</h1>
        <p className="artifact-plaque__tagline">
          Projetado para uma temporada curta. Ficou para uma longa história.
        </p>

        <div className="artifact-facts">
          <span>
            <strong>90</strong>
            dias marcianos planejados
          </span>
          <span>
            <strong>14+</strong>
            anos explorando Marte
          </span>
        </div>

        <button
          className="artifact-anatomy-cta"
          type="button"
          onClick={() => setAnatomyOpen(true)}
        >
          <span className="artifact-anatomy-cta__icon">
            <Layers aria-hidden="true" size={22} />
          </span>
          <span>
            <strong>Desmontar em 3D</strong>
            <small>Abra camadas, orbite e compare com o esquema por dentro</small>
          </span>
          <ArrowUpRight aria-hidden="true" size={19} />
        </button>

        <div className="artifact-hotspots" aria-label="Partes do rover">
          <p>Toque em um ponto para conhecer uma parte:</p>
          <div>
            {opportunityStory.hotspots.map((hotspot, index) => (
              <button
                key={hotspot.id}
                type="button"
                className={selectedHotspot === hotspot.id ? 'is-active' : ''}
                onClick={() => setSelectedHotspot(hotspot.id)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {hotspot.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`hotspot-detail ${activeHotspot ? 'is-open' : ''}`} aria-live="polite">
          {activeHotspot ? (
            <>
              <span className="hotspot-detail__index">
                {String(
                  opportunityStory.hotspots.findIndex(
                    (item) => item.id === activeHotspot.id,
                  ) + 1,
                ).padStart(2, '0')}
              </span>
              <div>
                <h2>{activeHotspot.label}</h2>
                <p>{activeHotspot.detail}</p>
                <a href={activeHotspot.sourceUrl} target="_blank" rel="noreferrer">
                  Ver fonte NASA
                </a>
              </div>
            </>
          ) : (
            <p className="hotspot-detail__prompt">
              O que será que existe dentro desse pequeno explorador?
            </p>
          )}
        </div>

        <div className="artifact-actions">
          <BigButton onClick={openStory} showArrow>
            Ouvir a história
          </BigButton>
          <BigButton
            variant="secondary"
            icon={<Expand aria-hidden="true" size={18} />}
            onClick={() => setHistoricPhotoOpen(true)}
          >
            Ver foto histórica
          </BigButton>
        </div>
      </motion.aside>

      <Modal
        open={historicPhotoOpen}
        onClose={() => setHistoricPhotoOpen(false)}
        eyebrow="Arquivo de imagem"
        title="O Opportunity em Marte"
        wide
      >
        <ArchiveImage
          asset={opportunityStory.artifactFallbackImage!}
          showCaption
          eager
        />
        <p className="modal-copy">
          Esta é uma foto real, mas não é uma imagem atual. O autorretrato foi
          montado com imagens registradas pelo próprio rover entre 3 e 6 de
          janeiro de 2014.
        </p>
        <div className="modal-actions">
          <BigButton
            variant="secondary"
            onClick={() => window.open(nasaUrls.opportunitySelfie, '_blank', 'noopener')}
          >
            Abrir página da NASA
          </BigButton>
          <BigButton onClick={() => setHistoricPhotoOpen(false)}>Voltar ao objeto</BigButton>
        </div>
      </Modal>

      <Modal
        open={anatomyOpen}
        onClose={() => setAnatomyOpen(false)}
        eyebrow="Leitura interativa · modelo oficial + esquema ilustrativo"
        title="Desmontar o Opportunity"
        wide
        className="modal--schematic"
      >
        <div className="anatomy-modal">
          <div
            className="anatomy-tabs"
            role="tablist"
            aria-label="Formas de explorar o Opportunity"
          >
            <button
              id="anatomy-tab-modelo"
              type="button"
              role="tab"
              aria-selected={effectiveAnatomyView === 'modelo'}
              aria-controls="anatomy-panel-modelo"
              tabIndex={effectiveAnatomyView === 'modelo' ? 0 : -1}
              disabled={!webgl}
              onClick={() => setAnatomyView('modelo')}
              onKeyDown={handleAnatomyTabKeyDown}
            >
              Modelo 3D
              <small>
                {webgl ? 'Grupos de material do GLB' : 'WebGL indisponível'}
              </small>
            </button>
            <button
              id="anatomy-tab-esquema"
              type="button"
              role="tab"
              aria-selected={effectiveAnatomyView === 'esquema'}
              aria-controls="anatomy-panel-esquema"
              tabIndex={effectiveAnatomyView === 'esquema' ? 0 : -1}
              onClick={() => setAnatomyView('esquema')}
              onKeyDown={handleAnatomyTabKeyDown}
            >
              Esquema 2D
              <small>Peças e interior ilustrativos</small>
            </button>
          </div>

          <div
            id="anatomy-panel-modelo"
            role="tabpanel"
            aria-labelledby="anatomy-tab-modelo"
            hidden={effectiveAnatomyView !== 'modelo'}
          >
            {effectiveAnatomyView === 'modelo' ? (
              <Suspense
                fallback={
                  <div className="anatomy-loading" role="status">
                    <span className="loading-orbit" aria-hidden="true" />
                    <strong>Preparando o desmonte...</strong>
                    <span>Separando os grupos de material do GLB da NASA.</span>
                  </div>
                }
              >
                <RoverTeardown reducedMotion={reducedMotion} />
              </Suspense>
            ) : null}
          </div>

          <div
            id="anatomy-panel-esquema"
            role="tabpanel"
            aria-labelledby="anatomy-tab-esquema"
            hidden={effectiveAnatomyView !== 'esquema'}
          >
            {effectiveAnatomyView === 'esquema' ? (
              <RoverSchematic reducedMotion={reducedMotion} />
            ) : null}
          </div>
        </div>
      </Modal>
    </section>
  );
}

