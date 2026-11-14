/**
 * PostgreSQL backup creation and S3 publication.
 * Requires pg_dump and pg_restore on PATH. This is an explicit CLI/service call;
 * it is deliberately not scheduled or started by the web server.
 */
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { uploadBackupFile, getS3BackupConfig } from './awsS3BackupStorage';

export interface PublishedBackupManifest {
  format: 'algora-postgres-custom-v1';
  createdAt: string;
  source: { host: string; database: string };
  artifact: { key: string; sha256: string; bytes: number };
  manifestKey: string;
}

function databaseIdentity(databaseUrl: string): { host: string; database: string } {
  const parsed = new URL(databaseUrl);
  return {
    host: parsed.hostname.toLowerCase(),
    database: decodeURIComponent(parsed.pathname.slice(1)),
  };
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

function run(command: string, args: string[], env: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}: ${stderr.slice(-3000)}`));
    });
  });
}

export interface PublishedBackupResult { manifest: PublishedBackupManifest; manifestSha256: string; }

export async function createAndPublishPostgresBackup(): Promise<PublishedBackupResult> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required to create a PostgreSQL backup');
  if (process.env.DR_ALLOW_BACKUP !== 'true') {
    throw new Error('Set DR_ALLOW_BACKUP=true to explicitly authorize a backup operation');
  }
  const config = getS3BackupConfig();
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'algora-dr-'));
  const dumpPath = path.join(tempDir, 'database.dump');
  try {
    await run(process.env.PG_DUMP_PATH || 'pg_dump', [
      '--format=custom', '--no-owner', '--no-acl', '--file', dumpPath, databaseUrl,
    ], process.env);
    const stat = await fs.stat(dumpPath);
    if (!stat.size) throw new Error('pg_dump produced an empty artifact');
    await run(process.env.PG_RESTORE_PATH || 'pg_restore', ['--list', dumpPath], process.env);

    const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}`;
    const key = `algora/postgres/${id}.dump`;
    const uploaded = await uploadBackupFile(dumpPath, key, config);
    const manifest: PublishedBackupManifest = {
      format: 'algora-postgres-custom-v1',
      createdAt: new Date().toISOString(),
      source: databaseIdentity(databaseUrl),
      artifact: { key, sha256: uploaded.sha256, bytes: uploaded.bytes },
      manifestKey: `algora/postgres/${id}.manifest.json`,
    };
    const manifestPath = path.join(tempDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), { mode: 0o600 });
    const manifestUpload = await uploadBackupFile(manifestPath, manifest.manifestKey, config);
    return { manifest, manifestSha256: manifestUpload.sha256 };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
