import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export type ExpenseCategory = {
  id: string;
  name: string;
  icon: string;
  user_id: string;
};

const DEFAULT_CATEGORIES = [
  { name: "Food", icon: "🍔" },
  { name: "Transport", icon: "🚗" },
  { name: "Shopping", icon: "🛍️" },
  { name: "Bills", icon: "📄" },
  { name: "Entertainment", icon: "🎬" },
  { name: "Health", icon: "💊" },
  { name: "Education", icon: "📚" },
  { name: "Other", icon: "📦" },
];

export { DEFAULT_CATEGORIES };

export function useExpenseCategories() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["expense_categories"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_categories")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ExpenseCategory[];
    },
  });

  // Return user categories if they exist, otherwise return defaults
  const categories = query.data && query.data.length > 0
    ? query.data.map((c) => ({ name: c.name, icon: c.icon }))
    : DEFAULT_CATEGORIES;

  const addCategory = useMutation({
    mutationFn: async (input: { name: string; icon: string }) => {
      const { error } = await supabase
        .from("expense_categories")
        .insert({ ...input, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expense_categories"] });
      toast.success("Category added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("expense_categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expense_categories"] });
      toast.success("Category deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const seedDefaults = useMutation({
    mutationFn: async () => {
      const rows = DEFAULT_CATEGORIES.map((c) => ({
        ...c,
        user_id: user!.id,
      }));
      const { error } = await supabase.from("expense_categories").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expense_categories"] });
      toast.success("Default categories added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, categories, addCategory, deleteCategory, seedDefaults };
}
