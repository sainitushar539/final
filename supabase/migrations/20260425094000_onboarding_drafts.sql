CREATE TABLE public.onboarding_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_phase text NOT NULL,
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own onboarding drafts"
ON public.onboarding_drafts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding drafts"
ON public.onboarding_drafts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding drafts"
ON public.onboarding_drafts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own onboarding drafts"
ON public.onboarding_drafts FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_onboarding_drafts_updated_at
BEFORE UPDATE ON public.onboarding_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
