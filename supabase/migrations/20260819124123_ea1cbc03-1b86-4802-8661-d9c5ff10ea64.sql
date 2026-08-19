CREATE TABLE public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL DEFAULT '',
  contact_person TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  product TEXT NOT NULL DEFAULT '',
  quantity TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT INSERT ON public.quote_requests TO anon;
GRANT ALL ON public.quote_requests TO service_role;

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a quote request" ON public.quote_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read quote requests" ON public.quote_requests FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));
CREATE POLICY "Admins can update quote requests" ON public.quote_requests FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid())) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));
CREATE POLICY "Admins can delete quote requests" ON public.quote_requests FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON public.quote_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.quote_requests (company, contact_person, email, country, product, quantity, status, created_at) VALUES
('EuroFresh GmbH', 'Hans Müller', 'hans@eurofresh.de', 'Germany', 'Oranges', '20 tons', 'pending', '2026-07-25T10:00:00Z'),
('Gulf Fruits Co', 'Salem Al-Otaibi', 'salem@gulffruits.sa', 'Saudi Arabia', 'Potatoes', '50 tons', 'sent', '2026-07-23T10:00:00Z'),
('Nordic Produce AB', 'Erik Larsson', 'erik@nordic.se', 'Sweden', 'Pomegranates', '10 tons', 'won', '2026-07-21T10:00:00Z');