const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.rpc('get_table_info', {}); // Not default, try postgres url via pg

  // Let's use the REST api to fetch a record and log its keys
  const { data: pData } = await supabase.from('user_profiles').select('*').limit(1);
  console.log("user_profiles columns:", pData && pData[0] ? Object.keys(pData[0]) : "empty table");
  
  if (!pData || pData.length === 0) {
    // If empty, insert a fake one but it'll fail FK. We can't know columns easily via PostgREST unless we use OpenAPI
  }
}
test();
