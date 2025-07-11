-- Create follow_up_logs table for tracking sent follow-up messages
CREATE TABLE public.follow_up_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_uuid uuid NOT NULL,
  review_id uuid,
  method text DEFAULT 'email',
  sent_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.follow_up_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for business owners to view their own follow-up logs
CREATE POLICY "Business owners can view their follow-up logs" 
ON public.follow_up_logs 
FOR SELECT 
USING (business_uuid IN ( 
  SELECT users.business_uuid
  FROM users
  WHERE users.id = auth.uid()
));

-- Create policy for business owners to insert their own follow-up logs
CREATE POLICY "Business owners can insert their follow-up logs" 
ON public.follow_up_logs 
FOR INSERT 
WITH CHECK (business_uuid IN ( 
  SELECT users.business_uuid
  FROM users
  WHERE users.id = auth.uid()
));

-- Create index for better performance on business_uuid and sent_at queries
CREATE INDEX idx_follow_up_logs_business_uuid_sent_at ON public.follow_up_logs(business_uuid, sent_at);
CREATE INDEX idx_follow_up_logs_review_id ON public.follow_up_logs(review_id);