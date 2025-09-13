-- Fix function search path security issue
CREATE OR REPLACE FUNCTION promote_student(
    p_student_id UUID,
    p_new_class TEXT,
    p_new_section TEXT,
    p_new_session UUID
) RETURNS VOID AS $$
DECLARE
    v_enrollment_id UUID;
BEGIN
    -- Insert new enrollment for the student in the new session
    INSERT INTO student_enrollments(student_id, class_grade, section, session_id)
    VALUES (p_student_id, p_new_class, p_new_section, p_new_session)
    RETURNING id INTO v_enrollment_id;

    -- Auto-generate fee records based on class fee structure for this session
    INSERT INTO student_fees(student_id, fee_structure_id, total_amount, paid_amount, outstanding_amount, status, session_id)
    SELECT 
        p_student_id,
        fs.id,
        fs.amount,
        0,
        fs.amount,
        'pending',
        p_new_session
    FROM fee_structures fs
    WHERE fs.class_grade = p_new_class
      AND fs.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;