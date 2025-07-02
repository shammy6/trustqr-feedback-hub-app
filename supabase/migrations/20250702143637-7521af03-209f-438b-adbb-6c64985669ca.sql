-- Update the handle_new_user function to include business_uuid
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, name, business_name, email, business_uuid)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'business_name',
    NEW.email,
    COALESCE(
      (NEW.raw_user_meta_data ->> 'business_uuid')::uuid,
      gen_random_uuid()
    )
  );
  RETURN NEW;
END;
$$;