-- Add encrypted columns and drop plaintext columns for the remaining financial tables

-- 1. Debt Contacts
ALTER TABLE public.debt_contacts ADD COLUMN encrypted_payload text;
ALTER TABLE public.debt_contacts DROP COLUMN name;
ALTER TABLE public.debt_contacts DROP COLUMN phone;

-- 2. Loans
ALTER TABLE public.loans ADD COLUMN encrypted_payload text;
ALTER TABLE public.loans DROP COLUMN amount;
ALTER TABLE public.loans DROP COLUMN type;
ALTER TABLE public.loans DROP COLUMN status;
ALTER TABLE public.loans DROP COLUMN due_date;
ALTER TABLE public.loans DROP COLUMN given_to;
ALTER TABLE public.loans DROP COLUMN taken_from;
ALTER TABLE public.loans DROP COLUMN note;

-- 3. Recurring Expenses
ALTER TABLE public.recurring_expenses ADD COLUMN encrypted_payload text;
ALTER TABLE public.recurring_expenses DROP COLUMN amount;
ALTER TABLE public.recurring_expenses DROP COLUMN category;
ALTER TABLE public.recurring_expenses DROP COLUMN note;
ALTER TABLE public.recurring_expenses DROP COLUMN frequency;
ALTER TABLE public.recurring_expenses DROP COLUMN next_due_date;
ALTER TABLE public.recurring_expenses DROP COLUMN status;
