-- Enforce per-user expense category limits at the database layer.
-- Non-premium users: max 5 categories.
-- Premium users: unlimited.

CREATE OR REPLACE FUNCTION public.enforce_expense_category_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_tier text;
  existing_count integer;
  max_allowed integer;
BEGIN
  SELECT p.subscription_tier
    INTO current_tier
  FROM public.profiles p
  WHERE p.user_id = NEW.user_id;

  -- Default to 'free' if no profile row exists yet.
  current_tier := COALESCE(current_tier, 'free');

  IF current_tier = 'premium' THEN
    RETURN NEW;
  END IF;

  max_allowed := 5;

  SELECT COUNT(*)
    INTO existing_count
  FROM public.expense_categories c
  WHERE c.user_id = NEW.user_id;

  IF existing_count >= max_allowed THEN
    RAISE EXCEPTION 'Category limit reached (max %).', max_allowed
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_expense_category_limit ON public.expense_categories;
CREATE TRIGGER trg_enforce_expense_category_limit
BEFORE INSERT ON public.expense_categories
FOR EACH ROW
EXECUTE FUNCTION public.enforce_expense_category_limit();

