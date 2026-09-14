export type Summary = {
  employeeId: string;
  correct: number;
  total: number;
  durationSec: number;
  failedQuestions: string[];
  retries: number;
  status: "passed" | "timeout";
  saved: boolean;
  payload: unknown;
};

const KEY = "tb-summary";

export function setSummary(summary: Summary) {
  if (typeof window !== "undefined") sessionStorage.setItem(KEY, JSON.stringify(summary));
}

export function getSummary(): Summary | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Summary;
  } catch {
    return null;
  }
}

export function formatDuration(sec: number) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}
