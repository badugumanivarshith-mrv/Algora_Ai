/**
 * Explicit, isolated PostgreSQL recovery drill.
 *
 * Usage: DR_ALLOW_RESTORE=true DR_TARGET_DATABASE_URL=<empty scratch DB URL>
 *        npm run dr:restore-drill -- /secure/path/backup.manifest.json
 *
 * The target database must already exist and be empty. This command never
 * drops a database, never uses DATABASE_URL as its target, and rejects a
 * target matching the source identity recorded in the manifest.
 */
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { downloadAndVerifyBackup, getS3BackupConfig } from '../../src/server/services/awsS3BackupStorage';

interface Manifest {
  format: 'algora-postgres-custom-v1';
  createdAt: string;
  source: { host: string; database: string };
  artifact: { key: string; sha256: string; bytes: number };
}

function identity(value: string) {
  const url = new URL(value);
  return { host: url.hostname.toLowerCase(), database: decodeURIComponent(url.pathname.slice(1)) };
}

function postgresArgs(databaseUrl: string): string[] {
  const url = new URL(databaseUrl);
  return ['--host', url.hostname, '--port', url.port || '5432', '--username', decodeURIComponent(url.username), '--dbname', decodeURIComponent(url.pathname.slice(1))];
}

function postgresEnv(databaseUrl: string): NodeJS.ProcessEnv {
  const url = new URL(databaseUrl);
  const env = { ...process.env, PGPASSWORD: decodeURIComponent(url.password) };
  const sslmode = url.searchParams.get('sslmode');
  if (sslmode) env.PGSSLMODE = sslmode;
  return env;
}

function command(bin: string, args: string[], env: NodeJS.ProcessEnv): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => code === 0
      ? resolve(stdout.trim())
      : reject(new Error(`${bin} exited with code ${code}: ${stderr.slice(-2500)}`)));
  });
}

async function main() {
  if (process.env.DR_ALLOW_RESTORE !== 'true') {
    throw new Error('Refusing restore: set DR_ALLOW_RESTORE=true only for an isolated recovery drill');
  }
  const targetUrl = process.env.DR_TARGET_DATABASE_URL;
  if (!targetUrl) throw new Error('DR_TARGET_DATABASE_URL must point to a pre-created scratch database');
  const manifestPath = process.argv[2];
  if (!manifestPath) throw new Error('Provide the locally downloaded backup manifest JSON path');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')) as Manifest;
  if (manifest.format !== 'algora-postgres-custom-v1' || !manifest.artifact?.key || !/^[a-f0-9]{64}$/i.test(manifest.artifact.sha256)) {
    throw new Error('Unsupported or invalid Algora backup manifest');
  }
  const target = identity(targetUrl);
  if (target.host === manifest.source.host && target.database === manifest.source.database) {
    throw new Error('Safety stop: restore target matches the source database identity');
  }
  if (process.env.DATABASE_URL && targetUrl === process.env.DATABASE_URL) {
    throw new Error('Safety stop: DR_TARGET_DATABASE_URL must not equal DATABASE_URL');
  }

  const started = performance.now();
  const scratch = await fs.mkdtemp(path.join(os.tmpdir(), 'algora-restore-drill-'));
  const dumpPath = path.join(scratch, 'recovery.dump');
  try {
    await downloadAndVerifyBackup(manifest.artifact.key, dumpPath, manifest.artifact.sha256, getS3BackupConfig());
    await command(process.env.PG_RESTORE_PATH || 'pg_restore', ['--list', dumpPath], process.env);

    const psql = process.env.PSQL_PATH || 'psql';
    const existing = await command(psql, [
      ...postgresArgs(targetUrl), '-X', '-A', '-t', '-v', 'ON_ERROR_STOP=1',
      '-c', "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'",
    ], postgresEnv(targetUrl));
    if (Number(existing) !== 0) {
      throw new Error(`Safety stop: target database is not empty (${existing} public tables)`);
    }

    await command(process.env.PG_RESTORE_PATH || 'pg_restore', [
      '--no-owner', '--no-acl', '--exit-on-error', '--single-transaction',
      ...postgresArgs(targetUrl), dumpPath,
    ], process.env);

    const verification = await command(psql, [
      ...postgresArgs(targetUrl), '-X', '-A', '-t', '-F', '|', '-v', 'ON_ERROR_STOP=1',
      '-c', "SELECT (SELECT count(*) FROM information_schema.tables WHERE table_schema='public'), (SELECT count(*) FROM information_schema.table_constraints WHERE constraint_schema='public' AND constraint_type='FOREIGN KEY')",
    ], postgresEnv(targetUrl));
    const [tablesText, foreignKeysText] = verification.split('|');
    const tables = Number(tablesText);
    const foreignKeys = Number(foreignKeysText);
    if (!Number.isInteger(tables) || tables < 1 || !Number.isInteger(foreignKeys)) {
      throw new Error(`Post-restore schema verification failed: ${verification}`);
    }
    const elapsedMs = Math.round(performance.now() - started);
    process.stdout.write(JSON.stringify({
      status: 'RESTORE_DRILL_PASSED',
      target: { host: target.host, database: target.database },
      source: manifest.source,
      backupCreatedAt: manifest.createdAt,
      backupSha256: manifest.artifact.sha256,
      tables,
      foreignKeys,
      elapsedMs,
      note: 'Isolated target restore and schema checks passed; application-level data checks remain deployment-specific.',
    }, null, 2) + '\n');
  } finally {
    await fs.rm(scratch, { recursive: true, force: true });
  }
}

main().catch((error) => {
  process.stderr.write(`RESTORE_DRILL_FAILED: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
