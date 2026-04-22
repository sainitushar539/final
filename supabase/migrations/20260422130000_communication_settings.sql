CREATE TABLE public.communication_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  smtp_host text,
  smtp_port integer,
  smtp_secure boolean NOT NULL DEFAULT false,
  smtp_user text,
  smtp_password text,
  smtp_from_email text,
  smtp_from_name text,
  twilio_account_sid text,
  twilio_auth_token text,
  twilio_from_number text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.communication_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view communication settings"
ON public.communication_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert communication settings"
ON public.communication_settings
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update communication settings"
ON public.communication_settings
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete communication settings"
ON public.communication_settings
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_communication_settings_updated_at
BEFORE UPDATE ON public.communication_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
