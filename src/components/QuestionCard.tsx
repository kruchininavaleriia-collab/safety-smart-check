import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { SessionQuestion } from "@/lib/test-session";

export function QuestionCard({
  question,
  index,
  total,
  disabledOptions,
  locked,
  justCorrect,
  onFirstInteraction,
  onSubmit,
}: {
  question: SessionQuestion;
  index: number;
  total: number;
  disabledOptions: number[];
  locked: boolean;
  justCorrect: number | null;
  onFirstInteraction: () => void;
  onSubmit: (optionIndex: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [question.id]);

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Вопрос {index + 1} из {total}
        {question.is_critical ? (
          <span className="ml-2 rounded-md bg-destructive/10 px-2 py-0.5 text-destructive">
            критический
          </span>
        ) : null}
      </p>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${((index + 1) / total) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <h1 className="mt-6 text-2xl font-bold leading-snug text-foreground">{question.text}</h1>

      <fieldset className="mt-6 space-y-3">
        <legend className="sr-only">Варианты ответа</legend>
        {question.order.map((optionIndex) => {
          const isDisabled = disabledOptions.includes(optionIndex) || locked;
          const isRight = justCorrect === optionIndex;
          return (
            <label
              key={optionIndex}
              className={[
                "flex w-full cursor-pointer items-start gap-3 rounded-xl border-2 bg-card p-4 text-base leading-relaxed transition",
                isRight
                  ? "border-success bg-success/10 shadow-[0_0_0_4px_var(--success-glow)]"
                  : selected === optionIndex
                    ? "border-primary"
                    : "border-border",
                isDisabled && !isRight ? "cursor-not-allowed opacity-45" : "",
              ].join(" ")}
            >
              <input
                type="radio"
                name={`q-${question.id}`}
                className="mt-1 size-5 accent-[var(--primary)]"
                disabled={isDisabled}
                checked={selected === optionIndex}
                onChange={() => {
                  onFirstInteraction();
                  setSelected(optionIndex);
                }}
              />
              <span className="text-foreground">{question.options[optionIndex]}</span>
            </label>
          );
        })}
      </fieldset>

      <button
        type="button"
        disabled={selected === null || locked}
        onClick={() => {
          if (selected !== null) onSubmit(selected);
        }}
        className="mt-6 w-full rounded-xl bg-primary px-6 py-5 text-lg font-bold text-primary-foreground transition active:scale-[0.99] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Подтвердить ответ
      </button>
    </motion.div>
  );
}
