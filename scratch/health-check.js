const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("--- Checking HR ---");
  const { data: hr, count: hrCount } = await supabase.from('hr_contracts').select('*', { count: 'exact' });
  console.log("hr_contracts count:", hrCount);

  console.log("--- Checking finance_accounts ---");
  const { data: accounts, count: accountsCount } = await supabase.from('finance_accounts').select('*', { count: 'exact' });
  console.log("finance_accounts count:", accountsCount);

  console.log("--- Checking user_profiles ---");
  const { data: profiles, count: profilesCount } = await supabase.from('user_profiles').select('*', { count: 'exact' });
  console.log("user_profiles count:", profilesCount);
}

check();
