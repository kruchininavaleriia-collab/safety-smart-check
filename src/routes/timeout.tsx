import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { formatDuration, getSummary } from "@/lib/summary";
import { resetCooldown } from "@/lib/test-session";

export const Route = createFileRoute("/timeout")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Время вышло — проверка по ТБ" },
      { name: "description", content: "Время на прохождение проверки знаний по ТБ истекло." },
      { property: "og:title", content: "Время вышло — проверка по ТБ" },
      { property: "og:description", content: "Время на прохождение проверки по ТБ истекло." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TimeoutPage,
});

function TimeoutPage() {
  const navigate = useNavigate();
  const summary = getSummary();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[500px] flex-col justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-4 border-destructive bg-card p-6 text-center"
      >
        <h1 className="text-3xl font-bold text-destructive">Время вышло</h1>
        {summary ? (
          <p className="mt-4 text-base leading-relaxed text-foreground">
            Вы успели верно ответить на {summary.correct} из {summary.total} вопросов за{" "}
            {formatDuration(summary.durationSec)}. Ошибок допущено:{" "}
            {summary.failedQuestions.length}.
          </p>
        ) : null}
        <button
          onClick={() => {
            resetCooldown();
            void navigate({ to: "/" });
          }}
          className="mt-8 w-full rounded-xl bg-destructive px-6 py-5 text-lg font-bold text-destructive-foreground transition active:scale-[0.99] hover:opacity-90"
        >
          Попробовать еще раз
        </button>
      </motion.div>
    </main>
  );
}
