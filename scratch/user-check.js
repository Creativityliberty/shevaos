const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: user } = await supabase.from('user_profiles').select('*').eq('email', 'creativityliberty@gmail.com').single();
  console.log("User Profile:", JSON.stringify(user, null, 2));

  const { data: tenant } = await supabase.from('tenants').select('*').limit(1);
  console.log("First Tenant:", JSON.stringify(tenant, null, 2));
}

check();
