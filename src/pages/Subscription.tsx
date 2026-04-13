import { useNavigate } from "react-router-dom";
import { useSubscription, SubscriptionTier } from "@/hooks/useSubscription";
import PageHeader from "@/components/PageHeader";
import {
  Crown, Check, X, Zap, Sparkles, ArrowLeft,
  Receipt, Wallet, Users, Landmark, FileText,
  RefreshCw, BarChart3, Tag, Headphones,
} from "lucide-react";

type PlanFeature = {
  label: string;
  icon: React.ReactNode;
  free: string | boolean;
  pro: string | boolean;
  premium: string | boolean;
};

const features: PlanFeature[] = [
  {
    label: "Expenses & Income Tracking",
    icon: <Receipt className="w-4 h-4" />,
    free: "15 entries/mo",
    pro: "Unlimited",
    premium: "Unlimited",
  },
  {
    label: "Debt Tracking",
    icon: <Users className="w-4 h-4" />,
    free: "3 contacts",
    pro: "15 contacts",
    premium: "Unlimited",
  },
  {
    label: "Loans & EMI",
    icon: <Landmark className="w-4 h-4" />,
    free: false,
    pro: true,
    premium: true,
  },
  {
    label: "PDF Export",
    icon: <FileText className="w-4 h-4" />,
    free: false,
    pro: true,
    premium: true,
  },
  {
    label: "Recurring Expenses",
    icon: <RefreshCw className="w-4 h-4" />,
    free: false,
    pro: false,
    premium: true,
  },
  {
    label: "Overview & Charts",
    icon: <BarChart3 className="w-4 h-4" />,
    free: "Basic",
    pro: "Full",
    premium: "Full",
  },
  {
    label: "Custom Categories",
    icon: <Tag className="w-4 h-4" />,
    free: false,
    pro: "5 categories",
    premium: "Unlimited",
  },
  {
    label: "Priority Support",
    icon: <Headphones className="w-4 h-4" />,
    free: false,
    pro: false,
    premium: true,
  },
];

type PlanCard = {
  tier: SubscriptionTier;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  popular?: boolean;
};

const plans: PlanCard[] = [
  {
    tier: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Get started with basic expense tracking",
    icon: <Zap className="w-6 h-6" />,
    gradient: "from-gray-500 to-gray-600",
  },
  {
    tier: "pro",
    name: "Pro",
    price: "₹99",
    period: "/month",
    description: "Full tracking with loans, PDF export & more",
    icon: <Sparkles className="w-6 h-6" />,
    gradient: "from-purple-600 to-violet-500",
    popular: true,
  },
  {
    tier: "premium",
    name: "Premium",
    price: "₹199",
    period: "/month",
    description: "Everything unlimited with priority support",
    icon: <Crown className="w-6 h-6" />,
    gradient: "from-amber-500 to-orange-500",
  },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true)
    return <Check className="w-4 h-4 text-success" />;
  if (value === false)
    return <X className="w-4 h-4 text-muted-foreground/40" />;
  return <span className="text-xs font-medium text-foreground">{value}</span>;
}

export default function Subscription() {
  const navigate = useNavigate();
  const { tier: currentTier } = useSubscription();

  return (
    <div className="px-4 pb-28 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 safe-area-top pb-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold font-display">Choose Your Plan</h1>
          <p className="text-xs text-muted-foreground">Unlock the full HisabKitab experience</p>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="space-y-4 mt-4">
        {plans.map((plan, idx) => {
          const isActive = currentTier === plan.tier;
          return (
            <div
              key={plan.tier}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 animate-fade-in ${isActive
                ? "border-primary shadow-lg shadow-primary/10"
                : plan.popular
                  ? "border-primary/30"
                  : "border-border"
                }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Popular badge */}
              {plan.popular && !isActive && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                    POPULAR
                  </div>
                </div>
              )}

              {/* Active badge */}
              {isActive && (
                <div className="absolute top-0 right-0">
                  <div className="bg-success text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                    CURRENT PLAN
                  </div>
                </div>
              )}

              <div className="p-5">
                {/* Plan Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.gradient} 
                                   flex items-center justify-center text-white shadow-md`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-display">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-display">{plan.price}</span>
                      <span className="text-xs text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>

                {/* Feature List */}
                <div className="space-y-2 mb-4">
                  {features.map((f) => {
                    const val = f[plan.tier];
                    return (
                      <div key={f.label} className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${val === false ? "text-muted-foreground/30" : "text-primary"
                          }`}>
                          {f.icon}
                        </div>
                        <span className={`text-xs flex-1 ${val === false ? "text-muted-foreground/50 line-through" : "text-foreground"
                          }`}>
                          {f.label}
                        </span>
                        <FeatureValue value={val} />
                      </div>
                    );
                  })}
                </div>

                {/* CTA Button */}
                {isActive ? (
                  <div className="w-full py-3 rounded-2xl bg-success/10 text-success text-center text-sm font-semibold">
                    ✓ Active Plan
                  </div>
                ) : plan.tier === "free" ? (
                  <div className="w-full py-3 rounded-2xl bg-secondary text-muted-foreground text-center text-sm font-medium">
                    Free Forever
                  </div>
                ) : (
                  <button
                    className={`w-full py-3 rounded-2xl text-white text-sm font-semibold
                               bg-gradient-to-r ${plan.gradient} shadow-md
                               transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                               relative overflow-hidden`}
                  >
                    <span className="relative z-10">
                      Upgrade to {plan.name}
                    </span>
                    <span className="absolute top-1 right-3 text-[9px] text-white/70 font-normal">
                      Coming Soon
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Cancel anytime · Secure payments · Instant access
        </p>
      </div>
    </div>
  );
}
