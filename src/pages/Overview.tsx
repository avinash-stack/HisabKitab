import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachWeekOfInterval, isWithinInterval, parseISO } from "date-fns";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncomes } from "@/hooks/useIncomes";
import { ArrowDownLeft, ArrowUpRight, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { Input } from "@/components/ui/input";

type FilterMode = "monthly" | "weekly" | "custom";

export default function Overview() {
  const [filterMode, setFilterMode] = useState<FilterMode>("monthly");
  const currentMonth = format(new Date(), "yyyy-MM");

  // For custom range
  const [customStart, setCustomStart] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [customEnd, setCustomEnd] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  // Fetch current month data (we always need it; custom filter operates on it client-side)
  const { data: expenses } = useExpenses(currentMonth);
  const { data: incomes } = useIncomes(currentMonth);
  const [tab, setTab] = useState<"income" | "expenses">("expenses");

  // Filter data by custom range if applicable
  const filteredExpenses = useMemo(() => {
    if (filterMode !== "custom" || !expenses) return expenses || [];
    const start = parseISO(customStart);
    const end = parseISO(customEnd);
    return expenses.filter(e => {
      const d = parseISO(e.expense_date);
      return isWithinInterval(d, { start, end });
    });
  }, [expenses, filterMode, customStart, customEnd]);

  const filteredIncomes = useMemo(() => {
    if (filterMode !== "custom" || !incomes) return incomes || [];
    const start = parseISO(customStart);
    const end = parseISO(customEnd);
    return incomes.filter(i => {
      const d = parseISO(i.income_date);
      return isWithinInterval(d, { start, end });
    });
  }, [incomes, filterMode, customStart, customEnd]);

  const totalExpense = useMemo(() => filteredExpenses.reduce((s, e) => s + e.amount, 0), [filteredExpenses]);
  const totalIncome = useMemo(() => filteredIncomes.reduce((s, i) => s + i.amount, 0), [filteredIncomes]);

  // Chart data based on filter mode
  const chartData = useMemo(() => {
    if (filterMode === "weekly") {
      // Daily breakdown for current week
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return {
          name: format(date, "EEE"),
          dateStr: format(date, "yyyy-MM-dd"),
          income: 0,
          expenses: 0,
        };
      });

      (expenses || []).forEach(e => {
        const dayEntry = days.find(d => d.dateStr === e.expense_date);
        if (dayEntry) dayEntry.expenses += e.amount;
      });

      (incomes || []).forEach(i => {
        const dayEntry = days.find(d => d.dateStr === i.income_date);
        if (dayEntry) dayEntry.income += i.amount;
      });

      return days;
    }

    // Monthly (weekly breakdown within month) or Custom
    const activeExpenses = filteredExpenses;
    const activeIncomes = filteredIncomes;

    const weeks = [
      { name: "Week 1", income: 0, expenses: 0 },
      { name: "Week 2", income: 0, expenses: 0 },
      { name: "Week 3", income: 0, expenses: 0 },
      { name: "Week 4", income: 0, expenses: 0 },
    ];

    activeExpenses.forEach(e => {
      const day = new Date(e.expense_date).getDate();
      const weekIdx = Math.min(Math.floor((day - 1) / 7), 3);
      weeks[weekIdx].expenses += e.amount;
    });

    activeIncomes.forEach(i => {
      const day = new Date(i.income_date).getDate();
      const weekIdx = Math.min(Math.floor((day - 1) / 7), 3);
      weeks[weekIdx].income += i.amount;
    });

    return weeks;
  }, [filterMode, expenses, incomes, filteredExpenses, filteredIncomes]);

  // Category/source breakdown for list
  const breakdownData = useMemo(() => {
    if (tab === "expenses") {
      const map: Record<string, number> = {};
      filteredExpenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
      return Object.entries(map).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
    } else {
      const map: Record<string, number> = {};
      filteredIncomes.forEach(i => { map[i.source] = (map[i.source] || 0) + i.amount; });
      return Object.entries(map).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
    }
  }, [tab, filteredExpenses, filteredIncomes]);

  const CATEGORY_ICONS: Record<string, string> = {
    Food: "🍔", Transport: "🚗", Shopping: "🛍️", Bills: "📄",
    Entertainment: "🎬", Health: "💊", Education: "📚", Other: "📦",
    Salary: "💼", Freelance: "💻", Investment: "📈", Business: "🏪", Rental: "🏠",
  };

  const getDateLabel = () => {
    if (filterMode === "weekly") {
      const ws = startOfWeek(new Date(), { weekStartsOn: 1 });
      const we = endOfWeek(new Date(), { weekStartsOn: 1 });
      return `${format(ws, "MMM dd")} — ${format(we, "MMM dd")}`;
    }
    if (filterMode === "custom") {
      return `${format(parseISO(customStart), "MMM dd")} — ${format(parseISO(customEnd), "MMM dd")}`;
    }
    return `${format(new Date(), "MMM 01")} — ${format(new Date(), "MMM dd")}`;
  };

  return (
    <div className="px-4 pb-28 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-center pt-4 pb-3">
        <h1 className="text-base font-bold font-display">Overview</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mt-1 animate-fade-in">
        <div className="bg-card rounded-xl p-4 card-shadow">
          <p className="text-[11px] text-muted-foreground mb-1">Total Income</p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowDownLeft className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-lg font-bold font-display">₹{totalIncome.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow">
          <p className="text-[11px] text-muted-foreground mb-1">Total Expenses</p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-accent" />
            </div>
            <p className="text-lg font-bold font-display">₹{totalExpense.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="mt-6 animate-fade-in">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-base font-bold font-display">Statistics</h2>
            <p className="text-[11px] text-muted-foreground">{getDateLabel()}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-secondary rounded-xl p-1 mt-3 mb-3">
          {(["monthly", "weekly", "custom"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                filterMode === mode
                  ? "bg-card text-foreground card-shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Custom Date Range */}
        {filterMode === "custom" && (
          <div className="flex gap-2 mb-3 animate-fade-in">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground mb-0.5 block">From</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="h-10 bg-card border-border rounded-xl pl-9 text-xs"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground mb-0.5 block">To</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="h-10 bg-card border-border rounded-xl pl-9 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bar Chart */}
        <div className="bg-card rounded-xl p-4 card-shadow">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="4 4" stroke="hsl(260, 15%, 90%)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(240, 10%, 46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(240, 10%, 46%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid hsl(260,15%,88%)", borderRadius: "10px", fontSize: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                  formatter={(value: number, name: string) => [`₹${value.toLocaleString("en-IN")}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Bar dataKey="income" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expenses" fill="hsl(16, 85%, 60%)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(262, 83%, 58%)" }} />
              <span className="text-[10px] text-muted-foreground font-medium">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(16, 85%, 60%)" }} />
              <span className="text-[10px] text-muted-foreground font-medium">Expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex mt-5 bg-secondary rounded-xl p-1 animate-fade-in">
        <button
          onClick={() => setTab("income")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            tab === "income" ? "bg-card text-foreground card-shadow" : "text-muted-foreground"
          }`}
        >
          Income
        </button>
        <button
          onClick={() => setTab("expenses")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            tab === "expenses" ? "bg-accent text-white card-shadow" : "text-muted-foreground"
          }`}
        >
          Expenses
        </button>
      </div>

      {/* Breakdown List */}
      <div className="space-y-2 mt-4">
        {breakdownData.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No {tab} in this period</p>
        )}
        {breakdownData.map((item) => (
          <div key={item.name} className="flex items-center gap-3 bg-card rounded-xl p-3 card-shadow animate-fade-in">
            <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-lg shrink-0">
              {CATEGORY_ICONS[item.name] || "📦"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {tab === "expenses"
                  ? `${((item.amount / totalExpense) * 100).toFixed(1)}% of total`
                  : `${((item.amount / totalIncome) * 100).toFixed(1)}% of total`}
              </p>
            </div>
            <p className={`text-sm font-bold ${tab === "expenses" ? "text-accent" : "text-primary"}`}>
              {tab === "expenses" ? "-" : "+"}₹{item.amount.toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
