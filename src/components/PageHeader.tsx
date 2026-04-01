import { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between pt-4 pb-2 px-1">
      <div className="flex items-center gap-3">
        {title === "HisabKitab" && <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-md" />}
        <div>
          <h1 className="text-xl font-bold font-display">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
