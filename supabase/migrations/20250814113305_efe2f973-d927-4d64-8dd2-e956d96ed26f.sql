-- Fix search path for the app_users function
CREATE OR REPLACE FUNCTION public.update_updated_at_app_users()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;