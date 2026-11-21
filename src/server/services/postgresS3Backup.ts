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
import {
  uploadBackupFile,
  getS3BackupConfig,
  S3BackupObject,
  MAX_S3_SINGLE_PUT_BYTES,
  isAllowedS3BackupKey,
} from './awsS3BackupStorage';

export const CORE_ALGORA_TABLES = [
  'users',
  'refresh_tokens',
  'learning_tracks',
  'topics',
  'problems',
  'submissions',
] as const;

export interface PublishedBackupManifest {
  format: 'algora-postgres-custom-v1';
  createdAt: string;
  source: { host: string; port?: string; database: string };
  artifact: { key: string; sha256: string; bytes: number };
  manifestKey: string;
  metadata?: {
    rowCounts?: Record<string, number>;
  };
}

export function databaseIdentity(databaseUrl: string): { host: string; port?: string; database: string } {
  const parsed = new URL(databaseUrl);
  return {
    host: parsed.hostname.toLowerCase(),
    port: parsed.port || '5432',
    database: decodeURIComponent(parsed.pathname.slice(1)),
  };
}

export function postgresArgs(databaseUrl: string): string[] {
  const url = new URL(databaseUrl);
  return ['--host', url.hostname, '--port', url.port || '5432', '--username', decodeURIComponent(url.username), '--dbname', decodeURIComponent(url.pathname.slice(1))];
}

export function postgresEnv(databaseUrl: string): NodeJS.ProcessEnv {
  const url = new URL(databaseUrl);
  const env: NodeJS.ProcessEnv = { ...process.env, PGPASSWORD: decodeURIComponent(url.password) };
  delete env.DATABASE_URL;
  delete env.DR_TARGET_DATABASE_URL;
  delete env.AWS_ACCESS_KEY_ID;
  delete env.AWS_SECRET_ACCESS_KEY;
  delete env.AWS_SESSION_TOKEN;
  const sslmode = url.searchParams.get('sslmode');
  if (sslmode) env.PGSSLMODE = sslmode;
  return env;
}

export interface RunOptions {
  timeoutMs?: number;
  maxStderrBytes?: number;
}

export function run(command: string, args: string[], env: NodeJS.ProcessEnv, options: RunOptions = {}): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 300_000; // 5-minute bounded execution
  const maxStderrBytes = options.maxStderrBytes ?? 64 * 1024; // 64 KiB stderr bound

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    let killed = false;
    let timer: NodeJS.Timeout | undefined;

    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        killed = true;
        child.kill('SIGTERM');
        const forceKill = setTimeout(() => {
          try { child.kill('SIGKILL'); } catch {}
        }, 5000);
        forceKill.unref();
        reject(new Error(`${command} timed out after ${timeoutMs}ms: ${stderr.slice(-3000)}`));
      }, timeoutMs);
    }

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      if (stderr.length < maxStderrBytes) {
        stderr += chunk.slice(0, maxStderrBytes - stderr.length);
      }
    });

    child.on('error', (error) => {
      if (timer) clearTimeout(timer);
      if (!killed) reject(error);
    });

    child.on('close', (code) => {
      if (timer) clearTimeout(timer);
      if (killed) return;
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}: ${stderr.slice(-3000)}`));
    });
  });
}

export function execCommand(
  bin: string,
  args: string[],
  env: NodeJS.ProcessEnv,
  options: RunOptions = {},
): Promise<string> {
  const timeoutMs = options.timeoutMs ?? 30_000;
  const maxStderrBytes = options.maxStderrBytes ?? 64 * 1024;

  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let killed = false;
    let timer: NodeJS.Timeout | undefined;

    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        killed = true;
        child.kill('SIGTERM');
        reject(new Error(`${bin} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (chunk: string) => {
      if (stdout.length < 128 * 1024) {
        stdout += chunk.slice(0, 128 * 1024 - stdout.length);
      }
    });

    child.stderr.on('data', (chunk: string) => {
      if (stderr.length < maxStderrBytes) {
        stderr += chunk.slice(0, maxStderrBytes - stderr.length);
      }
    });

    child.on('error', (err) => {
      if (timer) clearTimeout(timer);
      if (!killed) reject(err);
    });

    child.on('close', (code) => {
      if (timer) clearTimeout(timer);
      if (killed) return;
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(`${bin} exited with code ${code}: ${stderr.slice(-1000)}`));
    });
  });
}

