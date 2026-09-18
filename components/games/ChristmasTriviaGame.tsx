"use client";

import { useCallback, useState } from "react";
import { CHRISTMAS_TRIVIA } from "@/lib/games/christmas-trivia";
import { GeneratedIcon } from "@/components/GeneratedIcon";
import { MilestoneCelebration } from "@/components/MilestoneCelebration";
import { gameFeedback } from "@/lib/feedback";

const ROUND_LENGTH = 10;
const shuffledRound = () => [...CHRISTMAS_TRIVIA].sort(() => Math.random() - 0.5).slice(0, ROUND_LENGTH);

export function ChristmasTriviaGame() {
  const [questions, setQuestions] = useState(() =>
    shuffledRound(),
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [celebration, setCelebration] = useState<{ title: string; detail: string } | null>(null);
  const question = questions[index]!;
  const finished = index === questions.length - 1 && answered;

  function checkAnswer() {
    if (!selected || answered) return;
    setAnswered(true);
    if (selected === question.answer) {
      const nextStreak = streak + 1;
      setScore((current) => current + 1);
      setStreak(nextStreak);
      setBestStreak((current) => Math.max(current, nextStreak));
      void gameFeedback("success");
      if (nextStreak === 3 || nextStreak === 5) {
        setCelebration({ title: `${nextStreak} in a row!`, detail: "Your Christmas trivia streak is heating up." });
      }
    } else {
      setStreak(0);
      void gameFeedback("warning");
    }
  }

  function nextQuestion() {
    setIndex((current) => current + 1);
    setSelected(null);
    setAnswered(false);
  }

  function restart() {
    setQuestions(shuffledRound());
    setIndex(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setAnswered(false);
  }

  const shareScore = useCallback(() => {
    const text = `I scored ${score}/${questions.length} in XmasGoat Christmas Trivia with a ${bestStreak}-answer streak. Can you beat me?`;
    if (navigator.share) void navigator.share({ title: "XmasGoat Christmas Trivia", text, url: location.href });
    else void navigator.clipboard?.writeText(`${text} ${location.href}`);
  }, [bestStreak, questions.length, score]);

  return (
    <section
      aria-labelledby="play-trivia"
      className="overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-lg shadow-sky-900/10"
    >
      <div className="bg-kringle-spruce p-5 text-white sm:p-6">
        <div className="flex items-center justify-between gap-3 text-sm font-bold">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          <span className="flex items-center gap-2"><span>Score {score}</span>{streak >= 2 && <span className="rounded-full bg-kringle-gold px-2 py-1 text-xs text-slate-950">🔥 {streak}</span>}</span>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-white/20"
          role="progressbar"
          aria-label="Trivia progress"
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-valuenow={index + 1}
        >
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="space-y-5 p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-kringle-cranberry">
          {question.category}
        </p>
        <h2 id="play-trivia" className="text-2xl font-bold leading-snug">
          {question.question}
        </h2>
        <fieldset className="grid gap-3" disabled={answered}>
          <legend className="sr-only">Choose one answer</legend>
          {question.choices.map((choice) => {
            const chosen = selected === choice;
            const correct = answered && choice === question.answer;
            const wrong = answered && chosen && choice !== question.answer;
            return (
              <label
                key={choice}
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 font-semibold transition ${correct ? "border-emerald-600 bg-emerald-50 text-emerald-900" : wrong ? "border-red-500 bg-red-50 text-red-900" : chosen ? "border-sky-600 bg-sky-50" : "border-slate-200 hover:border-sky-300"}`}
              >
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={choice}
                  checked={chosen}
                  onChange={() => setSelected(choice)}
                />
                <span>{choice}</span>
              </label>
            );
          })}
        </fieldset>
        {answered && (
          <div
            role="status"
            className={`rounded-2xl p-4 ${selected === question.answer ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-950"}`}
          >
            <p className="flex items-center gap-2 font-bold">
              <GeneratedIcon name={selected === question.answer ? "correct" : "incorrect"} className="h-8 w-8" />
              {selected === question.answer ? "Correct!" : `The answer is ${question.answer}.`}
            </p>
            <p className="mt-1 text-sm leading-relaxed">{question.explanation}</p>
          </div>
        )}
        {!answered ? (
          <button
            type="button"
            onClick={checkAnswer}
            disabled={!selected}
            className="min-h-12 w-full rounded-2xl bg-kringle-cranberry px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Check answer
          </button>
        ) : finished ? (
          <div className="space-y-3 rounded-3xl bg-amber-50 p-4 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-amber-800">Round complete</p>
            <p className="text-4xl font-black">{score} / {questions.length}</p>
            <p className="font-bold text-amber-900">Best streak: {bestStreak} 🔥</p>
            <button type="button" onClick={shareScore} className="min-h-12 w-full rounded-2xl border-2 border-kringle-spruce bg-white px-5 font-bold text-kringle-spruce">Challenge your group ↗</button>
            <button
              type="button"
              onClick={restart}
              className="min-h-12 w-full rounded-2xl bg-kringle-cranberry px-5 font-bold text-white"
            >
              Play again
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={nextQuestion}
            className="min-h-12 w-full rounded-2xl bg-kringle-cranberry px-5 font-bold text-white"
          >
            Next question
          </button>
        )}
      </div>
      {celebration && <MilestoneCelebration title={celebration.title} detail={celebration.detail} onDone={() => setCelebration(null)} />}
    </section>
  );
}
