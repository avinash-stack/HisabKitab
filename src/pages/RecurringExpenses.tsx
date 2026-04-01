import { useState } from "react";
import { useRecurringExpenses, RecurringExpenseInput } from "@/hooks/useRecurringExpenses";
import PageHeader from "@/components/PageHeader";
import FormSheet from "@/components/FormSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit2, CalendarClock } from "lucide-react";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"];

export default function RecurringExpenses() {
  const { data: items, addRecurring, updateRecurring, toggleActive, deleteRecurring } = useRecurringExpenses();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<RecurringExpenseInput>({ amount: 0, category: "Bills", note: "", day_of_month: 1 });

  const openAdd = () => {
    setEditId(null);
    setForm({ amount: 0, category: "Bills", note: "", day_of_month: 1 });
    setOpen(true);
  };

  const openEdit = (item: NonNullable<typeof items>[number]) => {
    setEditId(item.id);
    setForm({ amount: item.amount, category: item.category, note: item.note || "", day_of_month: item.day_of_month });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.amount || !form.day_of_month) return;
    if (editId) {
      updateRecurring.mutate({ ...form, id: editId }, { onSuccess: () => setOpen(false) });
    } else {
      addRecurring.mutate(form, { onSuccess: () => setOpen(false) });
    }
  };

  const totalMonthly = (items || []).filter(i => i.is_active).reduce((s, i) => s + i.amount, 0);

  const ordinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="px-4 pb-24 max-w-lg mx-auto">
      <PageHeader title="Recurring" subtitle="Auto-tracked monthly bills" />

      {/* Monthly total */}
      <div className="gradient-card rounded-xl p-4 border border-border mb-4 mt-3">
        <p className="text-xs text-muted-foreground">Monthly recurring total</p>
        <p className="text-2xl font-bold font-display text-gradient">₹{totalMonthly.toLocaleString("en-IN")}</p>
        <p className="text-xs text-muted-foreground mt-1">{(items || []).filter(i => i.is_active).length} active bills</p>
      </div>

      {/* List */}
      <div className="space-y-2">
        {(items || []).map((item) => (
          <div key={item.id} className={`flex items-center justify-between bg-card rounded-xl p-3 border border-border animate-fade-in ${!item.is_active ? "opacity-50" : ""}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{item.category}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  {ordinalSuffix(item.day_of_month)} of month
                </span>
              </div>
              {item.note && <p className="text-xs text-muted-foreground mt-1 truncate">{item.note}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">₹{item.amount.toLocaleString("en-IN")}</span>
              <Switch
                checked={item.is_active}
                onCheckedChange={(checked) => toggleActive.mutate({ id: item.id, is_active: checked })}
                className="scale-75"
              />
              <button onClick={() => openEdit(item)} className="p-1.5 text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => deleteRecurring.mutate(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {items?.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No recurring expenses yet</p>}
      </div>

      {/* FAB */}
      <button onClick={openAdd} className="fixed bottom-20 right-4 w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg z-40">
        <Plus className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Form */}
      <FormSheet open={open} onOpenChange={setOpen} title={editId ? "Edit Recurring" : "Add Recurring Expense"}>
        <Input type="number" placeholder="Amount" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="h-12 bg-secondary" />
        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
          <SelectTrigger className="h-12 bg-secondary"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input placeholder="Note (e.g. Netflix, Electricity)" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-12 bg-secondary" />
        <Input type="number" min={1} max={28} placeholder="Day of month (1-28)" value={form.day_of_month || ""} onChange={(e) => setForm({ ...form, day_of_month: Math.min(28, Math.max(1, Number(e.target.value))) })} className="h-12 bg-secondary" />
        <p className="text-xs text-muted-foreground">Expense will be auto-created on this day each month</p>
        <Button onClick={handleSubmit} className="w-full h-12 gradient-primary text-primary-foreground font-semibold">
          {editId ? "Update" : "Add"} Recurring Expense
        </Button>
      </FormSheet>
    </div>
  );
}
