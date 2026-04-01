import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { format, subMonths, addMonths } from "date-fns";
import { useExpenses, ExpenseInput } from "@/hooks/useExpenses";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import PageHeader from "@/components/PageHeader";
import FormSheet from "@/components/FormSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ChevronLeft, ChevronRight, Trash2, Edit2, Download } from "lucide-react";
import { toast } from "sonner";

export default function Expenses() {
  const [month, setMonth] = useState(new Date());
  const monthStr = format(month, "yyyy-MM");
  const { data: expenses, addExpense, updateExpense, deleteExpense } = useExpenses(monthStr);
  const { categories } = useExpenseCategories();
  const categoryNames = categories.map(c => c.name);

  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if ((location.state as any)?.openForm) {
      setTimeout(() => openAdd(), 300);
      window.history.replaceState({}, "");
    }
  }, [location.state]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseInput>({ amount: 0, category: "", note: "", expense_date: format(new Date(), "yyyy-MM-dd") });

  const openAdd = () => {
    setEditId(null);
    setForm({ amount: 0, category: categoryNames[0] || "Other", note: "", expense_date: format(new Date(), "yyyy-MM-dd") });
    setOpen(true);
  };

  const openEdit = (e: typeof expenses extends (infer T)[] ? T : never) => {
    setEditId(e.id);
    setForm({ amount: e.amount, category: e.category, note: e.note || "", expense_date: e.expense_date });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.amount) return;
    if (editId) {
      updateExpense.mutate({ ...form, id: editId }, { onSuccess: () => setOpen(false) });
    } else {
      addExpense.mutate(form, { onSuccess: () => setOpen(false) });
    }
  };

  const total = (expenses || []).reduce((s, e) => s + e.amount, 0);

  const exportCSV = () => {
    if (!expenses?.length) { toast.info("No expenses to export"); return; }
    const header = "Date,Category,Amount,Note";
    const rows = expenses.map(e => `${e.expense_date},${e.category},${e.amount},"${(e.note || "").replace(/"/g, '""')}"`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${monthStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  return (
    <div className="px-4 pb-24 max-w-lg mx-auto">
      <PageHeader title="Expenses" action={<button onClick={exportCSV} className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground"><Download className="w-4 h-4" /></button>} />

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
        <p className="text-xs text-muted-foreground">Total this month</p>
        <p className="text-2xl font-bold font-display text-gradient">₹{total.toLocaleString("en-IN")}</p>
      </div>

      {/* List */}
      <div className="space-y-2">
        {(expenses || []).map((e) => (
          <div key={e.id} className="flex items-center justify-between bg-card rounded-xl p-3 border border-border animate-fade-in">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{e.category}</span>
                <span className="text-xs text-muted-foreground">{format(new Date(e.expense_date), "dd MMM")}</span>
              </div>
              {e.note && <p className="text-xs text-muted-foreground mt-1 truncate">{e.note}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">₹{e.amount.toLocaleString("en-IN")}</span>
              <button onClick={() => openEdit(e)} className="p-1.5 text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => deleteExpense.mutate(e.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {expenses?.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No expenses this month</p>}
      </div>




      {/* Form */}
      <FormSheet open={open} onOpenChange={setOpen} title={editId ? "Edit Expense" : "Add Expense"}>
        <Input type="number" placeholder="Amount" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="h-12 bg-secondary" />
        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
          <SelectTrigger className="h-12 bg-secondary"><SelectValue /></SelectTrigger>
          <SelectContent>
            {categoryNames.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input placeholder="Note (optional)" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-12 bg-secondary" />
        <Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="h-12 bg-secondary" />
        <Button onClick={handleSubmit} className="w-full h-12 gradient-primary text-primary-foreground font-semibold">
          {editId ? "Update" : "Add"} Expense
        </Button>
      </FormSheet>
    </div>
  );
}
