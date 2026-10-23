import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { MediaFrame, QuizHeader, QuizStyles, defaultLabels, useCountdown, useLater } from './quizShared';
import type { QuizLabels } from './quizShared';

export type TypedAnswerResult = {
  /** What the person had typed. */
  value: string;
  correct: boolean;
  timedOut: boolean;
  timeLeft: number;
};

type Props = {
  question: string;
  /** One accepted answer, or several (e.g. ['color', 'colour']). */
  answer: string | string[];
  questionsLeft: number;
  /** Seconds. Default 30. */
  timeLimit?: number;
  /** Image, video, or any element shown in the center rectangle. */
  media?: ReactNode;
  /** Default false: "Paris" and "paris" both match. */
  caseSensitive?: boolean;
  /** Default true: "ete" matches "été". Set false to require accents. */
  ignoreAccents?: boolean;
  /** How long the feedback stays before onAnswer fires. Default 1800 ms. */
  revealMs?: number;
  labels?: Partial<QuizLabels>;
  onAnswer: (result: TypedAnswerResult) => void;
};

function normalize(text: string, caseSensitive: boolean, ignoreAccents: boolean): string {
  let out = text.trim().replace(/\s+/g, ' ');
  if (ignoreAccents) out = out.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!caseSensitive) out = out.toLocaleLowerCase();
  return out;
}

type Outcome = 'correct' | 'wrong' | 'timeout' | null;

/**
 * Render with a `key` that changes per question so state and timer reset.
 * When the timer runs out, whatever is typed at that moment is checked.
 */
export default function TypedAnswerQuiz({
  question,
  answer,
  questionsLeft,
  timeLimit = 30,
  media,
  caseSensitive = false,
  ignoreAccents = true,
  revealMs = 1800,
  labels,
  onAnswer,
}: Props) {
  const l = { ...defaultLabels, ...labels };
  const later = useLater();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [outcome, setOutcome] = useState<Outcome>(null);
  const locked = outcome !== null;

  const accepted = Array.isArray(answer) ? answer : [answer];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const timeLeft = useCountdown(timeLimit, !locked, () => finish(true));

  function finish(timedOut: boolean) {
    if (locked) return;
    const typed = normalize(value, caseSensitive, ignoreAccents);
    const correct = accepted.some((a) => normalize(a, caseSensitive, ignoreAccents) === typed);
    setOutcome(correct ? 'correct' : timedOut ? 'timeout' : 'wrong');
    later(() => onAnswer({ value, correct, timedOut, timeLeft }), revealMs);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (value.trim() !== '') finish(false);
  }

  const status =
    outcome === 'correct' ? l.correct : outcome === 'timeout' ? l.timeUp : outcome === 'wrong' ? l.wrong : '';

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

      <form className="qz-answer" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className={`qz-input${outcome === 'correct' ? ' is-correct' : locked ? ' is-wrong' : ''}`}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={locked}
          placeholder={l.placeholder}
          aria-label={l.placeholder}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <button type="submit" className="qz-submit" disabled={locked || value.trim() === ''}>
          {l.submit}
        </button>
      </form>

      <p className={`qz-status ${outcome === 'correct' ? 'is-good' : locked ? 'is-bad' : ''}`} role="status">
        {status}
      </p>
      {locked && outcome !== 'correct' && <p className="qz-reveal">{l.answerIs(accepted[0])}</p>}
    </section>
  );
}
