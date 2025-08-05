-- Add missing fields to students table for enrollment
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS ifsc_code text,
ADD COLUMN IF NOT EXISTS bank_account_name text,
ADD COLUMN IF NOT EXISTS admission_date date DEFAULT CURRENT_DATE;