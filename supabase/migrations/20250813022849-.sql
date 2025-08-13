-- Enforce only one active academic session at a time via trigger
DO $$ BEGIN
  -- Drop existing trigger if present to avoid duplicates
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'ensure_single_active_session_trg'
  ) THEN
    DROP TRIGGER ensure_single_active_session_trg ON public.academic_sessions;
  END IF;
END $$;

CREATE TRIGGER ensure_single_active_session_trg
BEFORE INSERT OR UPDATE ON public.academic_sessions
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_active_session();