import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { encryptData, decryptData, getMasterKey } from "@/lib/crypto";

export type DebtContact = {
  id: string;
  name: string;
  phone: string | null;
  user_id: string;
};

export function useDebtContacts() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["debt_contacts"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("debt_contacts")
        .select("*");
      if (error) throw error;
      
      const key = await getMasterKey();
      
      const decryptedData: DebtContact[] = [];
      for (const c of (data as any[]) || []) {
        if (c.encrypted_payload) {
          const payload = await decryptData(c.encrypted_payload, key);
          decryptedData.push({
            id: c.id,
            user_id: c.user_id,
            name: payload.name,
            phone: payload.phone || null,
          } as DebtContact);
        } else {
          decryptedData.push({ ...c } as DebtContact);
        }
      }
      
      decryptedData.sort((a, b) => a.name.localeCompare(b.name));
      return decryptedData;
    },
  });

  const addContact = useMutation({
    mutationFn: async (input: { name: string; phone?: string }) => {
      const key = await getMasterKey();
      const payload = await encryptData(input, key);
      const { error } = await supabase
        .from("debt_contacts")
        .insert({ 
          user_id: user!.id,
          encrypted_payload: payload
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["debt_contacts"] });
      toast.success("Contact added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("debt_contacts")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["debt_contacts"] });
      toast.success("Contact deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, addContact, deleteContact };
}
