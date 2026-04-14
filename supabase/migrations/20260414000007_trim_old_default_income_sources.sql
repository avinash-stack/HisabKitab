-- If old 6-source defaults were seeded previously, trim them down to 3.
-- Keeps: Salary, Freelance, Investment
-- Removes: Business, Rental, Other (only for users who have ALL 6 defaults and no extra sources).

WITH per_user AS (
  SELECT
    user_id,
    COUNT(*) AS total_sources,
    SUM(CASE WHEN name IN ('Salary','Freelance','Investment','Business','Rental','Other') THEN 1 ELSE 0 END) AS default6_count
  FROM public.income_sources
  GROUP BY user_id
),
users_to_trim AS (
  SELECT user_id
  FROM per_user
  WHERE total_sources = 6 AND default6_count = 6
)
DELETE FROM public.income_sources s
USING users_to_trim u
WHERE s.user_id = u.user_id
  AND s.name IN ('Business','Rental','Other');

