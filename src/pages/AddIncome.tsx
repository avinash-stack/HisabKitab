import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useIncomes, IncomeInput } from "@/hooks/useIncomes";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import WeekStrip from "@/components/WeekStrip";
import CategoryPills from "@/components/CategoryPills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AddIncome() {
  const navigate = useNavigate();
  const currentMonth = format(new Date(), "yyyy-MM");
  const { addIncome } = useIncomes(currentMonth);
  const { sources } = useIncomeSources();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [form, setForm] = useState<IncomeInput>({
    amount: 0,
    source: sources[0]?.name || "Other",
    note: "",
    income_date: format(new Date(), "yyyy-MM-dd"),
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setForm(f => ({ ...f, income_date: format(date, "yyyy-MM-dd") }));
  };

  const handleSubmit = () => {
    if (!form.amount) { toast.error("Enter an amount"); return; }
    addIncome.mutate(form, {
      onSuccess: () => {
        toast.success("Income added!");
        navigate(-1);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-8">
      <div className="flex items-center gap-3 pt-4 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold font-display">Add Income</h1>
      </div>

      <div className="space-y-5 animate-fade-in">
        <WeekStrip selectedDate={selectedDate} onSelect={handleDateSelect} />

        <div>
          <p className="text-sm font-semibold mb-2">Income Title</p>
          <Input placeholder="e.g. Remote Job" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-12 bg-card border-border rounded-xl" />
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Amount</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">₹</span>
            <Input type="number" placeholder="0" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="h-14 bg-card border-border rounded-xl pl-9 text-2xl font-bold" />
          </div>
        </div>

        <CategoryPills
          items={sources}
          selected={form.source}
          onSelect={(name) => setForm({ ...form, source: name })}
          onAddNew={() => navigate("/profile")}
        />

        <Button onClick={handleSubmit} disabled={addIncome.isPending} className="w-full h-14 gradient-primary text-white font-semibold text-base rounded-2xl mt-4">
          {addIncome.isPending ? "Adding..." : "Add Income"}
        </Button>
      </div>
    </div>
  );
}
