import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import { useDebts, DebtInput } from "@/hooks/useDebts";
import { useDebtContacts } from "@/hooks/useDebtContacts";
import PageHeader from "@/components/PageHeader";
import FormSheet from "@/components/FormSheet";
import WeekStrip from "@/components/WeekStrip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit2, ArrowUpRight, ArrowDownRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Debts() {
  const { data: debts, addDebt, updateDebt, deleteDebt } = useDebts();
  const { data: contacts } = useDebtContacts();

  const [open, setOpen] = useState(false);
  const location = useLocation();

  const openAdd = () => { setEditId(null); setForm({ person_name: "", amount: 0, type: "given", note: "" }); setSelectedDate(new Date()); setOpen(true); };

  useEffect(() => {
    if ((location.state as any)?.openForm) {
      setTimeout(() => openAdd(), 300);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<DebtInput>({ person_name: "", amount: 0, type: "given", note: "" });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const totalGiven = useMemo(() => (debts || []).filter(d => d.type === "given" && d.status === "pending").reduce((s, d) => s + d.amount, 0), [debts]);
  const totalTaken = useMemo(() => (debts || []).filter(d => d.type === "taken" && d.status === "pending").reduce((s, d) => s + d.amount, 0), [debts]);

  const openEdit = (d: NonNullable<typeof debts>[number]) => {
    setEditId(d.id);
    setForm({ person_name: d.person_name, amount: d.amount, type: d.type, note: d.note || "", status: d.status, due_date: d.due_date || undefined });
    if (d.due_date) setSelectedDate(new Date(d.due_date));
    setOpen(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setForm(f => ({ ...f, due_date: format(date, "yyyy-MM-dd") }));
  };

  const handleSubmit = () => {
    if (!form.person_name || !form.amount) { toast.error("Fill in all fields"); return; }
    if (editId) updateDebt.mutate({ ...form, id: editId }, { onSuccess: () => setOpen(false) });
    else addDebt.mutate(form, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="px-4 pb-28 max-w-lg mx-auto">
      <PageHeader title="Debts" />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mt-3 mb-4">
        <div className="gradient-card rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Given</span>
          </div>
          <p className="text-lg font-bold font-display">₹{totalGiven.toLocaleString("en-IN")}</p>
        </div>
        <div className="gradient-card rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="w-4 h-4 text-info" />
            <span className="text-xs text-muted-foreground">Taken</span>
          </div>
          <p className="text-lg font-bold font-display">₹{totalTaken.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {(debts || []).map((d) => (
          <div key={d.id} className={`flex items-center gap-3 bg-card rounded-xl p-3 card-shadow animate-fade-in ${d.status === "paid" ? "opacity-60" : ""}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${d.type === "given" ? "bg-warning/10" : "bg-info/10"}`}>
              {d.status === "paid" ? <CheckCircle2 className="w-5 h-5 text-success" /> : d.type === "given" ? <ArrowUpRight className="w-5 h-5 text-warning" /> : <ArrowDownRight className="w-5 h-5 text-info" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{d.person_name}</p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${d.type === "given" ? "bg-warning/10 text-warning" : "bg-info/10 text-info"}`}>{d.type}</span>
                {d.due_date && <span className="text-[10px] text-muted-foreground">{format(new Date(d.due_date), "dd MMM")}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm">₹{d.amount.toLocaleString("en-IN")}</span>
              <button onClick={() => openEdit(d)} className="p-1.5 text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => deleteDebt.mutate(d.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {debts?.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No debts recorded</p>}
      </div>

      {/* Enhanced Form */}
      <FormSheet open={open} onOpenChange={setOpen} title={editId ? "Edit Debt" : "Add Debt"}>
        <WeekStrip selectedDate={selectedDate} onSelect={handleDateSelect} />

        <div>
          <p className="text-sm font-semibold mb-2">Person Name</p>
          <Input placeholder="Who?" value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} className="h-12 bg-card border-border rounded-xl" list="contact-suggestions" />
          {contacts && contacts.length > 0 && (
            <datalist id="contact-suggestions">
              {contacts.map((c) => (<option key={c.id} value={c.name} />))}
            </datalist>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Amount</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
            <Input type="number" placeholder="0" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="h-12 bg-card border-border rounded-xl pl-8 text-lg font-semibold" />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Type</p>
          <div className="flex gap-2">
            {(["given", "taken"] as const).map((t) => (
              <button key={t} onClick={() => setForm({ ...form, type: t })}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border
                  ${form.type === t
                    ? t === "given" ? "bg-warning/10 border-warning text-warning" : "bg-info/10 border-info text-info"
                    : "bg-card border-border text-muted-foreground"
                  }`}
              >
                {t === "given" ? "↗ Given" : "↙ Taken"}
              </button>
            ))}
          </div>
        </div>

        {editId && (
          <div>
            <p className="text-sm font-semibold mb-2">Status</p>
            <div className="flex gap-2">
              {(["pending", "paid"] as const).map((s) => (
                <button key={s} onClick={() => setForm({ ...form, status: s })}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all border capitalize
                    ${(form.status || "pending") === s
                      ? s === "paid" ? "bg-success/10 border-success text-success" : "bg-secondary border-border text-foreground"
                      : "bg-card border-border text-muted-foreground"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <Input placeholder="Note (optional)" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-12 bg-card border-border rounded-xl" />

        <Button onClick={handleSubmit} disabled={addDebt.isPending || updateDebt.isPending} className="w-full h-13 gradient-primary text-white font-semibold text-base rounded-2xl mt-2">
          {editId ? "Update" : "Add"} Debt
        </Button>
      </FormSheet>
    </div>
  );
}
