import { ArrowRight, BookOpenText, Moon, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { ArchiveImage } from '../components/ArchiveImage';
import { BigButton } from '../components/BigButton';
import { opportunityStory } from '../content/opportunity';
import { useExperienceStore } from '../state/experienceStore';

export function LegacyScene() {
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const demoMode = useExperienceStore((state) => state.demoMode);
  const demoStartedAt = useExperienceStore((state) => state.demoStartedAt);
  const goHome = useExperienceStore((state) => state.goHome);
  const openSources = useExperienceStore((state) => state.openSources);
  const elapsed = demoStartedAt
    ? Math.max(1, Math.floor((Date.now() - demoStartedAt) / 1000))
    : null;

  const exploreMoon = () => {
    goHome();
    useExperienceStore.setState({ moonNoticeOpen: true });
  };

  return (
    <section className="legacy-screen" aria-labelledby="legacy-title">
      <div className="legacy-backdrop" aria-hidden="true">
        <ArchiveImage asset={opportunityStory.chapters[1].media!} eager />
      </div>
      <div className="legacy-vignette" aria-hidden="true" />

      <motion.div
        className="legacy-copy"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.15 : 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow">Fim da transmissão · legado preservado</p>
        <h1 id="legacy-title">
          O sinal terminou.
          <br />
          A descoberta ficou.
        </h1>
        <p className="legacy-copy__lede">
          O Opportunity ajudou a mostrar que Marte já teve ambientes com água.
          Hoje, suas pistas continuam no arquivo da missão.
        </p>

        <div className="legacy-stats" aria-label="Números da missão">
          <span>
            <strong>90</strong>
            dias marcianos planejados
          </span>
          <span>
            <strong>14+</strong>
            anos explorando
          </span>
          <span>
            <strong>45,16</strong>
            quilômetros percorridos
          </span>
        </div>

        {demoMode ? (
          <p className="legacy-demo-score">
            <span>Modo pitch</span>
            Percurso concluído em {elapsed ?? 90} segundos.
          </p>
        ) : null}

        <div className="legacy-actions">
          <BigButton
            icon={<Moon aria-hidden="true" size={19} />}
            onClick={exploreMoon}
          >
            Explorar outra história
            <ArrowRight aria-hidden="true" size={18} />
          </BigButton>
          <BigButton
            variant="secondary"
            icon={<RotateCcw aria-hidden="true" size={18} />}
            onClick={goHome}
          >
            Voltar ao início
          </BigButton>
          <button className="text-button" type="button" onClick={openSources}>
            <BookOpenText aria-hidden="true" size={16} />
            O que é real aqui?
          </button>
        </div>
      </motion.div>

      <div className="legacy-signoff">
        <span className="legacy-signoff__line" aria-hidden="true" />
        <span>O sinal termina. A luz continua.</span>
      </div>
    </section>
  );
}

