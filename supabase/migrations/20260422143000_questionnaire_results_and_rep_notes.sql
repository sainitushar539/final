CREATE TABLE public.questionnaire_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  email text NOT NULL,
  selected_goals text[] NOT NULL DEFAULT '{}',
  credit_score_range text,
  revenue_range text,
  time_in_business text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer NOT NULL DEFAULT 0,
  diagnosis_summary text,
  roadmap jsonb NOT NULL DEFAULT '[]'::jsonb,
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  questionnaire_completed boolean NOT NULL DEFAULT true,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.questionnaire_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own questionnaire results"
ON public.questionnaire_results FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaire results"
ON public.questionnaire_results FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questionnaire results"
ON public.questionnaire_results FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all questionnaire results"
ON public.questionnaire_results FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update questionnaire results"
ON public.questionnaire_results FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_questionnaire_results_updated_at
BEFORE UPDATE ON public.questionnaire_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_questionnaire_results_email ON public.questionnaire_results (lower(email));
CREATE INDEX idx_questionnaire_results_business_id ON public.questionnaire_results (business_id);

CREATE TABLE public.rep_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  note text NOT NULL,
  visibility text NOT NULL CHECK (visibility IN ('internal_only', 'client_visible')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rep_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view visible rep notes"
ON public.rep_notes FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND visibility = 'client_visible');

