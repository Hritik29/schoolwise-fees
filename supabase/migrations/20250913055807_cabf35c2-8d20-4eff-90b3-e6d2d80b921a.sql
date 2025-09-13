-- Remove existing unique constraint on student_id if it exists
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_student_id_key;

-- Add composite unique constraint for student_id + session_id
-- This allows same student_id across different sessions but prevents duplicates within a session
ALTER TABLE public.students ADD CONSTRAINT students_student_id_session_id_key UNIQUE (student_id, session_id);