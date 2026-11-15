import { useId, useState } from 'react';
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
            >
              <span>{String.fromCharCode(65 + index)}</span>
              {answer.label}
            </button>
          );
        })}
      </div>

      <div
        id={feedbackId}
        className="cine-quiz__feedback"
        role="status"
        aria-live="polite"
      >
        {feedback}
      </div>

      {solved ? (
        <button className="cine-action" type="button" onClick={onFinish}>
          {quiz.finishLabel}
        </button>
      ) : null}
    </div>
  );
}
