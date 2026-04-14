-- Final phase of E2E Encryption Migration
-- Drop the plaintext columns since all data has been moved into the encrypted_payload column

ALTER TABLE public.expenses
  DROP COLUMN amount,
  DROP COLUMN category,
  DROP COLUMN note,
  DROP COLUMN expense_date;

ALTER TABLE public.incomes
  DROP COLUMN amount,
  DROP COLUMN source,
  DROP COLUMN note,
  DROP COLUMN income_date;

ALTER TABLE public.debts
  DROP COLUMN amount,
  DROP COLUMN person_name,
  DROP COLUMN note,
  DROP COLUMN due_date,
  DROP COLUMN status,
  DROP COLUMN type;

-- Other tables like loans and recurring_expenses should be similarly altered once
-- their respective frontend React hooks are updated to use E2E logic as well!
