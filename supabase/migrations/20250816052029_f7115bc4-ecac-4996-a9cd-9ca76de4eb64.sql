-- Drop the constraint first
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;

-- Update ALL existing expense categories to valid ones
UPDATE expenses SET category = 'Other' WHERE category = 'Stationery';
UPDATE expenses SET category = 'Other' WHERE category = 'Utilities';
-- Salary stays the same as it's already valid

-- Now add the constraint with the correct categories
ALTER TABLE expenses ADD CONSTRAINT expenses_category_check 
CHECK (category = ANY (ARRAY['Transport', 'Salary', 'EMI''s', 'School Expense', 'Construction', 'Maintenance', 'Other']));