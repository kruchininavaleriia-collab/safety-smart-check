import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { formatDuration, getSummary } from "@/lib/summary";

export const Route = createFileRoute("/success")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Проверка по ТБ пройдена" },
      { name: "description", content: "Результат проверки знаний по технике безопасности сохранён." },
      { property: "og:title", content: "Проверка по ТБ пройдена" },
      { property: "og:description", content: "Результат проверки знаний по ТБ сохранён." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const summary = getSummary();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[500px] flex-col justify-center px-4 py-10 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="mx-auto flex size-28 items-center justify-center rounded-full bg-success/15">
          <svg viewBox="0 0 24 24" className="size-16 text-success" fill="none" strokeWidth="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 12.5 9.5 18 20 6.5" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-bold text-foreground">Проверка пройдена успешно!</h1>
        {summary ? (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Табельный номер {summary.employeeId}. Результат {summary.correct}/{summary.total}.
            Время прохождения {formatDuration(summary.durationSec)}. Повторных попыток на сложных
            вопросах: {summary.retries}.
          </p>
        ) : null}

        {summary && !summary.saved ? (
          <pre className="mt-6 overflow-x-auto rounded-xl bg-muted p-4 text-left text-xs text-foreground">
            {JSON.stringify(summary.payload, null, 2)}
          </pre>
        ) : null}

        <button
          onClick={() => {
            window.close();
            window.location.href = "/";
          }}
          className="mt-8 w-full rounded-xl bg-success px-6 py-5 text-lg font-bold text-success-foreground transition active:scale-[0.99] hover:opacity-90"
        >
          Завершить / Закрыть вкладку
        </button>
        <Link to="/" className="mt-4 inline-block text-sm text-muted-foreground underline">
          На главную
        </Link>
      </motion.div>
    </main>
  );
}
