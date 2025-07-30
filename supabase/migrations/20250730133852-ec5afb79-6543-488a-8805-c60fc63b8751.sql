-- Add new fields to students table
ALTER TABLE public.students 
ADD COLUMN aadhar_number text,
ADD COLUMN sssm_id text,
ADD COLUMN apar_id text,
ADD COLUMN account_number text;

-- Update fee_transactions to better track fee types
ALTER TABLE public.fee_transactions 
ADD COLUMN fee_category text DEFAULT 'tuition',
ADD COLUMN applied_to_fee_type text DEFAULT 'tuition';

-- Create a more detailed fee tracking system
CREATE TABLE IF NOT EXISTS public.student_fee_details (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL,
    fee_type text NOT NULL, -- 'tuition', 'transport', 'admission', 'other'
    total_amount numeric NOT NULL DEFAULT 0,
    paid_amount numeric NOT NULL DEFAULT 0,
    outstanding_amount numeric NOT NULL DEFAULT 0,
    academic_year text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.student_fee_details ENABLE ROW LEVEL SECURITY;

-- Create policy for the new table
CREATE POLICY "Allow all operations on student_fee_details" 
ON public.student_fee_details 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_student_fee_details_updated_at
    BEFORE UPDATE ON public.student_fee_details
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update fee details when payment is made
CREATE OR REPLACE FUNCTION public.update_fee_details_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Update the specific fee type detail
    UPDATE student_fee_details 
    SET 
        paid_amount = paid_amount + NEW.amount,
        outstanding_amount = total_amount - (paid_amount + NEW.amount),
        updated_at = now()
    WHERE student_id = NEW.student_id 
    AND fee_type = COALESCE(NEW.applied_to_fee_type, 'tuition');
    
    -- If no record exists, create one
    IF NOT FOUND THEN
        INSERT INTO student_fee_details (student_id, fee_type, total_amount, paid_amount, outstanding_amount)
        VALUES (NEW.student_id, COALESCE(NEW.applied_to_fee_type, 'tuition'), NEW.amount, NEW.amount, 0);
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create trigger for fee details update
CREATE TRIGGER update_fee_details_on_payment_trigger
    AFTER INSERT ON public.fee_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_fee_details_on_payment();