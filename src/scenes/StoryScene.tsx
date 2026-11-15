import {
  ArrowLeft,
  Captions,
  CirclePause,
  CirclePlay,
  Mic,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ArchiveImage } from '../components/ArchiveImage';
import { BigButton } from '../components/BigButton';
import { EvidenceLabel } from '../components/EvidenceLabel';
import { opportunityStory } from '../content/opportunity';
import { useNarration } from '../hooks/useNarration';
import { useExperienceStore } from '../state/experienceStore';

export function StoryScene() {
  const chapterIndex = useExperienceStore((state) => state.chapterIndex);
  const setChapter = useExperienceStore((state) => state.setChapter);
  const nextChapter = useExperienceStore((state) => state.nextChapter);
  const previousChapter = useExperienceStore((state) => state.previousChapter);
  const audioEnabled = useExperienceStore((state) => state.audioEnabled);
  const subtitlesEnabled = useExperienceStore((state) => state.subtitlesEnabled);
  const toggleAudio = useExperienceStore((state) => state.toggleAudio);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const chapter = opportunityStory.chapters[chapterIndex];
  const narration = useNarration(chapter.text, audioEnabled);
  const lastChapter = chapterIndex === opportunityStory.chapters.length - 1;

  return (
    <section className="story-screen" aria-labelledby="story-title">
      <div className="story-layout">
        <div className="story-media">
          <AnimatePresence mode="wait">
            <motion.div
              key={chapter.id}
              className="story-media__inner"
              initial={reducedMotion ? false : { opacity: 0, scale: 1.018 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.12 : 0.48 }}
            >
              {chapter.media ? (
                <ArchiveImage asset={chapter.media} eager />
              ) : (
                <div className="story-media__empty" />
              )}
            </motion.div>
          </AnimatePresence>
          <div className="story-media__meta">
            {chapter.media ? (
              <EvidenceLabel
                kind={chapter.media.kind}
                sourceUrl={chapter.media.externalUrl}
              />
            ) : null}
            <span>{chapter.media?.credit}</span>
          </div>
        </div>

        <div className="story-copy">
          <div className="story-copy__top">
            <span>
              Capítulo {chapterIndex + 1} de {opportunityStory.chapters.length}
            </span>
            <div className="story-audio">
              <button
                type="button"
                className="audio-button"
                aria-pressed={audioEnabled}
                onClick={toggleAudio}
              >
                {audioEnabled ? (
                  <CirclePause aria-hidden="true" />
                ) : (
                  <CirclePlay aria-hidden="true" />
                )}
                {audioEnabled ? 'Pausar narração' : 'Ouvir este capítulo'}
              </button>
              {narration.supported ? (
                <>
                  <button
                    type="button"
                    className="audio-replay"
                    onClick={() => {
                      if (audioEnabled) narration.speak();
                      else toggleAudio();
                    }}
                  >
                    Repetir
                  </button>
                  <span className="audio-source">
                    <Mic aria-hidden="true" size={13} />
                    Voz do navegador
                  </span>
                </>
              ) : (
                <span className="audio-source">História disponível em texto</span>
              )}
            </div>
          </div>

          <div className="story-chapter-nav" aria-label="Capítulos da história">
            {opportunityStory.chapters.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setChapter(index)}
                className={
                  index === chapterIndex ? 'is-current' : index < chapterIndex ? 'is-read' : ''
                }
                aria-current={index === chapterIndex ? 'step' : undefined}
              >
                <span>{index + 1}</span>
                <span className="sr-only">{item.title}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              className="story-text"
              key={chapter.id}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: reducedMotion ? 0.1 : 0.38 }}
            >
              <h1 id="story-title">{chapter.title}</h1>
              <p className="story-text__quote">“{chapter.text}”</p>
              <p className="story-text__caption">
                <Captions aria-hidden="true" />
                {subtitlesEnabled
                  ? 'Legenda da narração visível'
                  : 'Legenda oculta nos ajustes'}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="story-copy__foot">
            <p>{chapter.media?.caption}</p>
            <div className="story-navigation">
              <button
                type="button"
                className="step-button"
                onClick={previousChapter}
                disabled={chapterIndex === 0}
              >
                <ArrowLeft aria-hidden="true" size={17} />
                Anterior
              </button>
              <BigButton onClick={nextChapter} showArrow>
                {lastChapter ? 'Ver o último registro' : 'Próximo capítulo'}
              </BigButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

