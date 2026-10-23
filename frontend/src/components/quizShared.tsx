import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/*  Labels (override any of them through the `labels` prop for i18n)   */
/* ------------------------------------------------------------------ */

export type QuizLabels = {
  questionsLeft: (n: number) => string;
  correct: string;
  wrong: string;
  timeUp: string;
  answerIs: (answer: string) => string;
  placeholder: string;
  submit: string;
  check: string;
  matchHint: string;
  score: (n: number, total: number) => string;
};

export const defaultLabels: QuizLabels = {
  questionsLeft: (n) => `${n} ${n === 1 ? 'question' : 'questions'} left`,
  correct: 'Correct!',
  wrong: 'Not quite.',
  timeUp: 'Time’s up.',
  answerIs: (a) => `Answer: ${a}`,
  placeholder: 'Type your answer',
  submit: 'Submit answer',
  check: 'Check matches',
  matchHint:
    'Drag the items on the right to line them up with the left. With a keyboard, focus an item and press ↑ or ↓.',
  score: (n, total) => (n === total ? 'All matched!' : `${n} of ${total} matched`),
};

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/** Counts down in whole seconds while `running`. Calls `onExpire` once at 0. */
export function useCountdown(seconds: number, running: boolean, onExpire: () => void): number {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const expire = useRef(onExpire);

  useEffect(() => {
    expire.current = onExpire;
  });

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && timeLeft === 0) expire.current();
  }, [running, timeLeft]);

  return timeLeft;
}

