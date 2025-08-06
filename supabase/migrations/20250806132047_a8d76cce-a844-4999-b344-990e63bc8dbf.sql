-- Add authentication table for hardcoded users
CREATE TABLE public.app_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Create policy for login access
CREATE POLICY "Allow login access" 
ON public.app_users 
FOR SELECT 
USING (true);

-- Insert hardcoded users
INSERT INTO public.app_users (email, password_hash) VALUES 
('rakesh@supervision.in', 'maheshwari1.1048'),
('arvind@supervision.in', 'arvind.20'),
('ram@supervision.in', 'fees.2025'),
('sunil@supervision.in', 'svia.2025'),
('admin', 'admin');

-- Create activity logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for logs
CREATE POLICY "Allow all operations on logs" 
ON public.activity_logs 
FOR ALL 
USING (true);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_app_users()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for app_users
CREATE TRIGGER update_app_users_updated_at
BEFORE UPDATE ON public.app_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_app_users();