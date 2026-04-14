-- Launch cleanup (ONE-TIME): wipe all existing data, including users.
-- This migration is intended to run once on first production deploy.

-- Public app tables (keep schema, wipe rows)
TRUNCATE TABLE public.expenses CASCADE;
TRUNCATE TABLE public.incomes CASCADE;
TRUNCATE TABLE public.debts CASCADE;
TRUNCATE TABLE public.loans CASCADE;
TRUNCATE TABLE public.recurring_expenses CASCADE;
TRUNCATE TABLE public.debt_contacts CASCADE;
TRUNCATE TABLE public.expense_categories CASCADE;
TRUNCATE TABLE public.income_sources CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- Auth data (requires privileges available in Supabase migrations)
DO $$
BEGIN
  -- Remove all users (cascades to profiles via FK on public.profiles.user_id).
  DELETE FROM auth.users;

  -- Extra safety cleanup for related auth tables (if present / not cascaded)
  IF to_regclass('auth.identities') IS NOT NULL THEN
    EXECUTE 'DELETE FROM auth.identities';
  END IF;
  IF to_regclass('auth.sessions') IS NOT NULL THEN
    EXECUTE 'DELETE FROM auth.sessions';
  END IF;
  IF to_regclass('auth.refresh_tokens') IS NOT NULL THEN
    EXECUTE 'DELETE FROM auth.refresh_tokens';
  END IF;
  IF to_regclass('auth.mfa_factors') IS NOT NULL THEN
    EXECUTE 'DELETE FROM auth.mfa_factors';
  END IF;
  IF to_regclass('auth.mfa_challenges') IS NOT NULL THEN
    EXECUTE 'DELETE FROM auth.mfa_challenges';
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privilege to wipe auth schema. Run a service-role cleanup manually in Supabase dashboard.';
END
$$;

