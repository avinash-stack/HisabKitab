import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export type IncomeSource = {
  id: string;
  name: string;
  icon: string;
  user_id: string;
};

const DEFAULT_SOURCES = [
  { name: "Salary", icon: "💼" },
  { name: "Freelance", icon: "💻" },
  { name: "Investment", icon: "📈" },
];

export { DEFAULT_SOURCES };

export function useIncomeSources() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["income_sources"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("income_sources")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as IncomeSource[];
    },
  });

  const sources = query.data && query.data.length > 0
    ? query.data.map((s) => ({ name: s.name, icon: s.icon }))
    : DEFAULT_SOURCES;

  const addSource = useMutation({
    mutationFn: async (input: { name: string; icon: string }) => {
      const { error } = await supabase
        .from("income_sources")
        .insert({ ...input, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["income_sources"] });
      toast.success("Income source added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteSource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("income_sources")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["income_sources"] });
      toast.success("Income source deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const seedDefaults = useMutation({
    mutationFn: async () => {
      const rows = DEFAULT_SOURCES.map((s) => ({ ...s, user_id: user!.id }));
      const { error } = await supabase.from("income_sources").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["income_sources"] });
      toast.success("Default sources added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, sources, addSource, deleteSource, seedDefaults };
}
