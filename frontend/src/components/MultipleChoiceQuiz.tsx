import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { MediaFrame, QuizHeader, QuizStyles, defaultLabels, useCountdown, useLater } from './quizShared';
import type { QuizLabels } from './quizShared';

/** Exactly 2 or exactly 4 choices, enforced by TypeScript. */
export type Choices = [string, string] | [string, string, string, string];

export type MultipleChoiceResult = {
  /** Index of the chosen choice, or null if the timer ran out. */
  selectedIndex: number | null;
  correct: boolean;
  timeLeft: number;
};

type Props = {
  question: string;
  choices: Choices;
  /** Index (0-3) of the single right answer. */
  correctIndex: number;
  /** Number shown in the header. */
  questionsLeft: number;
  /** Seconds. Default 20. */
  timeLimit?: number;
  /** Image, video, or any element shown in the center rectangle. */
  media?: ReactNode;
  /** How long the right/wrong feedback stays before onAnswer fires. Default 1400 ms. */
  revealMs?: number;
  labels?: Partial<QuizLabels>;
  onAnswer: (result: MultipleChoiceResult) => void;
};

/**
 * Render with a `key` that changes per question so state and timer reset:
 *   <MultipleChoiceQuiz key={q.id} ... />
 * Keyboard: press 1-4 to answer.
 */
export default function MultipleChoiceQuiz({
  question,
  choices,
  correctIndex,
  questionsLeft,
  timeLimit = 20,
  media,
  revealMs = 1400,
  labels,
  onAnswer,
}: Props) {
  const l = { ...defaultLabels, ...labels };
  const later = useLater();
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const timeLeft = useCountdown(timeLimit, !locked, () => lock(null));

  function lock(index: number | null) {
    if (locked) return;
    setSelected(index);
    setTimedOut(index === null);
    setLocked(true);
    later(
      () => onAnswer({ selectedIndex: index, correct: index === correctIndex, timeLeft }),
      revealMs,
    );
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const i = Number(e.key) - 1;
      if (Number.isInteger(i) && i >= 0 && i < choices.length) lock(i);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const wasCorrect = locked && selected === correctIndex;
  const status = !locked ? '' : timedOut ? l.timeUp : wasCorrect ? l.correct : l.wrong;

  return (
    <section className="qz-root">
      <QuizStyles />
      <QuizHeader
        question={question}
        timeLeft={timeLeft}
        timeLimit={timeLimit}
        questionsLeft={questionsLeft}
        labels={l}
      />

      <MediaFrame>{media}</MediaFrame>

      <div className="qz-choices">
        {choices.map((text, i) => {
          const state = !locked
            ? ''
            : i === correctIndex
              ? 'is-correct'
              : i === selected
                ? 'is-wrong'
                : 'is-dim';
          const badge = locked && i === correctIndex ? '✓' : locked && i === selected ? '✕' : i + 1;

          return (
            <button
              key={i}
              type="button"
              className={`qz-choice ${state}`}
              disabled={locked}
              onClick={() => lock(i)}
            >
              <span className="qz-key" aria-hidden="true">
                {badge}
              </span>
              <span>{text}</span>
            </button>
          );
        })}
      </div>

      <p className={`qz-status ${locked ? (wasCorrect ? 'is-good' : 'is-bad') : ''}`} role="status">
        {status}
      </p>
    </section>
  );
}
