const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Checking user_profiles...");
  const { data, error } = await supabase.from('user_profiles').select('*').limit(1);
  if (error) {
    console.error("user_profiles error:", error);
  } else {
    console.log("user_profiles fetch ok");
  }

  console.log("Checking tenants...");
  const { data: tData, error: tErr } = await supabase.from('tenants').select('*').limit(1);
  if (tErr) {
    console.error("tenants error:", tErr);
  } else {
    console.log("tenants fetch ok");
  }

  // To test the trigger, let's try to create a user using the admin api
  console.log("Attempting to create a test user...");
  const { data: uData, error: uErr } = await supabase.auth.admin.createUser({
    email: 'test' + Date.now() + '@sheva.com',
    password: 'password123',
    user_metadata: { full_name: 'Test User', requested_role: 'ceo' },
    email_confirm: true
  });

  if (uErr) {
    console.error("Create User Error:", uErr);
  } else {
    console.log("Create User Success:", uData.user.id);
    // Cleanup
    await supabase.auth.admin.deleteUser(uData.user.id);
  }
}

test();
