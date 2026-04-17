
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres:5hQ5GY2t2@2025+@db.gtenkjvlnwspxcosbybp.supabase.co:5432/postgres";
const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20240417000024_fix_finance_balances.sql');

async function runMigration() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to database.");
    
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log("Executing migration...");
    
    await client.query(sql);
    console.log("Migration executed successfully.");
    
    // Attempt to insert into _supabase_migrations if it exists
    try {
        await client.query("INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20240417000024')");
        console.log("Logged migration to schema_migrations.");
    } catch (e) {
        console.warn("Could not log to schema_migrations, but SQL was applied.");
    }

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();
