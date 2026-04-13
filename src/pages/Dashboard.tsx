import { useMemo } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncomes } from "@/hooks/useIncomes";
import { useDebts } from "@/hooks/useDebts";
import { useLoans } from "@/hooks/useLoans";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/lib/auth";
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal, ChevronRight, Wallet, Landmark, Receipt, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const currentMonth = format(new Date(), "yyyy-MM");
  const { data: expenses } = useExpenses(currentMonth);
  const { data: incomes } = useIncomes(currentMonth);
  const { data: debts } = useDebts();
  const { data: loans } = useLoans();

  const totalExpense = useMemo(() => (expenses || []).reduce((s, e) => s + e.amount, 0), [expenses]);
  const totalIncome = useMemo(() => (incomes || []).reduce((s, i) => s + i.amount, 0), [incomes]);
  const totalBalance = totalIncome - totalExpense;

  // Combine recent transactions (expenses + incomes), sorted by date
  const recentTransactions = useMemo(() => {
    const expEntries = (expenses || []).slice(0, 10).map(e => ({
      id: e.id,
      title: e.category,
      subtitle: format(new Date(e.expense_date), "dd MMM, hh:mm a"),
      amount: -e.amount,
      type: "expense" as const,
      date: e.expense_date,
      note: e.note,
    }));
    const incEntries = (incomes || []).slice(0, 10).map(i => ({
      id: i.id,
      title: i.source,
      subtitle: format(new Date(i.income_date), "dd MMM, hh:mm a"),
      amount: +i.amount,
      type: "income" as const,
      date: i.income_date,
      note: i.note,
    }));
    return [...expEntries, ...incEntries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [expenses, incomes]);

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || "User";

  const CATEGORY_ICONS: Record<string, string> = {
    Food: "🍔", Transport: "🚗", Shopping: "🛍️", Bills: "📄",
    Entertainment: "🎬", Health: "💊", Education: "📚", Other: "📦",
    Salary: "💼", Freelance: "💻", Investment: "📈", Business: "🏪", Rental: "🏠",
  };

  const quickAccess = [
    { label: "Income", icon: Wallet, path: "/income", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Expenses", icon: Receipt, path: "/expenses", color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Loans", icon: Landmark, path: "/loans", color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Recurring", icon: RefreshCw, path: "/recurring", color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="px-4 pb-28 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between safe-area-top pb-3">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-9 h-9 object-contain cursor-pointer"
            onClick={() => navigate("/")}
          />
          <div>
            <p className="text-xs text-muted-foreground">Welcome back</p>
            <h1 className="text-base font-bold font-display">{displayName}</h1>
          </div>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 transition-transform hover:scale-105 active:scale-95"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full gradient-primary flex items-center justify-center text-sm font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </button>
      </div>

      {/* Hero Balance Card */}
      <div className="gradient-hero rounded-2xl p-5 text-white relative overflow-hidden mt-1 animate-fade-in">
        {/* Decorative circles */}
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 rounded-full bg-white/10" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-white/80 font-medium">Total Balance</p>
            <button className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <p className="text-3xl font-bold font-display mb-4">
            ₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-white/70">Income</p>
                <p className="text-sm font-semibold">₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-white/70">Expenses</p>
                <p className="text-sm font-semibold">₹{totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        {quickAccess.map(({ label, icon: Icon, path, color, bg }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-card card-shadow
                       hover:bg-secondary/50 active:scale-[0.96] transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
          </button>
        ))}
      </div>

      {/* Transactions Header */}
      <div className="flex items-center justify-between mt-6 mb-3">
        <h2 className="text-base font-bold font-display">Transactions</h2>
        <button
          onClick={() => navigate("/expenses")}
          className="flex items-center gap-1 text-xs text-primary font-medium hover:text-primary/80 transition-colors"
        >
          See All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {recentTransactions.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground mt-1">Tap the + button to add one!</p>
          </div>
        )}
        {recentTransactions.map((t) => (
          <div key={t.id} className="flex items-center gap-3 bg-card rounded-xl p-3 card-shadow animate-fade-in">
            <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-lg shrink-0">
              {CATEGORY_ICONS[t.title] || (t.type === "income" ? "💰" : "📦")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{t.note || t.title}</p>
              <p className="text-[11px] text-muted-foreground">{t.subtitle}</p>
            </div>
            <p className={`text-sm font-bold whitespace-nowrap ${
              t.amount >= 0 ? "text-success" : "text-accent"
            }`}>
              {t.amount >= 0 ? "+" : ""}₹{Math.abs(t.amount).toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
