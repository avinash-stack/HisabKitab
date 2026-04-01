import { useMemo } from "react";
import { format } from "date-fns";
import { useExpenses } from "@/hooks/useExpenses";
import { useDebts } from "@/hooks/useDebts";
import { useLoans } from "@/hooks/useLoans";
import PageHeader from "@/components/PageHeader";
import { TrendingDown, TrendingUp, ArrowUpRight, ArrowDownRight, Landmark, PieChart } from "lucide-react";
import { PieChart as RPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["hsl(142,71%,45%)", "hsl(262,83%,58%)", "hsl(38,92%,50%)", "hsl(217,91%,60%)", "hsl(0,72%,51%)", "hsl(190,80%,50%)", "hsl(330,70%,50%)"];

export default function Dashboard() {
  const currentMonth = format(new Date(), "yyyy-MM");
  const { data: expenses } = useExpenses(currentMonth);
  const { data: debts } = useDebts();
  const { data: loans } = useLoans();

  const totalExpense = useMemo(() => (expenses || []).reduce((s, e) => s + e.amount, 0), [expenses]);
  const totalGiven = useMemo(() => (debts || []).filter(d => d.type === "given" && d.status === "pending").reduce((s, d) => s + d.amount, 0), [debts]);
  const totalTaken = useMemo(() => (debts || []).filter(d => d.type === "taken" && d.status === "pending").reduce((s, d) => s + d.amount, 0), [debts]);
  const upcomingEmi = useMemo(() => (loans || []).reduce((s, l) => s + l.emi_amount, 0), [loans]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    (expenses || []).forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const cards = [
    { label: "Monthly Expense", value: totalExpense, icon: TrendingDown, color: "text-destructive" },
    { label: "Debt Given", value: totalGiven, icon: ArrowUpRight, color: "text-warning" },
    { label: "Debt Taken", value: totalTaken, icon: ArrowDownRight, color: "text-info" },
    { label: "Upcoming EMI", value: upcomingEmi, icon: Landmark, color: "text-accent" },
  ];

  return (
    <div className="px-4 pb-24 max-w-lg mx-auto">
      <PageHeader title="HisabKitab" subtitle={format(new Date(), "MMMM yyyy")} />

      <div className="grid grid-cols-2 gap-3 mt-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="gradient-card rounded-xl p-4 border border-border animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-lg font-bold font-display">₹{value.toLocaleString("en-IN")}</p>
          </div>
        ))}
      </div>

      {categoryData.length > 0 && (
        <div className="gradient-card rounded-xl p-4 border border-border mt-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Category Breakdown</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(240,6%,8%)", border: "1px solid hsl(240,4%,16%)", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "hsl(0,0%,95%)" }}
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
                />
              </RPieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryData.map((c, i) => (
              <span key={c.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
