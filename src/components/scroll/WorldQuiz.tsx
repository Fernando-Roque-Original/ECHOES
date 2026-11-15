import {
  Check,
  FlaskConical,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useId, useState, type CSSProperties } from 'react';
import type { Quiz } from '../../i18n';

type WorldQuizProps = {
  quiz: Quiz;
  onFinish: () => void;
};

export function WorldQuiz({ quiz, onFinish }: WorldQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const feedbackId = useId();
  const selectedAnswer =
    selected === null ? null : (quiz.answers[selected] ?? null);
  const solved = selectedAnswer?.correct === true;
  const feedback =
    selectedAnswer === null
      ? quiz.idleFeedback
      : selectedAnswer.correct
        ? quiz.correctFeedback
        : quiz.incorrectFeedback;

  return (
    <div className="cine-quiz">
      <p className="cine-quiz__eyebrow">
        <FlaskConical aria-hidden="true" size={15} />
        {quiz.hypothesisLabel}
      </p>
      <div
        className="cine-quiz__answers"
        role="group"
        aria-label={quiz.answersLabel}
        aria-describedby={feedbackId}
      >
        {quiz.answers.map((answer, index) => {
          const isSelected = selected === index;
          const stateClass = isSelected
            ? answer.correct
              ? ' is-correct'
              : ' is-incorrect'
            : '';

          return (
            <button
              type="button"
              key={answer.label}
              className={`cine-quiz__answer${
                isSelected ? ' is-selected' : ''
              }${stateClass}`}
              aria-pressed={isSelected}
              onClick={() => setSelected(index)}
              style={
                {
                  '--answer-index': index,
                } as CSSProperties
              }
            >
              <span>{String.fromCharCode(65 + index)}</span>
              {answer.label}
            </button>
          );
        })}
      </div>

      <div
        id={feedbackId}
        className={`cine-quiz__feedback${
          selectedAnswer
            ? selectedAnswer.correct
              ? ' is-correct'
              : ' is-incorrect'
            : ''
        }`}
        role="status"
        aria-live="polite"
      >
        <span className="cine-quiz__feedback-icon" aria-hidden="true">
          {selectedAnswer ? (
            selectedAnswer.correct ? (
              <Sparkles size={16} />
            ) : (
              <RotateCcw size={15} />
            )
          ) : (
            <FlaskConical size={14} />
          )}
        </span>
        <span>{feedback}</span>
      </div>

      {solved ? (
        <button
          className="cine-action cine-quiz__finish"
          type="button"
          onClick={onFinish}
        >
          {quiz.finishLabel}
          <Check aria-hidden="true" size={17} />
        </button>
      ) : null}
    </div>
  );
}
