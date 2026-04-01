import { useAuth } from "@/lib/auth";
import { LogOut } from "lucide-react";
import { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  const { signOut, user } = useAuth();

  return (
    <div className="flex items-center justify-between pt-4 pb-2 px-1">
      <div>
        <h1 className="text-xl font-bold font-display">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {action}
        <button
          onClick={signOut}
          className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title={`Logout (${user?.email || ""})`}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
