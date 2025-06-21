
-- Add additional profile fields to users table
ALTER TABLE public.users 
ADD COLUMN review_page_link TEXT,
ADD COLUMN alert_email TEXT,
ADD COLUMN business_logo TEXT;
