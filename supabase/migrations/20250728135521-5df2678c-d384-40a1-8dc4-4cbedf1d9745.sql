-- Create missing triggers for automatic updates

-- Add trigger for student_fees to update outstanding amount automatically
CREATE OR REPLACE TRIGGER update_student_fees_outstanding
    BEFORE INSERT OR UPDATE ON student_fees
    FOR EACH ROW
    EXECUTE FUNCTION update_outstanding_amount();

-- Add trigger for fee_transactions to update student fees when payment is made
CREATE OR REPLACE TRIGGER update_fees_after_payment
    AFTER INSERT ON fee_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_student_fees_on_payment();

-- Add date_of_birth column to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'students' AND column_name = 'date_of_birth') THEN
        ALTER TABLE students ADD COLUMN date_of_birth DATE;
    END IF;
END $$;