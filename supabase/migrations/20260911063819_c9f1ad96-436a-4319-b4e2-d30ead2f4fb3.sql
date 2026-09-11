CREATE TABLE public.results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  score_correct integer NOT NULL DEFAULT 0,
  score_total integer NOT NULL DEFAULT 0,
  duration_sec integer NOT NULL DEFAULT 0,
  failed_questions text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'passed'
);
GRANT SELECT, INSERT ON public.results TO anon;
GRANT SELECT, INSERT ON public.results TO authenticated;
GRANT ALL ON public.results TO service_role;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert results" ON public.results FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read results" ON public.results FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX results_created_at_idx ON public.results (created_at DESC);