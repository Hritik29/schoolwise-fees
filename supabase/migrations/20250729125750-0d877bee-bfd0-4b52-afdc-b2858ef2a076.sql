-- Create class-based tuition fee structure
CREATE TABLE IF NOT EXISTS public.class_fee_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_grade TEXT NOT NULL UNIQUE,
  tuition_fee_yearly NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.class_fee_structures ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on class_fee_structures" 
ON public.class_fee_structures 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert default tuition fees for each class
INSERT INTO public.class_fee_structures (class_grade, tuition_fee_yearly) VALUES
('Nursery', 15000),
('LKG', 18000),
('UKG', 20000),
('1st', 22000),
('2nd', 24000),
('3rd', 26000),
('4th', 28000),
('5th', 30000),
('6th', 32000),
('7th', 34000),
('8th', 36000),
('9th', 38000),
('10th', 40000),
('11th', 42000),
('12th', 45000);

-- Add fee_type column to fee_transactions
ALTER TABLE public.fee_transactions 
ADD COLUMN IF NOT EXISTS fee_type TEXT DEFAULT 'tuition';

-- Create trigger for updated_at
CREATE TRIGGER update_class_fee_structures_updated_at
  BEFORE UPDATE ON public.class_fee_structures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();