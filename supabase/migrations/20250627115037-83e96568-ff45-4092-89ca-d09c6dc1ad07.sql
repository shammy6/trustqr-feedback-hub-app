
-- Create reviews table to store customer feedback
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES public.users(id) NOT NULL,
  customer_name text NOT NULL,
  customer_email text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert reviews (public submission)
CREATE POLICY "Anyone can submit reviews" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (true);

-- Allow business owners to view their own reviews
CREATE POLICY "Business owners can view their reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (business_id = auth.uid());

-- Allow business owners to update/delete their reviews if needed
CREATE POLICY "Business owners can manage their reviews" 
  ON public.reviews 
  FOR UPDATE 
  USING (business_id = auth.uid());

CREATE POLICY "Business owners can delete their reviews" 
  ON public.reviews 
  FOR DELETE 
  USING (business_id = auth.uid());
