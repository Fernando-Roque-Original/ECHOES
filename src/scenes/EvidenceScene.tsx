import {
  ArrowRight,
  Brain,
  Check,
  CircleHelp,
  RotateCcw,
  ScanLine,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { ArchiveImage } from '../components/ArchiveImage';
import { BigButton } from '../components/BigButton';
import { EvidenceLabel } from '../components/EvidenceLabel';
import { opportunityStory } from '../content/opportunity';
import { nasaUrls } from '../content/missions';
import { useExperienceStore } from '../state/experienceStore';

export function EvidenceScene() {
  const [stage, setStage] = useState<'record' | 'question'>('record');
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const openLegacy = useExperienceStore((state) => state.openLegacy);
  const quiz = opportunityStory.quiz;

  const chooseAnswer = (index: number) => {
    setSelected(index);
    if (index === quiz.correctAnswerIndex) setSolved(true);
  };

  return (
    <section className="evidence-screen" aria-labelledby="evidence-title">
      <div className="evidence-layout">
        <div className="evidence-record">
          <div className="evidence-record__frame">
            <ArchiveImage asset={opportunityStory.finalEvidence} eager />
            <div className="evidence-record__scan" aria-hidden="true">
              <ScanLine />
              <span>Transmissão 5111</span>
            </div>
            <span className="evidence-record__date">10 · 06 · 2018</span>
          </div>
          <div className="evidence-record__meta">
            <EvidenceLabel
              kind={opportunityStory.finalEvidence.kind}
              sourceUrl={nasaUrls.opportunityLastMessage}
            />
            <span>{opportunityStory.finalEvidence.credit}</span>
          </div>
        </div>

        <div className="evidence-copy">
          <AnimatePresence mode="wait">
            {stage === 'record' ? (
              <motion.div
                key="record"
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: reducedMotion ? 0.1 : 0.38 }}
              >
                <p className="eyebrow">Evidência 001 · último dado recebido</p>
                <h1 id="evidence-title">O último registro.</h1>
                <p className="evidence-copy__lead">
                  Isto não é uma frase. É uma imagem incompleta.
                </p>
                <p>
                  Em 10 de junho de 2018, durante uma tempestade de poeira, o
                  Opportunity enviou este último conjunto de dados. Depois, o
                  sinal não voltou.
                </p>
                <div className="evidence-fact">
                  <span>Último contato</span>
                  <strong>10/06/2018</strong>
                  <small>Sol 5111 da missão</small>
                </div>
                <div className="evidence-fact">
                  <span>Fim da missão anunciado</span>
                  <strong>13/02/2019</strong>
                  <small>Após mais de mil tentativas de contato</small>
                </div>
                <p className="evidence-warning">
                  A frase “minha bateria está baixa e está ficando escuro” não
                  foi enviada pelo rover. Não usamos essa invenção como registro.
                </p>
                <BigButton
                  onClick={() => setStage('question')}
                  icon={<Brain aria-hidden="true" size={20} />}
                  showArrow
                >
                  Fazer uma descoberta
                </BigButton>
              </motion.div>
            ) : (
              <motion.div
                key="question"
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: reducedMotion ? 0.1 : 0.38 }}
                className="quiz-card"
              >
                <p className="eyebrow">Pergunta de compreensão</p>
                <CircleHelp aria-hidden="true" className="quiz-card__icon" />
                <h1 id="evidence-title">{quiz.prompt}</h1>
                <div className="quiz-options" role="group" aria-label="Respostas">
                  {quiz.answers.map((answer, index) => {
                    const isWrong = selected === index && index !== quiz.correctAnswerIndex;
                    const isRight = solved && index === quiz.correctAnswerIndex;
                    return (
                      <button
                        key={answer}
                        type="button"
                        className={`${isRight ? 'is-correct' : ''} ${isWrong ? 'is-wrong' : ''}`}
                        onClick={() => chooseAnswer(index)}
                        aria-pressed={selected === index}
                      >
                        <span>{String.fromCharCode(65 + index)}</span>
                        <strong>{answer}</strong>
                        {isRight ? <Check aria-hidden="true" /> : null}
                        {isWrong ? <RotateCcw aria-hidden="true" /> : null}
                      </button>
                    );
                  })}
                </div>

                <div className="quiz-feedback" aria-live="polite">
                  {solved ? (
                    <>
                      <strong>Pista encontrada.</strong>
                      <p>{quiz.explanation}</p>
                    </>
                  ) : selected !== null ? (
                    <p>
                      Ainda não. Procure a resposta ligada às rochas e à água
                      antiga.
                    </p>
                  ) : (
                    <p>Escolha uma resposta. Você pode tentar de novo.</p>
                  )}
                </div>

                {solved ? (
                  <BigButton onClick={openLegacy} showArrow>
                    Ver o que ficou
                  </BigButton>
                ) : (
                  <button
                    type="button"
                    className="step-button"
                    onClick={() => setStage('record')}
                  >
                    <ArrowRight aria-hidden="true" size={16} />
                    Rever o último registro
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

