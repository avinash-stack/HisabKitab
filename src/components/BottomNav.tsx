import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, BarChart3, Users, Landmark, Plus } from "lucide-react";

const tabs = [
  { path: "/", label: "Home", icon: LayoutDashboard },
  { path: "/overview", label: "Overview", icon: BarChart3 },
  { path: "__fab__", label: "", icon: Plus },
  { path: "/debts", label: "Debts", icon: Users },
  { path: "/loans", label: "Loans", icon: Landmark },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
        {tabs.map(({ path, label, icon: Icon }) => {
          if (path === "__fab__") {
            return (
              <div key="fab" className="relative -mt-7">
                <button
                  onClick={() => navigate("/add")}
                  className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center fab-shadow
                             transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <Plus className="w-6 h-6 text-white" />
                </button>
              </div>
            );
          }

          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "drop-shadow-[0_0_6px_hsl(262,83%,58%)]" : ""}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