/** setTimeout that is cancelled automatically when the component unmounts. */
export function useLater() {
  const ids = useRef<number[]>([]);

  useEffect(() => {
    const list = ids.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  return (fn: () => void, ms: number) => {
    ids.current.push(window.setTimeout(fn, ms));
  };
}

/* ------------------------------------------------------------------ */
/*  Building blocks                                                    */
/* ------------------------------------------------------------------ */

const formatTime = (t: number) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;

type HeaderProps = {
  question: string;
  timeLeft: number;
  timeLimit: number;
  questionsLeft: number;
  labels: QuizLabels;
};

export function QuizHeader({ question, timeLeft, timeLimit, questionsLeft, labels }: HeaderProps) {
  const pct = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0;
  const urgent = timeLeft <= Math.max(5, timeLimit * 0.25);

  return (
    <header className="qz-header">
      <div className="qz-meta">
        <span>{labels.questionsLeft(questionsLeft)}</span>
        <span className={`qz-time${urgent ? ' is-urgent' : ''}`} role="timer">
          {formatTime(timeLeft)}
        </span>
      </div>
      <div className="qz-bar" aria-hidden="true">
        <div className={`qz-bar-fill${urgent ? ' is-urgent' : ''}`} style={{ width: `${pct}%` }} />
      </div>
      <h2 className="qz-question">{question}</h2>
    </header>
  );
}

/** 16:9 rectangle for an <img>, <video>, <iframe>, or any element. Hidden when empty. */
export function MediaFrame({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <div className="qz-media">{children}</div>;
}

export function QuizStyles() {
  return <style>{css}</style>;
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const css = `
.qz-root {
  --ink: #1b2540; --muted: #5e6a85; --paper: #f5f7fb; --card: #ffffff; --line: #d6dceb;
  --accent: #4b5bd6; --accent-soft: #e6e9fb; --on-solid: #ffffff;
  --good: #17875a; --good-soft: #ddf3e8; --bad: #c93a47; --bad-soft: #fadfe1;
  box-sizing: border-box; width: 100%; max-width: 720px; margin: 0 auto; padding: 20px;
  display: flex; flex-direction: column; gap: 20px;
  background: var(--paper); color: var(--ink); border-radius: 20px; font-family: inherit;
}
.qz-root *, .qz-root *::before, .qz-root *::after { box-sizing: border-box; }
@media (prefers-color-scheme: dark) {
  .qz-root {
    --ink: #e8ecf8; --muted: #9aa6c4; --paper: #12182b; --card: #1b2340; --line: #323c5e;
    --accent: #8c9bff; --accent-soft: #262f57; --on-solid: #0e1424;
    --good: #4cd39a; --good-soft: #143a2c; --bad: #ff7c87; --bad-soft: #40202a;
  }
}
.qz-root :focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }

/* header */
.qz-header { display: flex; flex-direction: column; gap: 10px; }
.qz-meta { display: flex; justify-content: space-between; align-items: baseline; font-size: .9rem; color: var(--muted); }
.qz-time { font-size: 1.05rem; font-weight: 650; color: var(--ink); font-variant-numeric: tabular-nums; }
.qz-time.is-urgent { color: var(--bad); }
.qz-bar { height: 6px; border-radius: 99px; background: var(--line); overflow: hidden; }
.qz-bar-fill { height: 100%; background: var(--accent); transition: width 1s linear, background-color .3s; }
.qz-bar-fill.is-urgent { background: var(--bad); }
.qz-question { margin: 0; font-size: clamp(1.25rem, 2.6vw, 1.6rem); font-weight: 650; line-height: 1.3; text-wrap: balance; }

/* media */
.qz-media {
  width: 100%; aspect-ratio: 16 / 9; display: grid; place-items: center; overflow: hidden;
  border: 1px solid var(--line); border-radius: 14px; background: var(--card);
}
.qz-media > img, .qz-media > video, .qz-media > iframe, .qz-media > canvas, .qz-media > svg {
  display: block; width: 100%; height: 100%; border: 0; object-fit: contain;
}

/* feedback */
.qz-status { min-height: 1.5em; margin: 0; text-align: center; font-weight: 650; }
.qz-status.is-good { color: var(--good); }
.qz-status.is-bad { color: var(--bad); }
.qz-reveal { margin: -12px 0 0; text-align: center; color: var(--muted); }
.qz-hint { margin: 0; font-size: .9rem; color: var(--muted); }

/* multiple choice */
.qz-choices { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
@media (max-width: 520px) { .qz-choices { grid-template-columns: 1fr; } }
.qz-choice {
  display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 12px 14px;
  border: 2px solid var(--line); border-radius: 12px; background: var(--card); color: var(--ink);
  font: inherit; font-weight: 550; text-align: left; cursor: pointer;
  transition: border-color .15s, background-color .15s, transform .1s, opacity .2s;
}
.qz-choice:hover:not(:disabled) { border-color: var(--accent); background: var(--accent-soft); }
.qz-choice:active:not(:disabled) { transform: scale(.99); }
.qz-choice:disabled { cursor: default; }
.qz-key {
  flex: none; display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px;
  background: var(--accent-soft); color: var(--accent); font-size: .85rem; font-weight: 700;
}
.qz-choice.is-correct { border-color: var(--good); background: var(--good-soft); }
.qz-choice.is-correct .qz-key { background: var(--good); color: var(--on-solid); }
.qz-choice.is-wrong { border-color: var(--bad); background: var(--bad-soft); }
.qz-choice.is-wrong .qz-key { background: var(--bad); color: var(--on-solid); }
.qz-choice.is-dim { opacity: .55; }

/* typed answer */
.qz-answer { display: flex; gap: 10px; }
.qz-input {
  flex: 1; min-width: 0; padding: 14px 16px; border: 2px solid var(--line); border-radius: 12px;
  background: var(--card); color: var(--ink); font: inherit; font-size: 1.1rem;
  transition: border-color .15s, background-color .15s;
}
.qz-input.is-correct { border-color: var(--good); background: var(--good-soft); }
.qz-input.is-wrong { border-color: var(--bad); background: var(--bad-soft); }
.qz-submit {
  min-height: 52px; padding: 0 22px; border: 0; border-radius: 12px; background: var(--accent);
  color: var(--on-solid); font: inherit; font-weight: 650; cursor: pointer; transition: opacity .15s;
}
.qz-submit:disabled { opacity: .45; cursor: not-allowed; }
.qz-submit.is-wide { width: 100%; }

/* matching */
.qz-match { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.qz-col { display: flex; flex-direction: column; gap: var(--gap); }
.qz-col-right { position: relative; display: block; height: calc(var(--row) * 4 + var(--gap) * 3); }
.qz-tile {
  height: var(--row); display: flex; align-items: center; gap: 10px; padding: 0 14px; overflow: hidden;
  border: 2px solid var(--line); border-radius: 12px; background: var(--card);
  font-weight: 550; line-height: 1.25;
}
.qz-anchor { border-color: transparent; background: var(--accent-soft); }
.qz-drag {
  position: absolute; left: 0; right: 0; cursor: grab; touch-action: none; user-select: none;
  transition: top .2s ease, box-shadow .2s ease, border-color .15s, background-color .15s;
}
.qz-drag.is-dragging {
  z-index: 2; cursor: grabbing; border-color: var(--accent); transition: box-shadow .2s;
  box-shadow: 0 10px 24px rgba(20, 28, 60, .22);
}
.qz-drag.is-locked { cursor: default; }
.qz-drag.is-correct { border-color: var(--good); background: var(--good-soft); }
.qz-drag.is-wrong { border-color: var(--bad); background: var(--bad-soft); }
.qz-grip { flex: none; color: var(--muted); font-size: 1.1rem; letter-spacing: -2px; }
.qz-mark { margin-left: auto; font-weight: 700; }
@media (max-width: 520px) { .qz-tile { font-size: .9rem; padding: 0 10px; } }

@media (prefers-reduced-motion: reduce) {
  .qz-root *, .qz-root *::before, .qz-root *::after { transition: none !important; }
}
`;
