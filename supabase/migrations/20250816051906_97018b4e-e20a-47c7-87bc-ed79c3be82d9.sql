-- Check all existing categories first
SELECT category, COUNT(*) FROM expenses GROUP BY category;

-- Update all existing data to match frontend categories
UPDATE expenses SET category = 'Other' WHERE category IN ('Utilities', 'Stationery', 'Computer', 'Computer ');
-- Salary stays the same

-- Drop the existing constraint
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;

-- Add the new constraint with the correct categories
ALTER TABLE expenses ADD CONSTRAINT expenses_category_check 
CHECK (category = ANY (ARRAY['Transport', 'Salary', 'EMI''s', 'School Expense', 'Construction', 'Maintenance', 'Other']));