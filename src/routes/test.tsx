import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { QuestionCard } from "@/components/QuestionCard";
import { ErrorModal } from "@/components/ErrorModal";
import { playError, playSuccess, vibrateError } from "@/lib/feedback";
import { saveResult, type ResultStatus } from "@/lib/results";
import { setSummary } from "@/lib/summary";
import {
  TEST_DURATION_SEC,
  beginTimer,
  clearSession,
  getSession,
  registerCorrectAnswer,
  registerWrongAnswer,
  useSession,
} from "@/lib/test-session";

export const Route = createFileRoute("/test")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Прохождение проверки по ТБ" },
      { name: "description", content: "Ответьте на вопросы проверки знаний по технике безопасности." },
      { property: "og:title", content: "Прохождение проверки по ТБ" },
      { property: "og:description", content: "Вопросы проверки знаний по технике безопасности." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TestPage,
});

function formatTime(sec: number) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function TestPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [remaining, setRemaining] = useState(TEST_DURATION_SEC);
  const [disabled, setDisabled] = useState<Record<string, number[]>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [justCorrect, setJustCorrect] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const finishing = useRef(false);

  const finish = useCallback(
    async (status: ResultStatus) => {
      if (finishing.current) return;
      finishing.current = true;
      const current = getSession();
      if (!current) return;
      const durationSec = current.startedAt
        ? Math.min(TEST_DURATION_SEC, Math.floor((Date.now() - current.startedAt) / 1000))
        : 0;
      const failedQuestions = current.history.filter((h) => h.failed).map((h) => h.questionId);
      const retries = current.history.reduce((acc, h) => acc + (h.attempts - 1), 0);
      const payload = {
        employee_id: current.employeeId,
        score_correct: current.correct,
        score_total: current.questions.length,
        duration_sec: durationSec,
        failed_questions: failedQuestions,
        status,
      };
      let saved = true;
      try {
        await saveResult(payload);
      } catch (e) {
        console.error(e);
        saved = false;
      }
      setSummary({
        employeeId: current.employeeId,
        correct: current.correct,
        total: current.questions.length,
        durationSec,
        failedQuestions,
        retries,
        status: status === "timeout" ? "timeout" : "passed",
        saved,
        payload,
      });
      clearSession();
      void navigate({ to: status === "timeout" ? "/timeout" : "/success" });
    },
    [navigate],
  );

  useEffect(() => {
    if (!session && !finishing.current) {
      void navigate({ to: "/" });
    }
  }, [session, navigate]);

  const startedAt = session?.startedAt ?? null;

  useEffect(() => {
    if (!startedAt) {
      setRemaining(TEST_DURATION_SEC);
      return;
    }
    const tick = () => {
      const left = TEST_DURATION_SEC - Math.floor((Date.now() - startedAt) / 1000);
      setRemaining(Math.max(0, left));
      if (left <= 0) void finish("timeout");
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [startedAt, finish]);

  if (!session) return null;

  const question = session.questions[session.index];
  if (!question) return null;

  const questionDisabled = disabled[question.id] ?? [];

  function handleSubmit(optionIndex: number) {
    if (!question) return;
    if (optionIndex === question.correct_id) {
      playSuccess();
      setJustCorrect(optionIndex);
      setLocked(true);
      window.setTimeout(() => {
        const done = registerCorrectAnswer(question.id);
        setJustCorrect(null);
        setLocked(false);
        if (done) void finish("passed");
      }, 500);
    } else {
      playError();
      vibrateError();
      registerWrongAnswer(question.id);
      setDisabled((prev) => ({
        ...prev,
        [question.id]: [...(prev[question.id] ?? []), optionIndex],
      }));
      setModalOpen(true);
    }
  }

  const danger = remaining <= 60;

  return (
    <main className="mx-auto w-full max-w-[500px] px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground">
          Таб. № {session.employeeId}
        </span>
        <span
          className={[
            "rounded-lg px-3 py-1 font-mono text-xl font-bold tabular-nums text-destructive",
            danger ? "animate-pulse bg-destructive/10" : "",
          ].join(" ")}
          aria-label="Оставшееся время"
        >
          {formatTime(remaining)}
        </span>
      </div>

      <QuestionCard
        question={question}
        index={session.index}
        total={session.questions.length}
        disabledOptions={questionDisabled}
        locked={locked}
        justCorrect={justCorrect}
        onFirstInteraction={beginTimer}
        onSubmit={handleSubmit}
      />

      <ErrorModal
        open={modalOpen}
        explanation={question.explanation}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
}
