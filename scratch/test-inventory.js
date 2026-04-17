const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("--- Testing inventory query ---");
  const { data, error } = await supabase
    .from("stock_levels")
    .select(`
      *,
      products (id, name, sku, alert_threshold, average_purchase_cost, image_url),
      hubs (name)
    `)
    .order("total_stock", { ascending: true });

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Query Success, count:", data.length);
  }
}

check();
