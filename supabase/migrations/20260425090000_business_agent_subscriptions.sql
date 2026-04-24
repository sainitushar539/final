CREATE TABLE public.business_agent_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_type text NOT NULL,
  price_monthly integer NOT NULL DEFAULT 89,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled')),
  active boolean NOT NULL DEFAULT true,
  dummy_payment_success boolean NOT NULL DEFAULT true,
  subscribed_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (business_id, agent_type)
);

ALTER TABLE public.business_agent_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agent subscriptions"
ON public.business_agent_subscriptions FOR SELECT
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can insert their own agent subscriptions"
ON public.business_agent_subscriptions FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = business_agent_subscriptions.business_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own agent subscriptions"
ON public.business_agent_subscriptions FOR UPDATE
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
);

CREATE TRIGGER update_business_agent_subscriptions_updated_at
BEFORE UPDATE ON public.business_agent_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_business_agent_subscriptions_user_id
ON public.business_agent_subscriptions (user_id);

CREATE INDEX idx_business_agent_subscriptions_business_id
ON public.business_agent_subscriptions (business_id);
