import { useRef, useState } from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react';
import { MediaFrame, QuizHeader, QuizStyles, defaultLabels, useCountdown, useLater } from './quizShared';
import type { QuizLabels } from './quizShared';

export type MatchPair = { left: ReactNode; right: ReactNode };
/** Exactly 4 pairs, enforced by TypeScript. pairs[i].left belongs with pairs[i].right. */
export type MatchPairs = [MatchPair, MatchPair, MatchPair, MatchPair];

export type MatchingResult = {
  correctCount: number;
  total: 4;
  /** True only when all 4 are matched. */
  correct: boolean;
  timeLeft: number;
};

type Props = {
  /** Instruction shown at the top, e.g. "Match each country to its capital". */
  question: string;
  pairs: MatchPairs;
  questionsLeft: number;
  /** Seconds. Default 40. */
  timeLimit?: number;
  /** Image, video, or any element shown in the center rectangle. */
  media?: ReactNode;
  /** How long the result stays before onAnswer fires. Default 2400 ms. */
  revealMs?: number;
  labels?: Partial<QuizLabels>;
  onAnswer: (result: MatchingResult) => void;
};

const N = 4;
const ROW_H = 64;
const GAP = 12;
const STEP = ROW_H + GAP;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Random order that is never already solved. order[slot] = pair index. */
function shuffledOrder(): number[] {
  const a = [0, 1, 2, 3];
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  } while (a.every((v, i) => v === i));
  return a;
}

/**
 * Left column is fixed. Drag the right-hand items up or down so each one
 * faces its match, then press the check button (or let the timer run out).
 * Keyboard: focus a right-hand item and press ↑ or ↓.
 * Render with a `key` that changes per question so state and timer reset.
 */
export default function MatchingQuiz({
  question,
  pairs,
  questionsLeft = 0,
  timeLimit = 40,
  media,
  revealMs = 2400,
  labels,
  onAnswer,
}: Props) {
  const l = { ...defaultLabels, ...labels };
  const later = useLater();
  const [order, setOrder] = useState<number[]>(shuffledOrder);
  const [drag, setDrag] = useState<{ pair: number; top: number } | null>(null);
  const [verdicts, setVerdicts] = useState<boolean[] | null>(null); // indexed by pair
  const [timedOut, setTimedOut] = useState(false);
  const colRef = useRef<HTMLDivElement>(null);
  const grabOffset = useRef(0);
  const locked = verdicts !== null;

  const timeLeft = useCountdown(timeLimit, !locked, () => check(true));

  function check(expired: boolean) {
    if (locked) return;
    const v = pairs.map((_, p) => order.indexOf(p) === p);
    const count = v.filter(Boolean).length;
    setDrag(null);
    setVerdicts(v);
    setTimedOut(expired);
    // Show the right layout after a moment so wrong answers can be learned from.
    if (count < N) later(() => setOrder([0, 1, 2, 3]), 1100);
    later(() => onAnswer({ correctCount: count, total: 4, correct: count === N, timeLeft }), revealMs);
  }

  function moveTo(pair: number, target: number) {
    setOrder((prev) => {
      if (prev.indexOf(pair) === target) return prev;
      const next = prev.filter((p) => p !== pair);
      next.splice(target, 0, pair);
      return next;
    });
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>, pair: number) {
    const col = colRef.current;
    if (locked || !col) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const top = order.indexOf(pair) * STEP;
    grabOffset.current = e.clientY - col.getBoundingClientRect().top - top;
    setDrag({ pair, top });
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>, pair: number) {
    const col = colRef.current;
    if (!drag || drag.pair !== pair || !col) return;
    const top = clamp(e.clientY - col.getBoundingClientRect().top - grabOffset.current, 0, (N - 1) * STEP);
    setDrag({ pair, top });
    moveTo(pair, clamp(Math.round(top / STEP), 0, N - 1));
  }

  function onKeyDown(e: ReactKeyboardEvent<HTMLDivElement>, pair: number) {
    if (locked) return;
    const slot = order.indexOf(pair);
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveTo(pair, clamp(slot - 1, 0, N - 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveTo(pair, clamp(slot + 1, 0, N - 1));
    }
  }

  const count = verdicts ? verdicts.filter(Boolean).length : 0;
  const status = verdicts ? `${timedOut ? `${l.timeUp} ` : ''}${l.score(count, N)}` : '';
  const vars = { '--row': `${ROW_H}px`, '--gap': `${GAP}px` } as CSSProperties;

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

      {!locked && <p className="qz-hint">{l.matchHint}</p>}

      <div className="qz-match" style={vars}>
        <div className="qz-col" role="list">
          {pairs.map((pair, i) => (
            <div key={i} className="qz-tile qz-anchor" role="listitem">
              {pair.left}
            </div>
          ))}
        </div>

        <div className="qz-col qz-col-right" ref={colRef} role="list">
          {pairs.map((pair, p) => {
            const slot = order.indexOf(p);
            const dragging = !!drag && drag.pair === p;
            const top = drag && drag.pair === p ? drag.top : slot * STEP;
            const verdict = verdicts ? (verdicts[p] ? ' is-correct' : ' is-wrong') : '';

            return (
              <div
                key={p}
                role="listitem"
                tabIndex={locked ? -1 : 0}
                className={`qz-tile qz-drag${dragging ? ' is-dragging' : ''}${locked ? ' is-locked' : ''}${verdict}`}
                style={{ top }}
                onPointerDown={(e) => onPointerDown(e, p)}
                onPointerMove={(e) => onPointerMove(e, p)}
                onPointerUp={() => setDrag(null)}
                onPointerCancel={() => setDrag(null)}
                onKeyDown={(e) => onKeyDown(e, p)}
              >
                {!locked && (
                  <span className="qz-grip" aria-hidden="true">
                    ⋮⋮
                  </span>
                )}
                <span>{pair.right}</span>
                {verdicts && (
                  <span className="qz-mark" aria-hidden="true">
                    {verdicts[p] ? '✓' : '✕'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button type="button" className="qz-submit is-wide" disabled={locked} onClick={() => check(false)}>
        {l.check}
      </button>

      <p className={`qz-status ${verdicts ? (count === N ? 'is-good' : 'is-bad') : ''}`} role="status">
        {status}
      </p>
    </section>
  );
}
