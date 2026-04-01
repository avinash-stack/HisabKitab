import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const currentDay = today.getDate();
    const currentDate = today.toISOString().split("T")[0];
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

    // Get all active recurring expenses where day_of_month matches today
    // and haven't been generated for this month yet
    const { data: recurring, error: fetchError } = await supabase
      .from("recurring_expenses")
      .select("*")
      .eq("is_active", true)
      .eq("day_of_month", currentDay);

    if (fetchError) throw fetchError;

    let generated = 0;

    for (const rec of recurring || []) {
      // Check if already generated this month
      if (rec.last_generated_date) {
        const lastGenMonth = rec.last_generated_date.substring(0, 7);
        if (lastGenMonth === currentMonth) continue;
      }

      // Create the expense
      const { error: insertError } = await supabase.from("expenses").insert({
        user_id: rec.user_id,
        amount: rec.amount,
        category: rec.category,
        note: rec.note ? `[Auto] ${rec.note}` : "[Auto] Recurring expense",
        expense_date: currentDate,
      });

      if (insertError) {
        console.error(`Failed to insert for recurring ${rec.id}:`, insertError);
        continue;
      }

      // Update last_generated_date
      await supabase
        .from("recurring_expenses")
        .update({ last_generated_date: currentDate })
        .eq("id", rec.id);

      generated++;
    }

    return new Response(JSON.stringify({ success: true, generated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
