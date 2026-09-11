import { useSyncExternalStore } from "react";
import { QUESTIONS, type Question } from "@/data/questions";

export const QUESTIONS_PER_TEST = 10;
export const TEST_DURATION_SEC = 300;
export const COOLDOWN_MS = 5 * 60 * 1000;

export type SessionQuestion = Question & {
  /** Индексы вариантов в перемешанном порядке */
  order: number[];
};

export type AnswerRecord = {
  questionId: string;
  attempts: number;
  failed: boolean;
};

export type Session = {
  employeeId: string;
  questions: SessionQuestion[];
  index: number;
  correct: number;
  history: AnswerRecord[];
  startedAt: number | null;
  finished: boolean;
};

const STORAGE_KEY = "tb-session";
const COOLDOWN_KEY = "tb-last-start";

let session: Session | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else sessionStorage.removeItem(STORAGE_KEY);
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      session = JSON.parse(raw) as Session;
    } catch {
      session = null;
    }
  }
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function pickQuestions(): SessionQuestion[] {
  const critical = shuffle(QUESTIONS.filter((q) => q.is_critical));
  const regular = shuffle(QUESTIONS.filter((q) => !q.is_critical));
  const chosen = [...critical.slice(0, 2)];
  const rest = shuffle([...critical.slice(2), ...regular]);
  for (const q of rest) {
    if (chosen.length >= QUESTIONS_PER_TEST) break;
    chosen.push(q);
  }
  return shuffle(chosen).map((q) => ({
    ...q,
    order: shuffle(q.options.map((_, i) => i)),
  }));
}

export function cooldownRemainingMs(): number {
  if (typeof window === "undefined") return 0;
  const last = Number(localStorage.getItem(COOLDOWN_KEY) ?? 0);
  if (!last) return 0;
  return Math.max(0, last + COOLDOWN_MS - Date.now());
}

export function startSession(employeeId: string) {
  session = {
    employeeId: employeeId.trim(),
    questions: pickQuestions(),
    index: 0,
    correct: 0,
    history: [],
    startedAt: null,
    finished: false,
  };
  localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  persist();
  emit();
}

export function beginTimer() {
  if (!session || session.startedAt) return;
  session = { ...session, startedAt: Date.now() };
  persist();
  emit();
}

export function reshuffleCurrent() {
  if (!session) return;
  const questions = [...session.questions];
  const current = questions[session.index];
  if (!current) return;
  questions[session.index] = { ...current, order: shuffle(current.order) };
  session = { ...session, questions };
  persist();
  emit();
}

export function registerWrongAnswer(questionId: string) {
  if (!session) return;
  const history = [...session.history];
  const existing = history.find((h) => h.questionId === questionId);
  if (existing) existing.attempts += 1;
  else history.push({ questionId, attempts: 1, failed: true });
  session = { ...session, history };
  persist();
  emit();
}

/** Возвращает true, если тест завершён */
export function registerCorrectAnswer(questionId: string): boolean {
  if (!session) return false;
  const history = [...session.history];
  const existing = history.find((h) => h.questionId === questionId);
  if (!existing) history.push({ questionId, attempts: 1, failed: false });
  const index = session.index + 1;
  const done = index >= session.questions.length;
  session = {
    ...session,
    history,
    correct: session.correct + 1,
    index: done ? session.index : index,
    finished: done,
  };
  persist();
  emit();
  return done;
}

export function elapsedSec(): number {
  if (!session?.startedAt) return 0;
  return Math.floor((Date.now() - session.startedAt) / 1000);
}

export function clearSession() {
  session = null;
  persist();
  emit();
}

export function resetCooldown() {
  if (typeof window !== "undefined") localStorage.removeItem(COOLDOWN_KEY);
}

export function getSession(): Session | null {
  hydrate();
  return session;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSession, () => null);
}
