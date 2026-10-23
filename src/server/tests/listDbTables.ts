import { pool } from '../db/db';

async function listTables() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    const tables = res.rows.map((r: any) => r.table_name).sort();
    console.log('PUBLIC_TABLES_COUNT:', tables.length);
    for (const t of tables) {
      const countRes = await pool.query(`SELECT count(1) as cnt FROM "${t}"`);
      console.log(`  - ${t}: ${countRes.rows[0].cnt} rows`);
    }
  } catch (err) {
    console.error('Error listing tables:', err);
  } finally {
    await pool.end();
  }
}

listTables();
