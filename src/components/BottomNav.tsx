import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, BarChart3, Users, UserCircle, Plus, X, Receipt, Wallet, Landmark, HandCoins } from "lucide-react";

const tabs = [
  { path: "/", label: "Home", icon: LayoutDashboard },
  { path: "/overview", label: "Overview", icon: BarChart3 },
  { path: "__fab__", label: "", icon: Plus },
  { path: "/debts", label: "Debts", icon: Users },
  { path: "/profile", label: "Profile", icon: UserCircle },
];

const fabActions = [
  { label: "Add Expense", icon: Receipt, path: "/expenses", color: "bg-accent" },
  { label: "Add Income", icon: Wallet, path: "/income", color: "bg-primary" },
  { label: "Add Loan", icon: Landmark, path: "/loans", color: "bg-info" },
  { label: "Add Debts", icon: HandCoins, path: "/debts", color: "bg-warning" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [fabOpen, setFabOpen] = useState(false);

  const handleFabAction = (path: string) => {
    setFabOpen(false);
    navigate(path, { state: { openForm: true } });
  };

  return (
    <>
      {/* Overlay */}
      {fabOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* FAB Action Menu */}
      {fabOpen && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 animate-fade-in">
          {fabActions.map((action, i) => (
            <button
              key={action.label}
              onClick={() => handleFabAction(action.path)}
              className="flex items-center gap-3 bg-card rounded-2xl px-5 py-3 card-shadow min-w-[200px]
                         hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
          {tabs.map(({ path, label, icon: Icon }) => {
            if (path === "__fab__") {
              return (
                <div key="fab" className="relative -mt-7">
                  <button
                    onClick={() => setFabOpen(!fabOpen)}
                    className={`w-14 h-14 rounded-full gradient-primary flex items-center justify-center fab-shadow
                               transition-all duration-300 ${fabOpen ? "rotate-45 scale-110" : "hover:scale-105 active:scale-95"}`}
                  >
                    {fabOpen ? (
                      <X className="w-6 h-6 text-white" />
                    ) : (
                      <Plus className="w-6 h-6 text-white" />
                    )}
                  </button>
                </div>
              );
            }

            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => { setFabOpen(false); navigate(path); }}
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
    </>
  );
}
