import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLoans, LoanInput } from "@/hooks/useLoans";
import PageHeader from "@/components/PageHeader";
import FormSheet from "@/components/FormSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Landmark, CalendarClock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Loans() {
  const { data: loans, addLoan, updateLoan, deleteLoan } = useLoans();

  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if ((location.state as any)?.openForm) {
      setTimeout(() => openAdd(), 300);
      window.history.replaceState({}, "");
    }
  }, [location.state]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<LoanInput>({ loan_name: "", total_amount: 0, emi_amount: 0, tenure_months: 12, due_day: 1, remaining_balance: 0 });

  const totalEmi = useMemo(() => (loans || []).reduce((s, l) => s + l.emi_amount, 0), [loans]);

  const openAdd = () => { setEditId(null); setForm({ loan_name: "", total_amount: 0, emi_amount: 0, tenure_months: 12, due_day: 1, remaining_balance: 0 }); setOpen(true); };
  const openEdit = (l: NonNullable<typeof loans>[number]) => {
    setEditId(l.id);
    setForm({ loan_name: l.loan_name, total_amount: l.total_amount, emi_amount: l.emi_amount, tenure_months: l.tenure_months, due_day: l.due_day, remaining_balance: l.remaining_balance });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.loan_name || !form.total_amount) return;
    if (editId) updateLoan.mutate({ ...form, id: editId }, { onSuccess: () => setOpen(false) });
    else addLoan.mutate(form, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="px-4 pb-24 max-w-lg mx-auto">
      <PageHeader title="Loans & EMI" />

      <div className="gradient-card rounded-xl p-4 border border-border mt-4 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <CalendarClock className="w-4 h-4 text-accent" />
          <span className="text-xs text-muted-foreground">Monthly EMI Total</span>
        </div>
        <p className="text-2xl font-bold font-display text-gradient">₹{totalEmi.toLocaleString("en-IN")}</p>
      </div>

      <div className="space-y-3">
        {(loans || []).map((l) => {
          const paid = l.total_amount - l.remaining_balance;
          const pct = l.total_amount > 0 ? (paid / l.total_amount) * 100 : 0;
          return (
            <div key={l.id} className="bg-card rounded-xl p-4 border border-border animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-accent" />
                  <span className="font-medium text-sm">{l.loan_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(l)} className="p-1.5 text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteLoan.mutate(l.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                <div><span className="block">Total</span><span className="text-foreground font-medium">₹{l.total_amount.toLocaleString("en-IN")}</span></div>
                <div><span className="block">EMI</span><span className="text-foreground font-medium">₹{l.emi_amount.toLocaleString("en-IN")}</span></div>
                <div><span className="block">Due Day</span><span className="text-foreground font-medium">{l.due_day}</span></div>
              </div>
              <Progress value={pct} className="h-1.5" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Paid: ₹{paid.toLocaleString("en-IN")}</span>
                <span>Remaining: ₹{l.remaining_balance.toLocaleString("en-IN")}</span>
              </div>
            </div>
          );
        })}
        {loans?.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No loans added</p>}
      </div>



      <FormSheet open={open} onOpenChange={setOpen} title={editId ? "Edit Loan" : "Add Loan"}>
        <Input placeholder="Loan name" value={form.loan_name} onChange={(e) => setForm({ ...form, loan_name: e.target.value })} className="h-12 bg-secondary" />
        <Input type="number" placeholder="Total amount" value={form.total_amount || ""} onChange={(e) => setForm({ ...form, total_amount: Number(e.target.value) })} className="h-12 bg-secondary" />
        <Input type="number" placeholder="EMI amount" value={form.emi_amount || ""} onChange={(e) => setForm({ ...form, emi_amount: Number(e.target.value) })} className="h-12 bg-secondary" />
        <Input type="number" placeholder="Tenure (months)" value={form.tenure_months || ""} onChange={(e) => setForm({ ...form, tenure_months: Number(e.target.value) })} className="h-12 bg-secondary" />
        <Input type="number" placeholder="Due day (1-31)" value={form.due_day || ""} onChange={(e) => setForm({ ...form, due_day: Number(e.target.value) })} min={1} max={31} className="h-12 bg-secondary" />
        <Input type="number" placeholder="Remaining balance" value={form.remaining_balance || ""} onChange={(e) => setForm({ ...form, remaining_balance: Number(e.target.value) })} className="h-12 bg-secondary" />
        <Button onClick={handleSubmit} className="w-full h-12 gradient-primary text-primary-foreground font-semibold">
          {editId ? "Update" : "Add"} Loan
        </Button>
      </FormSheet>
    </div>
  );
}
