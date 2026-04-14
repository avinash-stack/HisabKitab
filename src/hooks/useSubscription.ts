import { useProfile } from "./useProfile";

export type SubscriptionTier = "free" | "pro" | "premium";

export type Feature =
  | "unlimited_entries"
  | "unlimited_debts"
  | "loans"
  | "pdf_export"
  | "recurring_expenses"
  | "full_overview"
  | "custom_categories"
  | "priority_support";

/** Feature → minimum tier required */
const FEATURE_ACCESS: Record<Feature, SubscriptionTier> = {
  unlimited_entries: "pro",
  unlimited_debts: "pro",
  loans: "pro",
  pdf_export: "pro",
  recurring_expenses: "premium",
  full_overview: "pro",
  custom_categories: "pro",
  priority_support: "premium",
};

/** Free tier limits */
export const FREE_LIMITS = {
  entries_per_month: 15,
  debt_contacts: 3,
  custom_categories: 0,
};

/** Pro tier limits */
export const PRO_LIMITS = {
  debt_contacts: 15,
  custom_categories: 5,
};

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  premium: 2,
};

/**
 * Temporary behavior (until pricing is launched):
 * - Everyone gets Pro access for Pro-tier features.
 * - Premium features remain restricted to users set to `premium` from backend.
 */
const PRICING_LAUNCHED = false;

export function useSubscription() {
  const { data: profile } = useProfile();

  const rawTier = (profile?.subscription_tier || "free") as SubscriptionTier;
  const expiresAt = profile?.subscription_expires_at
    ? new Date(profile.subscription_expires_at)
    : null;

  // Check if subscription is still active
  const isExpired = expiresAt ? expiresAt < new Date() : false;
  const tier: SubscriptionTier = isExpired ? "free" : rawTier;

  // Access tier can be temporarily elevated until pricing is implemented.
  const accessTier: SubscriptionTier = PRICING_LAUNCHED
    ? tier
    : tier === "premium"
      ? "premium"
      : "pro";

  const isProOrAbove = TIER_RANK[accessTier] >= TIER_RANK.pro;
  const isPremium = accessTier === "premium";

  const canAccessFeature = (feature: Feature): boolean => {
    const requiredTier = FEATURE_ACCESS[feature];
    return TIER_RANK[accessTier] >= TIER_RANK[requiredTier];
  };

  const getDebtContactLimit = (): number | null => {
    if (isPremium) return null; // unlimited
    if (isProOrAbove) return PRO_LIMITS.debt_contacts;
    return FREE_LIMITS.debt_contacts;
  };

  const getEntryLimit = (): number | null => {
    if (isProOrAbove) return null; // unlimited
    return FREE_LIMITS.entries_per_month;
  };

  const getCustomCategoryLimit = (): number | null => {
    if (isPremium) return null; // unlimited
    if (isProOrAbove) return PRO_LIMITS.custom_categories;
    return FREE_LIMITS.custom_categories;
  };

  return {
    tier,
    isProOrAbove,
    isPremium,
    isExpired,
    expiresAt,
    canAccessFeature,
    getDebtContactLimit,
    getEntryLimit,
    getCustomCategoryLimit,
  };
}
