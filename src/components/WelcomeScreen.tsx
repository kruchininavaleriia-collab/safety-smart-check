import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { QUESTIONS } from "@/data/questions";
import {
  QUESTIONS_PER_TEST,
  cooldownRemainingMs,
  startSession,
} from "@/lib/test-session";

function formatMs(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function WelcomeScreen() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId.trim()) {
      setError("Укажите табельный номер — без него начать проверку нельзя.");
      return;
    }
    const remaining = cooldownRemainingMs();
    if (remaining > 0) {
      setError(
        `Повторная попытка будет доступна через ${formatMs(remaining)}. Одна попытка раз в 5 минут.`,
      );
      return;
    }
    setError(null);
    startSession(employeeId);
    void navigate({ to: "/test" });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full"
    >
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Проверка знаний по ТБ
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Вам будет предложено {QUESTIONS_PER_TEST} вопросов из {QUESTIONS.length}. Время на
        прохождение: 5 минут. Вы не сможете перейти к следующему вопросу, пока не ответите верно
        на текущий.
      </p>

      <form onSubmit={handleStart} className="mt-8 space-y-4">
        <label htmlFor="employeeId" className="block text-base font-semibold text-foreground">
          Табельный номер
        </label>
        <input
          id="employeeId"
          inputMode="numeric"
          autoComplete="off"
          value={employeeId}
          onChange={(e) => {
            setEmployeeId(e.target.value);
            setError(null);
          }}
          placeholder="например, 10457"
          className="w-full rounded-xl border-2 border-border bg-card px-4 py-4 text-lg text-foreground outline-none transition focus:border-ring"
        />
        {error ? (
          <p role="alert" className="text-base font-medium text-destructive">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-6 py-5 text-lg font-bold text-primary-foreground shadow-sm transition active:scale-[0.99] hover:bg-primary/90"
        >
          Начать проверку
        </button>
      </form>
    </motion.div>
  );
}
