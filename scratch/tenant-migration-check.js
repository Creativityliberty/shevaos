const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: hr } = await supabase.from('hr_contracts').select('tenant_id');
  console.log("HR Tenant IDs:", hr);

  const { data: accounts } = await supabase.from('finance_accounts').select('tenant_id');
  console.log("Account Tenant IDs:", accounts);
}

check();
