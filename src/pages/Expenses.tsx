import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, subMonths, addMonths } from "date-fns";
import { useExpenses, ExpenseInput } from "@/hooks/useExpenses";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import PageHeader from "@/components/PageHeader";
import FormSheet from "@/components/FormSheet";
import WeekStrip from "@/components/WeekStrip";
import CategoryPills from "@/components/CategoryPills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Trash2, Edit2, Download } from "lucide-react";
import { toast } from "sonner";

export default function Expenses() {
  const navigate = useNavigate();
  const [month, setMonth] = useState(new Date());
  const monthStr = format(month, "yyyy-MM");
  const { data: expenses, addExpense, updateExpense, deleteExpense } = useExpenses(monthStr);
  const { categories } = useExpenseCategories();

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
  const [selectedDate, setSelectedDate] = useState(new Date());

  const openAdd = () => {
    setEditId(null);
    const cat = categories[0]?.name || "Other";
    setForm({ amount: 0, category: cat, note: "", expense_date: format(new Date(), "yyyy-MM-dd") });
    setSelectedDate(new Date());
    setOpen(true);
  };

  const openEdit = (e: NonNullable<typeof expenses>[number]) => {
    setEditId(e.id);
    setForm({ amount: e.amount, category: e.category, note: e.note || "", expense_date: e.expense_date });
    setSelectedDate(new Date(e.expense_date));
    setOpen(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setForm(f => ({ ...f, expense_date: format(date, "yyyy-MM-dd") }));
  };

  const handleSubmit = () => {
    if (!form.amount) { toast.error("Enter an amount"); return; }
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

  const CATEGORY_ICONS: Record<string, string> = {
    Food: "🍔", Transport: "🚗", Shopping: "🛍️", Bills: "📄",
    Entertainment: "🎬", Health: "💊", Education: "📚", Other: "📦",
  };

  return (
    <div className="px-4 pb-28 max-w-lg mx-auto">
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
      <div className="gradient-card rounded-xl p-4 card-shadow mb-4">
        <p className="text-xs text-muted-foreground">Total this month</p>
        <p className="text-2xl font-bold font-display text-gradient">₹{total.toLocaleString("en-IN")}</p>
      </div>

      {/* List */}
      <div className="space-y-2">
        {(expenses || []).map((e) => (
          <div key={e.id} className="flex items-center gap-3 bg-card rounded-xl p-3 card-shadow animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-base shrink-0">
              {CATEGORY_ICONS[e.category] || "📦"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{e.note || e.category}</p>
              <p className="text-[11px] text-muted-foreground">{format(new Date(e.expense_date), "dd MMM yyyy")}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-accent">-₹{e.amount.toLocaleString("en-IN")}</span>
              <button onClick={() => openEdit(e)} className="p-1.5 text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => deleteExpense.mutate(e.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {expenses?.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No expenses this month</p>}
      </div>

      {/* Enhanced Form */}
      <FormSheet open={open} onOpenChange={setOpen} title={editId ? "Edit Expense" : "Add Expense"}>
        <WeekStrip selectedDate={selectedDate} onSelect={handleDateSelect} />

        <div>
          <p className="text-sm font-semibold mb-2">Note</p>
          <Input placeholder="What was this expense for?" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-12 bg-card border-border rounded-xl" />
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Amount</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
            <Input type="number" placeholder="0" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="h-12 bg-card border-border rounded-xl pl-8 text-lg font-semibold" />
          </div>
        </div>

        <CategoryPills
          items={categories}
          selected={form.category}
          onSelect={(name) => setForm({ ...form, category: name })}
          onAddNew={() => { setOpen(false); navigate("/profile"); }}
        />

        <Button onClick={handleSubmit} disabled={addExpense.isPending || updateExpense.isPending} className="w-full h-13 gradient-primary text-white font-semibold text-base rounded-2xl mt-2">
          {editId ? "Update" : "Add"} Expense
        </Button>
      </FormSheet>
    </div>
  );
}
