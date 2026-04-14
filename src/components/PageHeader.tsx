import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/useProfile";
import { ArrowLeft } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backButton?: boolean;
}

export default function PageHeader({ title, subtitle, action, backButton }: PageHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || "U";

  return (
    <div className="flex items-center justify-between safe-area-top pb-2 px-1">
      <div className="flex items-center gap-3">
        {backButton ? (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0 hover:bg-secondary/80 active:scale-95 transition-all text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          title === "HisabKitab" && (
            <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 object-contain drop-shadow-md cursor-pointer"
              onClick={() => navigate("/")}
            />
          )
        )}
        <div>
          <h1 className="text-xl font-bold font-display">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {action && <div className="flex items-center gap-2">{action}</div>}
        <button
          onClick={() => navigate("/profile")}
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 transition-transform hover:scale-105 active:scale-95"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
