import { supabase } from "@/integrations/supabase/client";

export type ResultStatus = "passed" | "failed" | "timeout";

export type ResultPayload = {
  employee_id: string;
  score_correct: number;
  score_total: number;
  duration_sec: number;
  failed_questions: string[];
  status: ResultStatus;
};

export type ResultRow = ResultPayload & { id: string; created_at: string };

export async function saveResult(payload: ResultPayload) {
  const { error } = await supabase.from("results").insert(payload);
  if (error) throw error;
}

export async function fetchResults(): Promise<ResultRow[]> {
  const { data, error } = await supabase
    .from("results")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as ResultRow[];
}
