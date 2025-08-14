-- Create function to set default academic session to active session
CREATE OR REPLACE FUNCTION public.set_default_academic_session()
RETURNS TRIGGER AS $$
BEGIN
    -- Set academic_session to active session if not provided
    IF NEW.academic_session IS NULL THEN
        NEW.academic_session := (
            SELECT session_name 
            FROM academic_sessions 
            WHERE is_active = true 
            LIMIT 1
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger to automatically set academic session on student insert
DROP TRIGGER IF EXISTS set_student_academic_session_trg ON public.students;
CREATE TRIGGER set_student_academic_session_trg
    BEFORE INSERT ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.set_default_academic_session();