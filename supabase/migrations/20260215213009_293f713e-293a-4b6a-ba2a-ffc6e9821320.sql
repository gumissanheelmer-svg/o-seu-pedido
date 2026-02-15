
-- Create expenses table for business expense tracking
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'outros',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Business owners can manage their own expenses
CREATE POLICY "Business owners can manage own expenses"
ON public.expenses
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.businesses
  WHERE businesses.id = expenses.business_id
  AND businesses.owner_id = auth.uid()
));

-- Super admins can manage all expenses
CREATE POLICY "Super admins can manage all expenses"
ON public.expenses
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_expenses_business_id ON public.expenses(business_id);
CREATE INDEX idx_expenses_expense_date ON public.expenses(expense_date);
