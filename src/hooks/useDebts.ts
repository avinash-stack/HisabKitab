import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { encryptData, decryptData, importKey } from "@/lib/crypto";

export type Debt = {
  id: string;
  person_name: string;
  amount: number;
  type: "given" | "taken";
  due_date: string | null;
  status: "pending" | "paid";
  note: string | null;
  user_id: string;
  created_at: string;
};

export type DebtInput = {
  person_name: string;
  amount: number;
  type: "given" | "taken";
  due_date?: string;
  status?: "pending" | "paid";
  note?: string;
};

// Helper: Get key from storage
async function getMasterKey() {
  const rawKey = localStorage.getItem("e2e_master_key");
  if (!rawKey) throw new Error("Encryption key not found. Please run the migration or set up your key.");
  return await importKey(rawKey);
}

export function useDebts() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["debts"],
    enabled: !!user,
    queryFn: async () => {
      // 1. Fetch EVERYTHING
      const { data, error } = await supabase.from("debts").select("*");
      if (error) throw error;

      const key = await getMasterKey();

      // 2. Decrypt locally
      const decryptedData: Debt[] = [];
      for (const d of (data as any[]) || []) {
        if (d.encrypted_payload) {
          const payload = await decryptData(d.encrypted_payload, key);
          decryptedData.push({
            id: d.id,
            user_id: d.user_id,
            created_at: d.created_at,
            amount: Number(payload.amount),
            person_name: payload.person_name,
            type: payload.type,
            due_date: payload.due_date || null,
            status: payload.status,
            note: payload.note || null
          } as Debt);
        } else {
          // Fallback support during dev/testing
          decryptedData.push({ ...d, amount: Number(d.amount) } as Debt);
        }
      }

      // 3. Client-side Sorting
      decryptedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return decryptedData;
    },
  });

  const addDebt = useMutation({
    mutationFn: async (input: DebtInput) => {
      const key = await getMasterKey();
      const payload = await encryptData(input, key);
      const { error } = await supabase.from("debts").insert({ 
        user_id: user!.id,
        encrypted_payload: payload 
      } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["debts"] }); toast.success("Debt added"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateDebt = useMutation({
    mutationFn: async ({ id, ...input }: DebtInput & { id: string }) => {
      const key = await getMasterKey();
      const payload = await encryptData(input, key);
      const { error } = await supabase.from("debts").update({
        encrypted_payload: payload
      } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["debts"] }); toast.success("Debt updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteDebt = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("debts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["debts"] }); toast.success("Debt deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, addDebt, updateDebt, deleteDebt };
}
