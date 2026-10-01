import { Pool } from "pg";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log("No DATABASE_URL in process.env!");
    return;
  }

  const masked = dbUrl.replace(/:([^:@]+)@/, ":******@");
  console.log("Attempting to connect to:", masked);

  const isNeon = dbUrl.includes("neon.tech") || dbUrl.includes("sslmode=require");

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: isNeon ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 5000
  });

  try {
    const client = await pool.connect();
    console.log("✅ CONNECTED SUCCESSFULLY!");
    
    const dbRes = await client.query("SELECT current_database();");
    const userRes = await client.query("SELECT current_user;");
    
    console.log("RESULT_DATABASE=" + dbRes.rows[0].current_database);
    console.log("RESULT_USER=" + userRes.rows[0].current_user);
    
    client.release();
    await pool.end();
  } catch (err: any) {
    console.error("❌ CONNECTION FAILED:", err.message);
    await pool.end();
  }
}

main();
