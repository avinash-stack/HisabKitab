-- Clean all test data before production launch
-- This will wipe all existing records from the financial tables

TRUNCATE TABLE public.expenses CASCADE;
TRUNCATE TABLE public.incomes CASCADE;
TRUNCATE TABLE public.debts CASCADE;
TRUNCATE TABLE public.loans CASCADE;
TRUNCATE TABLE public.recurring_expenses CASCADE;
TRUNCATE TABLE public.debt_contacts CASCADE;
