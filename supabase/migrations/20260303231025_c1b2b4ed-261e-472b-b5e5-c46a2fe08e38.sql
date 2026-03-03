
CREATE TABLE public.audit_results (
  id TEXT PRIMARY KEY,
  decision TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view audit results" ON public.audit_results FOR SELECT USING (true);
CREATE POLICY "Anyone can insert audit results" ON public.audit_results FOR INSERT WITH CHECK (true);
