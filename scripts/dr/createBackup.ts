import dotenv from 'dotenv';
dotenv.config();

import { createAndPublishPostgresBackup } from '../../src/server/services/postgresS3Backup';

createAndPublishPostgresBackup()
  .then((result) => {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  })
  .catch((error) => {
    process.stderr.write(`BACKUP_FAILED: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
