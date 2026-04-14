import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription, Feature } from "@/hooks/useSubscription";
import { Crown, Lock } from "lucide-react";

interface SubscriptionGateProps {
  feature: Feature;
  children: ReactNode;
  /** If true, shows the children with an overlay instead of blocking entirely */
  overlay?: boolean;
  /** Custom message to display */
  message?: string;
}

export default function SubscriptionGate({
  feature,
  children,
  overlay = false,
  message,
}: SubscriptionGateProps) {
  const navigate = useNavigate();
  const { canAccessFeature } = useSubscription();

  if (canAccessFeature(feature)) {
    return <>{children}</>;
  }

  if (overlay) {
    return (
      <div className="relative">
        <div className="opacity-40 pointer-events-none select-none blur-[1px]">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col items-center gap-3 p-5">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <p className="text-sm font-semibold text-center">
              {message || "Upgrade to unlock this feature"}
            </p>
            <button
              onClick={() => navigate("/subscription")}
              className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold
                         shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg mb-4">
        <Lock className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-lg font-bold font-display mb-1">Premium Feature</h3>
      <p className="text-sm text-muted-foreground text-center mb-4 max-w-xs">
        {message || "This feature is currently unavailable."}
      </p>
      <button
        onClick={() => navigate("/subscription")}
        className="px-6 py-3 rounded-2xl gradient-primary text-white text-sm font-semibold
                   shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
      >
        View Plans
      </button>
    </div>
  );
}
