
-- Add a new UUID column to the users table (which stores business information)
ALTER TABLE public.users ADD COLUMN business_uuid UUID DEFAULT gen_random_uuid();

-- Create a unique index on the business_uuid column for fast lookups
CREATE UNIQUE INDEX idx_users_business_uuid ON public.users(business_uuid);

-- Update existing records to have UUIDs (for backwards compatibility)
UPDATE public.users SET business_uuid = gen_random_uuid() WHERE business_uuid IS NULL;

-- Make the business_uuid column NOT NULL after populating existing records
ALTER TABLE public.users ALTER COLUMN business_uuid SET NOT NULL;