export async function captureTableRowCounts(databaseUrl: string): Promise<Record<string, number> | undefined> {
  const psql = process.env.PSQL_PATH || 'psql';
  const query = [
    'SELECT table_name, count FROM (',
    CORE_ALGORA_TABLES.map((t) => `SELECT '${t}' AS table_name, count(*) AS count FROM public.${t}`).join(' UNION ALL '),
    ') AS table_counts ORDER BY table_name;',
  ].join(' ');

  try {
    const res = await execCommand(psql, [
      ...postgresArgs(databaseUrl), '-X', '-A', '-t', '-F', '|', '-v', 'ON_ERROR_STOP=1',
      '-c', query,
    ], postgresEnv(databaseUrl), { timeoutMs: 15_000 });

    const counts: Record<string, number> = {};
    const lines = res.trim().split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      const [table, countStr] = line.split('|');
      if (table && countStr !== undefined) {
        const count = Number(countStr);
        if (Number.isInteger(count) && count >= 0) {
          counts[table.trim()] = count;
        }
      }
    }
    return Object.keys(counts).length > 0 ? counts : undefined;
  } catch {
    // Graceful fallback if psql is not available or source tables do not exist yet
    return undefined;
  }
}

export function validateBackupMetadata(manifest: PublishedBackupManifest): void {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error('Invalid manifest: root must be an object');
  }
  if (manifest.format !== 'algora-postgres-custom-v1') {
    throw new Error(`Invalid manifest format: ${manifest.format}`);
  }

  // Timestamp validation
  if (typeof manifest.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(manifest.createdAt)) {
    throw new Error(`Invalid manifest createdAt format: ${manifest.createdAt}`);
  }
  const timestamp = Date.parse(manifest.createdAt);
  if (isNaN(timestamp)) {
    throw new Error(`Invalid manifest createdAt timestamp: ${manifest.createdAt}`);
  }
  if (timestamp < Date.parse('2024-01-01T00:00:00Z')) {
    throw new Error(`Manifest createdAt timestamp is unreasonably old (${manifest.createdAt})`);
  }
  if (timestamp > Date.now() + 5 * 60 * 1000) {
    throw new Error(`Manifest createdAt timestamp is in the future (${manifest.createdAt})`);
  }

  // Source identity
  if (!manifest.source || typeof manifest.source !== 'object' || Array.isArray(manifest.source)) {
    throw new Error('Manifest source must be an object');
  }
  if (typeof manifest.source.host !== 'string' || !manifest.source.host.trim()) {
    throw new Error('Manifest source must contain non-empty host string');
  }
  if (typeof manifest.source.database !== 'string' || !manifest.source.database.trim()) {
    throw new Error('Manifest source must contain non-empty database string');
  }
  if (manifest.source.port !== undefined) {
    const portStr = String(manifest.source.port).trim();
    if (!/^\d{1,5}$/.test(portStr)) {
      throw new Error(`Manifest source.port must be an integer between 1 and 65535 (got "${manifest.source.port}")`);
    }
    const portNum = Number(portStr);
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
      throw new Error(`Manifest source.port must be between 1 and 65535 (got ${portNum})`);
    }
  }

  // Artifact
  if (!manifest.artifact || typeof manifest.artifact !== 'object' || Array.isArray(manifest.artifact)) {
    throw new Error('Manifest artifact must be an object');
  }
  if (!isAllowedS3BackupKey(manifest.artifact.key) || !manifest.artifact.key.endsWith('.dump')) {
    throw new Error(`Manifest artifact key is invalid: ${manifest.artifact?.key}`);
  }
  if (typeof manifest.artifact.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(manifest.artifact.sha256)) {
    throw new Error(`Manifest artifact SHA-256 is invalid (must be 64-character hex): ${manifest.artifact?.sha256}`);
  }
  if (
    typeof manifest.artifact.bytes !== 'number' ||
    !Number.isInteger(manifest.artifact.bytes) ||
    manifest.artifact.bytes <= 0
  ) {
    throw new Error(`Manifest artifact bytes must be a positive integer (got ${manifest.artifact?.bytes})`);
  }
  if (manifest.artifact.bytes > MAX_S3_SINGLE_PUT_BYTES) {
    throw new Error(`Manifest artifact bytes exceeds 5 GiB limit (${manifest.artifact.bytes} bytes)`);
  }

  // Manifest key
  if (typeof manifest.manifestKey !== 'string' || !/^algora\/postgres\/[a-zA-Z0-9._-]+\.manifest\.json$/.test(manifest.manifestKey)) {
    throw new Error(`Manifest publication key is invalid: ${manifest.manifestKey}`);
  }

  // Metadata
  if (manifest.metadata !== undefined) {
    if (typeof manifest.metadata !== 'object' || manifest.metadata === null || Array.isArray(manifest.metadata)) {
      throw new Error('Manifest metadata must be an object');
    }
    if (manifest.metadata.rowCounts !== undefined) {
      if (typeof manifest.metadata.rowCounts !== 'object' || manifest.metadata.rowCounts === null || Array.isArray(manifest.metadata.rowCounts)) {
        throw new Error('Manifest metadata.rowCounts must be an object mapping table names to counts');
      }
      for (const [table, count] of Object.entries(manifest.metadata.rowCounts)) {
        if (typeof count !== 'number' || !Number.isInteger(count) || count < 0) {
          throw new Error(`Manifest metadata.rowCounts for "${table}" must be a non-negative integer (got ${count})`);
        }
      }
    }
  }
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
    // Capture backup-time row counts for integrity verification if possible
    const rowCounts = await captureTableRowCounts(databaseUrl);

    await run(process.env.PG_DUMP_PATH || 'pg_dump', [
      '--format=custom', '--no-owner', '--no-acl', '--file', dumpPath, ...postgresArgs(databaseUrl),
    ], postgresEnv(databaseUrl));

    const stat = await fs.stat(dumpPath);
    if (!stat.size) throw new Error('pg_dump produced an empty artifact');

    // Archive check using sanitized child-process environment
    await run(process.env.PG_RESTORE_PATH || 'pg_restore', ['--list', dumpPath], postgresEnv(databaseUrl));

    const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}`;
    const key = `algora/postgres/${id}.dump`;

    let uploaded: S3BackupObject;
    try {
      uploaded = await uploadBackupFile(dumpPath, key, config);
    } catch (dumpUploadError) {
      throw new Error(`Failed to upload database dump artifact to S3: ${dumpUploadError instanceof Error ? dumpUploadError.message : String(dumpUploadError)}`);
    }

    const manifest: PublishedBackupManifest = {
      format: 'algora-postgres-custom-v1',
      createdAt: new Date().toISOString(),
      source: databaseIdentity(databaseUrl),
      artifact: { key, sha256: uploaded.sha256, bytes: uploaded.bytes },
      manifestKey: `algora/postgres/${id}.manifest.json`,
      ...(rowCounts ? { metadata: { rowCounts } } : {}),
    };

    validateBackupMetadata(manifest);

    const manifestPath = path.join(tempDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), { mode: 0o600 });

    try {
      const manifestUpload = await uploadBackupFile(manifestPath, manifest.manifestKey, config);
      return { manifest, manifestSha256: manifestUpload.sha256 };
    } catch (manifestUploadError) {
      const cause = manifestUploadError instanceof Error ? manifestUploadError.message : String(manifestUploadError);
      throw new Error(
        `Failed to publish backup manifest after dump artifact was uploaded. Orphaned S3 dump key: "${key}" (SHA-256: ${uploaded.sha256}, bytes: ${uploaded.bytes}). Remediation: inspect S3 bucket or re-run with clean manifest. Error: ${cause}`,
      );
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
