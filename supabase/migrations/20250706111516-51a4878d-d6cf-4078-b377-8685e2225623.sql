-- Create page_views table for tracking visits
CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_uuid uuid NOT NULL,
  user_agent text,
  referrer text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create qr_scans table for tracking QR code scans
CREATE TABLE public.qr_scans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_uuid uuid NOT NULL,
  scan_type text DEFAULT 'qr_code',
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert page views (public visits)
CREATE POLICY "Anyone can submit page views"
  ON public.page_views
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to insert QR scans (public scans)
CREATE POLICY "Anyone can submit qr scans"
  ON public.qr_scans
  FOR INSERT
  WITH CHECK (true);

-- Allow business owners to view their own page views
CREATE POLICY "Business owners can view their page views"
  ON public.page_views
  FOR SELECT
  USING (
    business_uuid IN (
      SELECT business_uuid FROM public.users WHERE id = auth.uid()
    )
  );

-- Allow business owners to view their own QR scans
CREATE POLICY "Business owners can view their qr scans"
  ON public.qr_scans
  FOR SELECT
  USING (
    business_uuid IN (
      SELECT business_uuid FROM public.users WHERE id = auth.uid()
    )
  );

-- Enable realtime for all tables
ALTER TABLE public.reviews REPLICA IDENTITY FULL;
ALTER TABLE public.page_views REPLICA IDENTITY FULL;
ALTER TABLE public.qr_scans REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_scans;