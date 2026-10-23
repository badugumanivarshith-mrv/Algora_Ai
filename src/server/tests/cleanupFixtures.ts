import { pool } from '../db/db';

async function checkAndClean() {
  try {
    const checkRes = await pool.query("SELECT count(1) as cnt FROM users WHERE email LIKE '%@algora.test'");
    console.log('REMAINING_TEST_USERS_BEFORE:', checkRes.rows[0].cnt);
    if (parseInt(checkRes.rows[0].cnt, 10) > 0) {
      const delRes = await pool.query("DELETE FROM users WHERE email LIKE '%@algora.test'");
      console.log('DELETED_TEST_USERS:', delRes.rowCount);
    }
    const finalRes = await pool.query("SELECT count(1) as cnt FROM users WHERE email LIKE '%@algora.test'");
    console.log('REMAINING_TEST_USERS_AFTER:', finalRes.rows[0].cnt);
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await pool.end();
  }
}

checkAndClean();