CREATE POLICY "Admins can view all rep notes"
ON public.rep_notes FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert rep notes"
ON public.rep_notes FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update rep notes"
ON public.rep_notes FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete rep notes"
ON public.rep_notes FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_rep_notes_updated_at
BEFORE UPDATE ON public.rep_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_rep_notes_user_id ON public.rep_notes (user_id);
CREATE INDEX idx_rep_notes_lead_id ON public.rep_notes (lead_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.claim_client_intake_from_lead(_email text, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _lead public.leads%ROWTYPE;
  _auth_email text;
  _business_id uuid;
  _credit text;
  _revenue text;
  _time text;
  _credit_points int;
  _revenue_points int;
  _time_points int;
  _score int;
  _goals text[];
  _checklist jsonb;
  _diagnosis text;
  _roadmap jsonb;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'You can only claim your own intake';
  END IF;

  SELECT email INTO _auth_email FROM auth.users WHERE id = _user_id;
  IF lower(trim(coalesce(_email, ''))) <> lower(trim(coalesce(_auth_email, ''))) THEN
    RAISE EXCEPTION 'Intake email must match authenticated user';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.questionnaire_results
    WHERE user_id = _user_id AND questionnaire_completed = true AND score > 0
  ) THEN
    RETURN true;
  END IF;

  SELECT * INTO _lead
  FROM public.leads
  WHERE lower(email) = lower(trim(_email))
  ORDER BY updated_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  _goals := CASE WHEN cardinality(coalesce(_lead.needs, '{}'::text[])) > 0 THEN _lead.needs ELSE ARRAY['fundability']::text[] END;
  _credit := coalesce(_lead.credit_score_range, _lead.responses->>'creditScore', '');
  _credit := CASE _credit
    WHEN 'excellent' THEN '780+'
    WHEN 'good' THEN '740-779'
    WHEN 'fair' THEN '680-739'
    WHEN 'below-average' THEN '600-680'
    WHEN 'poor' THEN '<600'
    WHEN 'unsure' THEN '<600'
    ELSE _credit
  END;

  _revenue := coalesce(_lead.responses->>'annualRevenue', '');
  _revenue := CASE _revenue
    WHEN 'pre-revenue' THEN 'pre'
    WHEN 'under-50k' THEN 'under100k'
    WHEN '50k-100k' THEN 'under100k'
    WHEN '250k-500k' THEN '250k-1m'
    WHEN '500k-1m' THEN '250k-1m'
    WHEN '1m-plus' THEN '1m+'
    ELSE _revenue
  END;

  _time := coalesce(_lead.responses->>'timeInBusiness', '');
  _time := CASE _time
    WHEN 'pre-revenue' THEN 'not-started'
    WHEN 'under-1' THEN '<2'
    WHEN '1-2' THEN '<2'
    WHEN '3-5' THEN '2-5'
    WHEN '5-plus' THEN '10+'
    ELSE _time
  END;

  _credit_points := CASE _credit WHEN '780+' THEN 10 WHEN '740-779' THEN 8 WHEN '680-739' THEN 6 WHEN '600-680' THEN 4 WHEN '<600' THEN 2 ELSE 0 END;
  _revenue_points := CASE _revenue WHEN '1m+' THEN 10 WHEN '250k-1m' THEN 8 WHEN '100k-250k' THEN 6 WHEN 'under100k' THEN 4 WHEN 'pre' THEN 2 ELSE 0 END;
  _time_points := CASE _time WHEN '10+' THEN 10 WHEN '2-5' THEN 8 WHEN '2-5+' THEN 10 WHEN '2-10' THEN 8 WHEN '<2' THEN 4 WHEN 'not-started' THEN 1 ELSE 0 END;
  _score := greatest(10, round(((_credit_points + _revenue_points + _time_points)::numeric / 30) * 100)::int);

  _checklist := jsonb_build_array(
    jsonb_build_object('label', 'Business License / Registration', 'complete', false),
    jsonb_build_object('label', 'EIN / Tax ID', 'complete', false),
    jsonb_build_object('label', 'Business Bank Account', 'complete', false),
    jsonb_build_object('label', 'Bank Statements (3 months)', 'complete', false),
    jsonb_build_object('label', 'Tax Returns (2 years)', 'complete', false),
    jsonb_build_object('label', 'Profit & Loss Statement', 'complete', false)
  );

  _diagnosis := coalesce(_lead.company_name, 'Your business') || ' is at ' || _score || '/100 based on the saved intake. Your dashboard is ready with a funding readiness plan tied to your selected goals.';
  _roadmap := jsonb_build_array(
    'Review the saved questionnaire answers and confirm your funding goals.',
    'Organize the required financial and business documents.',
    'Work through the checklist items that match your selected goals.'
  );

  INSERT INTO public.businesses (user_id, name, industry, capital_need, checklist, score, status, notes, top_gap, loan_product)
  VALUES (
    _user_id,
    coalesce(_lead.company_name, 'My Business'),
    _lead.industry,
    _lead.amount_seeking,
    _checklist,
    _score,
    'assessment',
    concat('Goals: ', array_to_string(_goals, ', '), '. Credit: ', _credit, '. Revenue: ', _revenue, '. Time: ', _time),
    CASE WHEN _score < 60 THEN 'Credit & Revenue' ELSE 'Documentation' END,
    CASE WHEN _score >= 80 THEN 'standard' WHEN _score >= 60 THEN 'revenue-based' ELSE 'building' END
  )
  RETURNING id INTO _business_id;

  INSERT INTO public.questionnaire_results (
    user_id, business_id, email, selected_goals, credit_score_range, revenue_range, time_in_business,
    answers, score, diagnosis_summary, roadmap, checklist, questionnaire_completed, completed_at
  )
  VALUES (
    _user_id, _business_id, lower(trim(_email)), _goals, _credit, _revenue, _time,
    coalesce(_lead.responses, '{}'::jsonb) || jsonb_build_object(
      'businessName', _lead.company_name,
      'contactName', _lead.contact_name,
      'phone', _lead.phone,
      'selectedGoals', _goals,
      'creditScoreRange', _credit,
      'revenueRange', _revenue,
      'timeInBusiness', _time
    ),
    _score, _diagnosis, _roadmap, _checklist, true, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    business_id = excluded.business_id,
    email = excluded.email,
    selected_goals = excluded.selected_goals,
    credit_score_range = excluded.credit_score_range,
    revenue_range = excluded.revenue_range,
    time_in_business = excluded.time_in_business,
    answers = excluded.answers,
    score = excluded.score,
    diagnosis_summary = excluded.diagnosis_summary,
    roadmap = excluded.roadmap,
    checklist = excluded.checklist,
    questionnaire_completed = true,
    completed_at = excluded.completed_at,
    updated_at = now();

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_client_intake_from_lead(text, uuid) TO authenticated;
