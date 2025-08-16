-- Add previous_year_fees column to student_fee_details table
ALTER TABLE student_fee_details 
ADD COLUMN previous_year_fees numeric DEFAULT 0 NOT NULL;

-- Create index for better performance on academic_year queries
CREATE INDEX IF NOT EXISTS idx_student_fee_details_academic_year ON student_fee_details(academic_year);
CREATE INDEX IF NOT EXISTS idx_student_fee_details_student_id ON student_fee_details(student_id);

-- Create index for better performance on students table
CREATE INDEX IF NOT EXISTS idx_students_academic_session ON students(academic_session);
CREATE INDEX IF NOT EXISTS idx_students_class_grade ON students(class_grade);

-- Create index for better performance on fee_transactions table  
CREATE INDEX IF NOT EXISTS idx_fee_transactions_academic_session ON fee_transactions(academic_session);
CREATE INDEX IF NOT EXISTS idx_fee_transactions_student_id ON fee_transactions(student_id);

-- Create index for better performance on student_fees table
CREATE INDEX IF NOT EXISTS idx_student_fees_student_id ON student_fees(student_id);