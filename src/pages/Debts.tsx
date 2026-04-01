import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useDebts, DebtInput } from "@/hooks/useDebts";
import PageHeader from "@/components/PageHeader";
import FormSheet from "@/components/FormSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, ArrowUpRight, ArrowDownRight, CheckCircle2 } from "lucide-react";

export default function Debts() {
  const { data: debts, addDebt, updateDebt, deleteDebt } = useDebts();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<DebtInput>({ person_name: "", amount: 0, type: "given", note: "" });

  const totalGiven = useMemo(() => (debts || []).filter(d => d.type === "given" && d.status === "pending").reduce((s, d) => s + d.amount, 0), [debts]);
  const totalTaken = useMemo(() => (debts || []).filter(d => d.type === "taken" && d.status === "pending").reduce((s, d) => s + d.amount, 0), [debts]);

  const openAdd = () => { setEditId(null); setForm({ person_name: "", amount: 0, type: "given", note: "" }); setOpen(true); };
  const openEdit = (d: NonNullable<typeof debts>[number]) => {
    setEditId(d.id);
    setForm({ person_name: d.person_name, amount: d.amount, type: d.type as "given" | "taken", note: d.note || "", due_date: d.due_date || undefined, status: d.status as "pending" | "paid" });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.person_name || !form.amount) return;
    if (editId) updateDebt.mutate({ ...form, id: editId }, { onSuccess: () => setOpen(false) });
    else addDebt.mutate(form, { onSuccess: () => setOpen(false) });
  };

  const markPaid = (d: NonNullable<typeof debts>[number]) => updateDebt.mutate({ id: d.id, person_name: d.person_name, amount: d.amount, type: d.type as "given" | "taken", status: "paid" });

  return (
    <div className="px-4 pb-24 max-w-lg mx-auto">
      <PageHeader title="Debts" />

      <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
        <div className="gradient-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-1 mb-1"><ArrowUpRight className="w-4 h-4 text-warning" /><span className="text-xs text-muted-foreground">Given</span></div>
          <p className="text-lg font-bold font-display">₹{totalGiven.toLocaleString("en-IN")}</p>
        </div>
        <div className="gradient-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-1 mb-1"><ArrowDownRight className="w-4 h-4 text-info" /><span className="text-xs text-muted-foreground">Taken</span></div>
          <p className="text-lg font-bold font-display">₹{totalTaken.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="space-y-2">
        {(debts || []).map((d) => (
          <div key={d.id} className={`flex items-center justify-between bg-card rounded-xl p-3 border border-border animate-fade-in ${d.status === "paid" ? "opacity-50" : ""}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{d.person_name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${d.type === "given" ? "bg-warning/20 text-warning" : "bg-info/20 text-info"}`}>
                  {d.type}
                </span>
                {d.status === "paid" && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
              </div>
              {d.due_date && <p className="text-xs text-muted-foreground mt-0.5">Due: {format(new Date(d.due_date), "dd MMM yyyy")}</p>}
              {d.note && <p className="text-xs text-muted-foreground truncate">{d.note}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">₹{d.amount.toLocaleString("en-IN")}</span>
              {d.status === "pending" && <button onClick={() => markPaid(d)} className="p-1.5 text-muted-foreground hover:text-success"><CheckCircle2 className="w-3.5 h-3.5" /></button>}
              <button onClick={() => openEdit(d)} className="p-1.5 text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => deleteDebt.mutate(d.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {debts?.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No debts recorded</p>}
      </div>

      <button onClick={openAdd} className="fixed bottom-20 right-4 w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg z-40">
        <Plus className="w-6 h-6 text-primary-foreground" />
      </button>

      <FormSheet open={open} onOpenChange={setOpen} title={editId ? "Edit Debt" : "Add Debt"}>
        <Input placeholder="Person name" value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} className="h-12 bg-secondary" />
        <Input type="number" placeholder="Amount" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="h-12 bg-secondary" />
        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "given" | "taken" })}>
          <SelectTrigger className="h-12 bg-secondary"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="given">Given</SelectItem>
            <SelectItem value="taken">Taken</SelectItem>
          </SelectContent>
        </Select>
        {editId && (
          <Select value={form.status || "pending"} onValueChange={(v) => setForm({ ...form, status: v as "pending" | "paid" })}>
            <SelectTrigger className="h-12 bg-secondary"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Input type="date" placeholder="Due date" value={form.due_date || ""} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="h-12 bg-secondary" />
        <Input placeholder="Note (optional)" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-12 bg-secondary" />
        <Button onClick={handleSubmit} className="w-full h-12 gradient-primary text-primary-foreground font-semibold">
          {editId ? "Update" : "Add"} Debt
        </Button>
      </FormSheet>
    </div>
  );
}
