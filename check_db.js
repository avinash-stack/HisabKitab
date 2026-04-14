import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data, error } = await supabase.from('expenses').select('*').limit(3);
  if (error) console.error("Error:", error);
  console.log(JSON.stringify(data, null, 2));
}

check();
