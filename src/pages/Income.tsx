import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { format, subMonths, addMonths } from "date-fns";
import { useIncomes, IncomeInput } from "@/hooks/useIncomes";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import PageHeader from "@/components/PageHeader";
import FormSheet from "@/components/FormSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ChevronLeft, ChevronRight, Trash2, Edit2 } from "lucide-react";

export default function Income() {
  const [month, setMonth] = useState(new Date());
  const monthStr = format(month, "yyyy-MM");
  const { data: incomes, addIncome, updateIncome, deleteIncome } = useIncomes(monthStr);
  const { sources } = useIncomeSources();
  const sourceNames = sources.map(s => s.name);

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

  const openAdd = () => {
    setEditId(null);
    setForm({ amount: 0, source: sourceNames[0] || "Other", note: "", income_date: format(new Date(), "yyyy-MM-dd") });
    setOpen(true);
  };

  const openEdit = (i: NonNullable<typeof incomes>[number]) => {
    setEditId(i.id);
    setForm({ amount: i.amount, source: i.source, note: i.note || "", income_date: i.income_date });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.amount) return;
    if (editId) {
      updateIncome.mutate({ ...form, id: editId }, { onSuccess: () => setOpen(false) });
    } else {
      addIncome.mutate(form, { onSuccess: () => setOpen(false) });
    }
  };

  const total = (incomes || []).reduce((s, i) => s + i.amount, 0);

  return (
    <div className="px-4 pb-24 max-w-lg mx-auto">
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
      <div className="gradient-card rounded-xl p-4 border border-border mb-4">
        <p className="text-xs text-muted-foreground">Total income this month</p>
        <p className="text-2xl font-bold font-display text-gradient">₹{total.toLocaleString("en-IN")}</p>
      </div>

      {/* List */}
      <div className="space-y-2">
        {(incomes || []).map((i) => (
          <div key={i.id} className="flex items-center justify-between bg-card rounded-xl p-3 border border-border animate-fade-in">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{i.source}</span>
                <span className="text-xs text-muted-foreground">{format(new Date(i.income_date), "dd MMM")}</span>
              </div>
              {i.note && <p className="text-xs text-muted-foreground mt-1 truncate">{i.note}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-primary">+₹{i.amount.toLocaleString("en-IN")}</span>
              <button onClick={() => openEdit(i)} className="p-1.5 text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => deleteIncome.mutate(i.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {incomes?.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No income this month</p>}
      </div>



      {/* Form */}
      <FormSheet open={open} onOpenChange={setOpen} title={editId ? "Edit Income" : "Add Income"}>
        <Input type="number" placeholder="Amount" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="h-12 bg-secondary" />
        <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
          <SelectTrigger className="h-12 bg-secondary"><SelectValue /></SelectTrigger>
          <SelectContent>
            {sourceNames.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input placeholder="Note (optional)" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-12 bg-secondary" />
        <Input type="date" value={form.income_date} onChange={(e) => setForm({ ...form, income_date: e.target.value })} className="h-12 bg-secondary" />
        <Button onClick={handleSubmit} className="w-full h-12 gradient-primary text-primary-foreground font-semibold">
          {editId ? "Update" : "Add"} Income
        </Button>
      </FormSheet>
    </div>
  );
}
