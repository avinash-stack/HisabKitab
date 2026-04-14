-- Add an optional encrypted_payload column to all financial tables.
-- During the migration phase, the app will read the old columns, encrypt them, and store them here.
-- Once migration is confirmed successful, another migration will drop the old plaintext columns.

ALTER TABLE public.expenses ADD COLUMN encrypted_payload text;
ALTER TABLE public.incomes ADD COLUMN encrypted_payload text;
ALTER TABLE public.debts ADD COLUMN encrypted_payload text;
ALTER TABLE public.loans ADD COLUMN encrypted_payload text;
ALTER TABLE public.recurring_expenses ADD COLUMN encrypted_payload text;
ALTER TABLE public.debt_contacts ADD COLUMN encrypted_payload text;
ALTER TABLE public.expense_categories ADD COLUMN encrypted_payload text;
ALTER TABLE public.income_sources ADD COLUMN encrypted_payload text;
