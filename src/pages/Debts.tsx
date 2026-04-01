import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import { useDebts, DebtInput, Debt } from "@/hooks/useDebts";
import { useDebtContacts } from "@/hooks/useDebtContacts";
import PageHeader from "@/components/PageHeader";
import FormSheet from "@/components/FormSheet";
import WeekStrip from "@/components/WeekStrip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2, Edit2, ArrowUpRight, ArrowDownRight, CheckCircle2,
  ChevronLeft, Plus, ArrowLeft, Search, User, FileText
} from "lucide-react";
import { toast } from "sonner";
import { exportDebtLedgerPDF } from "@/lib/pdfExport";

type PersonSummary = {
  name: string;
  given: number;
  taken: number;
  net: number;
  pending: number;
  totalEntries: number;
  lastDate: string | null;
};

export default function Debts() {
  const { data: debts, addDebt, updateDebt, deleteDebt } = useDebts();
  const { data: contacts } = useDebtContacts();

  const [open, setOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const openAdd = (personName?: string) => {
    setEditId(null);
    setForm({ person_name: personName || "", amount: 0, type: "given", note: "" });
    setSelectedDate(new Date());
    setOpen(true);
  };

  useEffect(() => {
    if ((location.state as any)?.openForm) {
      setTimeout(() => openAdd(), 300);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<DebtInput>({ person_name: "", amount: 0, type: "given", note: "" });
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Group debts by person
  const personSummaries = useMemo((): PersonSummary[] => {
    const map: Record<string, { given: number; taken: number; pending: number; entries: number; lastDate: string | null }> = {};

    (debts || []).forEach(d => {
      if (!map[d.person_name]) {
        map[d.person_name] = { given: 0, taken: 0, pending: 0, entries: 0, lastDate: null };
      }
      const p = map[d.person_name];
      p.entries++;
      if (d.status === "pending") {
        if (d.type === "given") p.given += d.amount;
        else p.taken += d.amount;
        p.pending++;
      }
      if (!p.lastDate || d.created_at > p.lastDate) p.lastDate = d.created_at;
    });

    return Object.entries(map)
      .map(([name, v]) => ({
        name,
        given: v.given,
        taken: v.taken,
        net: v.given - v.taken,
        pending: v.pending,
        totalEntries: v.entries,
        lastDate: v.lastDate,
      }))
      .sort((a, b) => (b.lastDate || "").localeCompare(a.lastDate || ""));
  }, [debts]);

  const filteredPersons = useMemo(() => {
    if (!searchQuery) return personSummaries;
    const q = searchQuery.toLowerCase();
    return personSummaries.filter(p => p.name.toLowerCase().includes(q));
  }, [personSummaries, searchQuery]);

  // Get entries for selected person
  const personEntries = useMemo(() => {
    if (!selectedPerson) return [];
    return (debts || []).filter(d => d.person_name === selectedPerson)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [debts, selectedPerson]);

  const personSummary = useMemo(() => {
    return personSummaries.find(p => p.name === selectedPerson);
  }, [personSummaries, selectedPerson]);

  // Total stats
  const totalGiven = useMemo(() => personSummaries.reduce((s, p) => s + p.given, 0), [personSummaries]);
  const totalTaken = useMemo(() => personSummaries.reduce((s, p) => s + p.taken, 0), [personSummaries]);

  const openEdit = (d: Debt) => {
    setEditId(d.id);
    setForm({ person_name: d.person_name, amount: d.amount, type: d.type, note: d.note || "", status: d.status, due_date: d.due_date || undefined });
    if (d.due_date) setSelectedDate(new Date(d.due_date));
    else setSelectedDate(new Date());
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

  // Calculate running balance for a person's entries
  const getRunningBalance = (entries: Debt[]): (Debt & { runningBalance: number })[] => {
    const sorted = [...entries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    let balance = 0;
    const withBalance = sorted.map(e => {
      if (e.status === "paid") {
        return { ...e, runningBalance: balance };
      }
      if (e.type === "given") balance += e.amount;
      else balance -= e.amount;
      return { ...e, runningBalance: balance };
    });
    return withBalance.reverse();
  };

  const entriesWithBalance = useMemo(() => getRunningBalance(personEntries), [personEntries]);

  // =============================================
  // PERSON LEDGER VIEW
  // =============================================
  if (selectedPerson) {
    return (
      <div className="px-4 pb-28 max-w-lg mx-auto">
        {/* Back Header */}
        <div className="flex items-center gap-3 pt-4 pb-3">
          <button onClick={() => setSelectedPerson(null)} className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold font-display">{selectedPerson}</h1>
            <p className="text-xs text-muted-foreground">{personEntries.length} entries</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!personEntries.length) { toast.info("No entries to export"); return; }
                exportDebtLedgerPDF(selectedPerson, personEntries, { given: personSummary?.given || 0, taken: personSummary?.taken || 0, net: personSummary?.net || 0 });
                toast.success("Ledger PDF downloaded");
              }}
              className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-primary transition-colors"
              title="Export ledger PDF"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button
              onClick={() => openAdd(selectedPerson)}
              className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Net Balance Card */}
        <div className={`rounded-2xl p-5 text-white relative overflow-hidden mt-1 animate-fade-in ${
          (personSummary?.net || 0) >= 0 ? "gradient-hero" : "bg-gradient-to-br from-orange-500 to-red-500"
        }`}>
          <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10">
            <p className="text-sm text-white/80 mb-1">
              {(personSummary?.net || 0) >= 0 ? "They owe you" : "You owe them"}
            </p>
            <p className="text-3xl font-bold font-display">
              ₹{Math.abs(personSummary?.net || 0).toLocaleString("en-IN")}
            </p>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-white/70" />
                <span className="text-xs text-white/70">Given:</span>
                <span className="text-xs font-semibold">₹{(personSummary?.given || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowDownRight className="w-3.5 h-3.5 text-white/70" />
                <span className="text-xs text-white/70">Taken:</span>
                <span className="text-xs font-semibold">₹{(personSummary?.taken || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Timeline */}
        <div className="mt-5">
          <h2 className="text-sm font-bold font-display mb-3">Ledger</h2>
          <div className="space-y-0">
            {entriesWithBalance.map((d, idx) => (
              <div key={d.id} className="flex gap-3 animate-fade-in">
                {/* Timeline Line */}
                <div className="flex flex-col items-center w-8 shrink-0">
                  <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                    d.status === "paid"
                      ? "bg-success border-success"
                      : d.type === "given"
                        ? "bg-warning border-warning"
                        : "bg-info border-info"
                  }`} />
                  {idx < entriesWithBalance.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                </div>

                {/* Entry Card */}
                <div className={`flex-1 bg-card rounded-xl p-3 card-shadow mb-2 ${d.status === "paid" ? "opacity-60" : ""}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                        d.status === "paid"
                          ? "bg-success/10 text-success"
                          : d.type === "given"
                            ? "bg-warning/10 text-warning"
                            : "bg-info/10 text-info"
                      }`}>
                        {d.status === "paid" ? "✓ Settled" : d.type === "given" ? "↗ Given" : "↙ Taken"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(d.created_at), "dd MMM yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => openEdit(d)} className="p-1 text-muted-foreground hover:text-foreground"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => deleteDebt.mutate(d.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {d.note && <p className="text-xs text-muted-foreground truncate">{d.note}</p>}
                      {d.due_date && <p className="text-[10px] text-muted-foreground">Due: {format(new Date(d.due_date), "dd MMM yyyy")}</p>}
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${d.type === "given" ? "text-warning" : "text-info"}`}>
                        {d.type === "given" ? "+" : "-"}₹{d.amount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Bal: <span className={d.runningBalance >= 0 ? "text-success" : "text-accent"}>
                          ₹{Math.abs(d.runningBalance).toLocaleString("en-IN")}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {personEntries.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground">No entries yet</p>
              <button onClick={() => openAdd(selectedPerson)} className="mt-2 text-sm text-primary font-medium">
                + Add first entry
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <FormSheet open={open} onOpenChange={setOpen} title={editId ? "Edit Entry" : "Add Entry"}>
          <WeekStrip selectedDate={selectedDate} onSelect={handleDateSelect} />
          <div>
            <p className="text-sm font-semibold mb-2">Person</p>
            <Input value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} className="h-12 bg-card border-border rounded-xl" list="contact-suggestions" />
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
                    {s === "paid" ? "✓ Settled" : "Pending"}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Input placeholder="Note (optional)" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-12 bg-card border-border rounded-xl" />
          <Button onClick={handleSubmit} disabled={addDebt.isPending || updateDebt.isPending} className="w-full h-13 gradient-primary text-white font-semibold text-base rounded-2xl mt-2">
            {editId ? "Update" : "Add"} Entry
          </Button>
        </FormSheet>
      </div>
    );
  }

  // =============================================
  // PERSONS LIST VIEW (Main Page)
  // =============================================
  return (
    <div className="px-4 pb-28 max-w-lg mx-auto">
      <PageHeader title="Debts" />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mt-3 mb-4">
        <div className="gradient-card rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">You gave</span>
          </div>
          <p className="text-lg font-bold font-display">₹{totalGiven.toLocaleString("en-IN")}</p>
        </div>
        <div className="gradient-card rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="w-4 h-4 text-info" />
            <span className="text-xs text-muted-foreground">You took</span>
          </div>
          <p className="text-lg font-bold font-display">₹{totalTaken.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Search */}
      {personSummaries.length > 3 && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 bg-card border-border rounded-xl pl-10"
          />
        </div>
      )}

      {/* Persons List */}
      <div className="space-y-2">
        {filteredPersons.map((p) => (
          <button
            key={p.name}
            onClick={() => setSelectedPerson(p.name)}
            className="w-full flex items-center gap-3 bg-card rounded-xl p-4 card-shadow animate-fade-in
                       hover:bg-secondary/50 active:scale-[0.98] transition-all text-left"
          >
            {/* Avatar */}
            <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-sm text-white ${
              p.net >= 0 ? "gradient-primary" : "bg-gradient-to-br from-orange-500 to-red-500"
            }`}>
              {p.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{p.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{p.totalEntries} entries</span>
                {p.pending > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">{p.pending} pending</span>
                )}
              </div>
            </div>

            {/* Net Balance */}
            <div className="text-right shrink-0">
              <p className={`text-sm font-bold ${p.net >= 0 ? "text-success" : "text-accent"}`}>
                {p.net >= 0 ? "+" : "-"}₹{Math.abs(p.net).toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {p.net >= 0 ? "to receive" : "to pay"}
              </p>
            </div>
          </button>
        ))}

        {personSummaries.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
              <User className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No debts recorded</p>
            <p className="text-xs text-muted-foreground mt-1">Tap + to add your first entry</p>
          </div>
        )}
      </div>

      {/* Add Form (from persons list) */}
      <FormSheet open={open} onOpenChange={setOpen} title={editId ? "Edit Entry" : "Add Entry"}>
        <WeekStrip selectedDate={selectedDate} onSelect={handleDateSelect} />
        <div>
          <p className="text-sm font-semibold mb-2">Person Name</p>
          <Input placeholder="Who?" value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} className="h-12 bg-card border-border rounded-xl" list="contact-suggestions-main" />
          {contacts && contacts.length > 0 && (
            <datalist id="contact-suggestions-main">
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
        <Input placeholder="Note (optional)" value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-12 bg-card border-border rounded-xl" />
        <Button onClick={handleSubmit} disabled={addDebt.isPending} className="w-full h-13 gradient-primary text-white font-semibold text-base rounded-2xl mt-2">
          Add Entry
        </Button>
      </FormSheet>
    </div>
  );
}
