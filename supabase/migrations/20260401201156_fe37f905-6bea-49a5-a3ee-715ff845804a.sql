-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'client',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-assign 'client' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_role();

-- Checklist submissions table
CREATE TABLE public.checklist_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  checklist_key text NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamp with time zone,
  verified_by uuid,
  UNIQUE (business_id, checklist_key)
);

ALTER TABLE public.checklist_submissions ENABLE ROW LEVEL SECURITY;

-- Clients can view/insert submissions for their own businesses
CREATE POLICY "Users can view their own submissions"
ON public.checklist_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = checklist_submissions.business_id AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert submissions for their businesses"
ON public.checklist_submissions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = checklist_submissions.business_id AND b.user_id = auth.uid()
  )
);

-- Admin can view all submissions
CREATE POLICY "Admins can view all submissions"
ON public.checklist_submissions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update submissions"
ON public.checklist_submissions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Update businesses RLS: admins can see all
CREATE POLICY "Admins can view all businesses"
ON public.businesses FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));