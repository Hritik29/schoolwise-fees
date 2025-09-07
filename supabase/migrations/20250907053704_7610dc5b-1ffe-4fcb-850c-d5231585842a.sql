-- Add session_id columns to relevant tables
ALTER TABLE students ADD COLUMN session_id UUID REFERENCES academic_sessions(id);
ALTER TABLE student_fees ADD COLUMN session_id UUID REFERENCES academic_sessions(id);
ALTER TABLE student_fee_details ADD COLUMN session_id UUID REFERENCES academic_sessions(id);
ALTER TABLE fee_transactions ADD COLUMN session_id UUID REFERENCES academic_sessions(id);
ALTER TABLE expenses ADD COLUMN session_id UUID REFERENCES academic_sessions(id);

-- Create indexes for performance
CREATE INDEX idx_students_session_id ON students(session_id);
CREATE INDEX idx_student_fees_session_id ON student_fees(session_id);
CREATE INDEX idx_student_fee_details_session_id ON student_fee_details(session_id);
CREATE INDEX idx_fee_transactions_session_id ON fee_transactions(session_id);
CREATE INDEX idx_expenses_session_id ON expenses(session_id);

-- Update existing records to link to active session
UPDATE students SET session_id = (SELECT id FROM academic_sessions WHERE is_active = true LIMIT 1) WHERE session_id IS NULL;
UPDATE student_fees SET session_id = (SELECT id FROM academic_sessions WHERE is_active = true LIMIT 1) WHERE session_id IS NULL;
UPDATE student_fee_details SET session_id = (SELECT id FROM academic_sessions WHERE is_active = true LIMIT 1) WHERE session_id IS NULL;
UPDATE fee_transactions SET session_id = (SELECT id FROM academic_sessions WHERE is_active = true LIMIT 1) WHERE session_id IS NULL;
UPDATE expenses SET session_id = (SELECT id FROM academic_sessions WHERE is_active = true LIMIT 1) WHERE session_id IS NULL;

-- Make session_id required for new records
ALTER TABLE students ALTER COLUMN session_id SET NOT NULL;
ALTER TABLE student_fees ALTER COLUMN session_id SET NOT NULL;
ALTER TABLE student_fee_details ALTER COLUMN session_id SET NOT NULL;
ALTER TABLE fee_transactions ALTER COLUMN session_id SET NOT NULL;
ALTER TABLE expenses ALTER COLUMN session_id SET NOT NULL;

-- Update triggers to set session_id automatically
CREATE OR REPLACE FUNCTION public.set_session_id_from_active()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.session_id IS NULL THEN
        NEW.session_id := (
            SELECT id 
            FROM academic_sessions 
            WHERE is_active = true 
            LIMIT 1
        );
    END IF;
    RETURN NEW;
END;
$function$;

-- Create triggers for automatic session_id setting
CREATE TRIGGER set_session_id_students
    BEFORE INSERT ON students
    FOR EACH ROW
    EXECUTE FUNCTION set_session_id_from_active();

CREATE TRIGGER set_session_id_student_fees
    BEFORE INSERT ON student_fees
    FOR EACH ROW
    EXECUTE FUNCTION set_session_id_from_active();

CREATE TRIGGER set_session_id_student_fee_details
    BEFORE INSERT ON student_fee_details
    FOR EACH ROW
    EXECUTE FUNCTION set_session_id_from_active();

CREATE TRIGGER set_session_id_fee_transactions
    BEFORE INSERT ON fee_transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_session_id_from_active();

CREATE TRIGGER set_session_id_expenses
    BEFORE INSERT ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION set_session_id_from_active();