import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncomes } from "@/hooks/useIncomes";
import { ArrowDownLeft, ArrowUpRight, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";

export default function Overview() {
  const currentMonth = format(new Date(), "yyyy-MM");
  const { data: expenses } = useExpenses(currentMonth);
  const { data: incomes } = useIncomes(currentMonth);
  const [tab, setTab] = useState<"income" | "expenses">("expenses");

  const totalExpense = useMemo(() => (expenses || []).reduce((s, e) => s + e.amount, 0), [expenses]);
  const totalIncome = useMemo(() => (incomes || []).reduce((s, i) => s + i.amount, 0), [incomes]);

  // Weekly data for chart
  const weeklyData = useMemo(() => {
    const weeks = [
      { name: "Week 1", income: 0, expenses: 0 },
      { name: "Week 2", income: 0, expenses: 0 },
      { name: "Week 3", income: 0, expenses: 0 },
      { name: "Week 4", income: 0, expenses: 0 },
    ];

    (expenses || []).forEach(e => {
      const day = new Date(e.expense_date).getDate();
      const weekIdx = Math.min(Math.floor((day - 1) / 7), 3);
      weeks[weekIdx].expenses += e.amount;
    });

    (incomes || []).forEach(i => {
      const day = new Date(i.income_date).getDate();
      const weekIdx = Math.min(Math.floor((day - 1) / 7), 3);
      weeks[weekIdx].income += i.amount;
    });

    return weeks;
  }, [expenses, incomes]);

  // Category/source breakdown for list
  const breakdownData = useMemo(() => {
    if (tab === "expenses") {
      const map: Record<string, number> = {};
      (expenses || []).forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
      return Object.entries(map).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
    } else {
      const map: Record<string, number> = {};
      (incomes || []).forEach(i => { map[i.source] = (map[i.source] || 0) + i.amount; });
      return Object.entries(map).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
    }
  }, [tab, expenses, incomes]);

  const CATEGORY_ICONS: Record<string, string> = {
    Food: "🍔", Transport: "🚗", Shopping: "🛍️", Bills: "📄",
    Entertainment: "🎬", Health: "💊", Education: "📚", Other: "📦",
    Salary: "💼", Freelance: "💻", Investment: "📈", Business: "🏪", Rental: "🏠",
  };

  const monthStart = format(new Date(), "MMM 01");
  const monthEnd = format(new Date(), "MMM dd");

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

      {/* Statistics */}
      <div className="mt-6 animate-fade-in">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-base font-bold font-display">Statistics</h2>
            <p className="text-[11px] text-muted-foreground">{monthStart} - {monthEnd}</p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-muted-foreground">
            Monthly <ChevronDown className="w-3 h-3" />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-card rounded-xl p-4 card-shadow mt-3">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barGap={4}>
                <CartesianGrid strokeDasharray="4 4" stroke="hsl(260, 15%, 90%)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(240, 10%, 46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(240, 10%, 46%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid hsl(260,15%,88%)", borderRadius: "10px", fontSize: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                  formatter={(value: number, name: string) => [`₹${value.toLocaleString("en-IN")}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Bar dataKey="income" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expenses" fill="hsl(16, 85%, 60%)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
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
          <p className="text-center text-sm text-muted-foreground py-8">No {tab} this month</p>
        )}
        {breakdownData.map((item) => (
          <div key={item.name} className="flex items-center gap-3 bg-card rounded-xl p-3 card-shadow animate-fade-in">
            <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-lg shrink-0">
              {CATEGORY_ICONS[item.name] || "📦"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-[11px] text-muted-foreground">{format(new Date(), "dd MMM yyyy")}</p>
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
