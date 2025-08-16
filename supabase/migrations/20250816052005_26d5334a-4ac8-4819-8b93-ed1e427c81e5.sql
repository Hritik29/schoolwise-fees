-- First, let's see what's actually in the table
DO $$
BEGIN
    RAISE NOTICE 'Current categories in expenses table:';
    FOR rec IN SELECT DISTINCT category FROM expenses LOOP
        RAISE NOTICE 'Category: "%"', rec.category;
    END LOOP;
END $$;

-- Drop the constraint first
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;

-- Update ALL existing expense categories to 'Other' to avoid conflicts
UPDATE expenses SET category = 'Other' WHERE category NOT IN ('Transport', 'Salary', 'EMI''s', 'School Expense', 'Construction', 'Maintenance', 'Other');

-- Now add the constraint
ALTER TABLE expenses ADD CONSTRAINT expenses_category_check 
CHECK (category = ANY (ARRAY['Transport', 'Salary', 'EMI''s', 'School Expense', 'Construction', 'Maintenance', 'Other']));