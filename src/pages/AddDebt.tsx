import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useDebts, DebtInput } from "@/hooks/useDebts";
import { useDebtContacts } from "@/hooks/useDebtContacts";
import WeekStrip from "@/components/WeekStrip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AddDebt() {
  const navigate = useNavigate();
  const { addDebt } = useDebts();
  const { data: contacts } = useDebtContacts();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [form, setForm] = useState<DebtInput>({
    person_name: "", amount: 0, type: "given", note: "",
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setForm(f => ({ ...f, due_date: format(date, "yyyy-MM-dd") }));
  };

  const handleSubmit = () => {
    if (!form.person_name || !form.amount) { toast.error("Fill in all fields"); return; }
    addDebt.mutate(form, {
      onSuccess: () => {
        toast.success("Debt entry added!");
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
        <h1 className="text-lg font-bold font-display">Add Debt</h1>
      </div>

      <div className="space-y-5 animate-fade-in">
        <WeekStrip selectedDate={selectedDate} onSelect={handleDateSelect} />

        <div>
          <p className="text-sm font-semibold mb-2">Person Name</p>
          <Input placeholder="Who?" value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} className="h-12 bg-card border-border rounded-xl" list="add-debt-contacts" />
          {contacts && contacts.length > 0 && (
            <datalist id="add-debt-contacts">
              {contacts.map((c) => (<option key={c.id} value={c.name} />))}
            </datalist>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Amount</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">₹</span>
            <Input type="number" placeholder="0" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="h-14 bg-card border-border rounded-xl pl-9 text-2xl font-bold" />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Type</p>
          <div className="flex gap-3">
            {(["given", "taken"] as const).map((t) => (
              <button key={t} onClick={() => setForm({ ...form, type: t })}
                className={`flex-1 py-4 rounded-2xl text-sm font-bold transition-all duration-200 border-2
                  ${form.type === t
                    ? t === "given"
                      ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-400 text-amber-700"
                      : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400 text-blue-700"
                    : "bg-card border-border text-muted-foreground"
                  }`}
              >
                {t === "given" ? "↗ Given (Lent)" : "↙ Taken (Borrowed)"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Note (optional)</p>
          <Input placeholder="What was it for?" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-12 bg-card border-border rounded-xl" />
        </div>

        <Button onClick={handleSubmit} disabled={addDebt.isPending} className="w-full h-14 gradient-primary text-white font-semibold text-base rounded-2xl mt-4">
          {addDebt.isPending ? "Adding..." : "Add Debt Entry"}
        </Button>
      </div>
    </div>
  );
}
