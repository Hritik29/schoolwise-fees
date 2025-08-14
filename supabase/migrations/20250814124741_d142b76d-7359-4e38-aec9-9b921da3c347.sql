-- Drop the existing constraint
ALTER TABLE expenses DROP CONSTRAINT expenses_category_check;

-- Add the new constraint with the correct categories
ALTER TABLE expenses ADD CONSTRAINT expenses_category_check 
CHECK (category = ANY (ARRAY['Transport', 'Salary', 'EMI''s', 'School Expense', 'Construction', 'Maintenance', 'Other']));