-- Fix search path security issue for existing functions
CREATE OR REPLACE FUNCTION public.ensure_single_active_session()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.is_active then
    update public.academic_sessions
      set is_active = false
      where id <> new.id and is_active = true;
  end if;
  return new;
end;
$function$;

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

CREATE OR REPLACE FUNCTION public.update_student_fees_on_payment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Update paid amount in student_fees
    UPDATE student_fees 
    SET paid_amount = paid_amount + NEW.amount
    WHERE id = NEW.student_fee_id;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_outstanding_amount()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.outstanding_amount = NEW.total_amount - NEW.paid_amount;
    
    -- Update status based on payment
    IF NEW.outstanding_amount <= 0 THEN
        NEW.status = 'paid';
    ELSIF NEW.paid_amount > 0 THEN
        NEW.status = 'partial';
    ELSE
        NEW.status = 'pending';
    END IF;
    
    RETURN NEW;
END;
$function$;