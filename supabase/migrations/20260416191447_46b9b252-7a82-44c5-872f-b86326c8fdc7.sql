-- 1. approval_codes table
CREATE TABLE public.approval_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  email text NOT NULL,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz,
  used_by_user_id uuid
);

CREATE INDEX idx_approval_codes_email ON public.approval_codes (lower(email)) WHERE used_at IS NULL;

ALTER TABLE public.approval_codes ENABLE ROW LEVEL SECURITY;

-- Only admins can see/manage codes
CREATE POLICY "Admins can view approval codes"
  ON public.approval_codes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert approval codes"
  ON public.approval_codes FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update approval codes"
  ON public.approval_codes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. RPC: admin generates a code
CREATE OR REPLACE FUNCTION public.generate_approval_code(_email text, _notes text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _code text;
  _admin_id uuid;
BEGIN
  _admin_id := auth.uid();
  IF _admin_id IS NULL OR NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can generate approval codes';
  END IF;

  IF _email IS NULL OR length(trim(_email)) = 0 THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  -- Generate 8-char uppercase alphanumeric (no ambiguous chars)
  _code := upper(substr(translate(encode(gen_random_bytes(8), 'base64'), '+/=OIl01', 'XYZABCDE'), 1, 8));

  INSERT INTO public.approval_codes (code, email, notes, created_by)
  VALUES (_code, lower(trim(_email)), _notes, _admin_id);

  RETURN _code;
END;
$$;

-- 3. RPC: consume code during signup (called by anon, so SECURITY DEFINER + strict checks)
CREATE OR REPLACE FUNCTION public.consume_approval_code(_email text, _code text, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.approval_codes%ROWTYPE;
BEGIN
  SELECT * INTO _row FROM public.approval_codes
   WHERE code = upper(trim(_code))
     AND lower(email) = lower(trim(_email))
     AND used_at IS NULL
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  UPDATE public.approval_codes
     SET used_at = now(), used_by_user_id = _user_id
   WHERE id = _row.id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_approval_code(text, text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_approval_code(text, text) TO authenticated;