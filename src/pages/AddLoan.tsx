import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoans, LoanInput } from "@/hooks/useLoans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AddLoan() {
  const navigate = useNavigate();
  const { addLoan } = useLoans();

  const [form, setForm] = useState<LoanInput>({
    loan_name: "", total_amount: 0, emi_amount: 0, tenure_months: 12, due_day: 1, remaining_balance: 0,
  });

  const handleSubmit = () => {
    if (!form.loan_name || !form.total_amount) { toast.error("Fill in required fields"); return; }
    addLoan.mutate(form, {
      onSuccess: () => {
        toast.success("Loan added!");
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
        <h1 className="text-lg font-bold font-display">Add Loan</h1>
      </div>

      <div className="space-y-5 animate-fade-in">
        <div>
          <p className="text-sm font-semibold mb-2">Loan Name</p>
          <Input placeholder="e.g. Home Loan, Car Loan" value={form.loan_name} onChange={(e) => setForm({ ...form, loan_name: e.target.value })} className="h-12 bg-card border-border rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-semibold mb-2">Total Amount</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
              <Input type="number" placeholder="0" value={form.total_amount || ""} onChange={(e) => setForm({ ...form, total_amount: Number(e.target.value) })} className="h-12 bg-card border-border rounded-xl pl-7" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">EMI Amount</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
              <Input type="number" placeholder="0" value={form.emi_amount || ""} onChange={(e) => setForm({ ...form, emi_amount: Number(e.target.value) })} className="h-12 bg-card border-border rounded-xl pl-7" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-semibold mb-2">Tenure (months)</p>
            <Input type="number" placeholder="12" value={form.tenure_months || ""} onChange={(e) => setForm({ ...form, tenure_months: Number(e.target.value) })} className="h-12 bg-card border-border rounded-xl" />
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Due Day</p>
            <Input type="number" placeholder="1-31" value={form.due_day || ""} onChange={(e) => setForm({ ...form, due_day: Number(e.target.value) })} min={1} max={31} className="h-12 bg-card border-border rounded-xl" />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Remaining Balance</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">₹</span>
            <Input type="number" placeholder="0" value={form.remaining_balance || ""} onChange={(e) => setForm({ ...form, remaining_balance: Number(e.target.value) })} className="h-14 bg-card border-border rounded-xl pl-9 text-2xl font-bold" />
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={addLoan.isPending} className="w-full h-14 gradient-primary text-white font-semibold text-base rounded-2xl mt-4">
          {addLoan.isPending ? "Adding..." : "Add Loan"}
        </Button>
      </div>
    </div>
  );
}
