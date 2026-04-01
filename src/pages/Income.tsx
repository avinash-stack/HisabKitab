import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, subMonths, addMonths } from "date-fns";
import { useIncomes, IncomeInput } from "@/hooks/useIncomes";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import PageHeader from "@/components/PageHeader";
import FormSheet from "@/components/FormSheet";
import WeekStrip from "@/components/WeekStrip";
import CategoryPills from "@/components/CategoryPills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function Income() {
  const navigate = useNavigate();
  const [month, setMonth] = useState(new Date());
  const monthStr = format(month, "yyyy-MM");
  const { data: incomes, addIncome, updateIncome, deleteIncome } = useIncomes(monthStr);
  const { sources } = useIncomeSources();

  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if ((location.state as any)?.openForm) {
      setTimeout(() => openAdd(), 300);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<IncomeInput>({ amount: 0, source: "", note: "", income_date: format(new Date(), "yyyy-MM-dd") });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const openAdd = () => {
    setEditId(null);
    const src = sources[0]?.name || "Other";
    setForm({ amount: 0, source: src, note: "", income_date: format(new Date(), "yyyy-MM-dd") });
    setSelectedDate(new Date());
    setOpen(true);
  };

  const openEdit = (i: NonNullable<typeof incomes>[number]) => {
    setEditId(i.id);
    setForm({ amount: i.amount, source: i.source, note: i.note || "", income_date: i.income_date });
    setSelectedDate(new Date(i.income_date));
    setOpen(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setForm(f => ({ ...f, income_date: format(date, "yyyy-MM-dd") }));
  };

  const handleSubmit = () => {
    if (!form.amount) { toast.error("Enter an amount"); return; }
    if (editId) {
      updateIncome.mutate({ ...form, id: editId }, { onSuccess: () => setOpen(false) });
    } else {
      addIncome.mutate(form, { onSuccess: () => setOpen(false) });
    }
  };

  const total = (incomes || []).reduce((s, i) => s + i.amount, 0);

  const SOURCE_ICONS: Record<string, string> = {
    Salary: "💼", Freelance: "💻", Investment: "📈", Business: "🏪", Rental: "🏠", Other: "💰",
  };

  return (
    <div className="px-4 pb-28 max-w-lg mx-auto">
      <PageHeader title="Income" />

      {/* Month Picker */}
      <div className="flex items-center justify-between mt-3 mb-4">
        <button onClick={() => setMonth(subMonths(month, 1))} className="p-2 rounded-lg bg-secondary text-muted-foreground">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-medium text-sm">{format(month, "MMMM yyyy")}</span>
        <button onClick={() => setMonth(addMonths(month, 1))} className="p-2 rounded-lg bg-secondary text-muted-foreground">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Total */}
      <div className="gradient-card rounded-xl p-4 card-shadow mb-4">
        <p className="text-xs text-muted-foreground">Total income this month</p>
        <p className="text-2xl font-bold font-display text-gradient">₹{total.toLocaleString("en-IN")}</p>
      </div>

      {/* List */}
      <div className="space-y-2">
        {(incomes || []).map((i) => (
          <div key={i.id} className="flex items-center gap-3 bg-card rounded-xl p-3 card-shadow animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-base shrink-0">
              {SOURCE_ICONS[i.source] || "💰"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{i.note || i.source}</p>
              <p className="text-[11px] text-muted-foreground">{format(new Date(i.income_date), "dd MMM yyyy")}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-success">+₹{i.amount.toLocaleString("en-IN")}</span>
              <button onClick={() => openEdit(i)} className="p-1.5 text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => deleteIncome.mutate(i.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {incomes?.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No income this month</p>}
      </div>

      {/* Enhanced Form */}
      <FormSheet open={open} onOpenChange={setOpen} title={editId ? "Edit Income" : "Add Income"}>
        <WeekStrip selectedDate={selectedDate} onSelect={handleDateSelect} />

        <div>
          <p className="text-sm font-semibold mb-2">Income Title</p>
          <Input placeholder="e.g. Remote Job" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-12 bg-card border-border rounded-xl" />
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Amount</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
            <Input type="number" placeholder="0" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="h-12 bg-card border-border rounded-xl pl-8 text-lg font-semibold" />
          </div>
        </div>

        <CategoryPills
          items={sources}
          selected={form.source}
          onSelect={(name) => setForm({ ...form, source: name })}
          onAddNew={() => { setOpen(false); navigate("/profile"); }}
        />

        <Button onClick={handleSubmit} disabled={addIncome.isPending || updateIncome.isPending} className="w-full h-13 gradient-primary text-white font-semibold text-base rounded-2xl mt-2">
          {editId ? "Update" : "Add"} Income
        </Button>
      </FormSheet>
    </div>
  );
}
