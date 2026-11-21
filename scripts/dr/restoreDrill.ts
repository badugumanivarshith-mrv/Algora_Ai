/**
 * Explicit, isolated PostgreSQL recovery drill.
 * Usage: DR_ALLOW_RESTORE=true DR_TARGET_DATABASE_URL=<empty scratch DB URL>
 *        npm run dr:restore-drill -- /secure/path/backup.manifest.json <manifest-sha256>
 * The target database must exist and be empty; this script never drops a database.
 */
import dotenv from 'dotenv';
dotenv.config();

import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import {
  downloadAndVerifyBackup,
  getS3BackupConfig,
  sha256File,
  MAX_S3_SINGLE_PUT_BYTES,
  isAllowedS3BackupKey,
} from '../../src/server/services/awsS3BackupStorage';

export const CORE_ALGORA_TABLES = [
  'users',
  'refresh_tokens',
  'learning_tracks',
  'topics',
  'problems',
  'submissions',
] as const;

export const FORBIDDEN_DATABASE_NAMES = new Set([
  'algora',
  'algora_db',
  'algora_ai',
  'algora_dev',
  'algora_prod',
  'algora_production',
  'codeforge',
  'codeforge_dev',
  'codeforge_prod',
  'postgres',
  'template0',
  'template1',
]);

export interface Manifest {
  format: 'algora-postgres-custom-v1';
  createdAt: string;
  source: { host: string; port?: string; database: string };
  artifact: { key: string; sha256: string; bytes: number };
  manifestKey?: string;
  metadata?: {
    rowCounts?: Record<string, number>;
  };
}

export function isLoopbackHost(host: string): boolean {
  if (!host || typeof host !== 'string') return false;
  const h = host.toLowerCase().replace(/^\[|\]$/g, '').trim();
  if (
    h === 'localhost' ||
    h === 'local' ||
    h === '0.0.0.0' ||
    h === '::' ||
    h === '::1' ||
    h === '0:0:0:0:0:0:0:1' ||
    h === '0:0:0:0:0:0:0:0'
  ) {
    return true;
  }
  // IPv4 loopback CIDR 127.0.0.0/8
  if (/^127(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/.test(h)) {
    return true;
  }
  // IPv6 mapped IPv4 loopback (e.g. ::ffff:127.0.0.1)
  if (/^::ffff:127(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/i.test(h)) {
    return true;
  }
  return false;
}

export function areHostsEquivalent(hostA: string, hostB: string): boolean {
  if (!hostA || !hostB) return false;
  const cleanA = hostA.toLowerCase().replace(/^\[|\]$/g, '').trim();
  const cleanB = hostB.toLowerCase().replace(/^\[|\]$/g, '').trim();
  if (cleanA === cleanB) return true;
  if (isLoopbackHost(cleanA) && isLoopbackHost(cleanB)) return true;
  return false;
}

export function areIdentitiesConflicting(
  target: { host: string; port: string; database: string },
  sourceOrProd: { host: string; port?: string; database: string },
): boolean {
  const portTarget = target.port || '5432';
  const portOther = sourceOrProd.port || '5432';
  const portsMatch = portTarget === portOther;
  const dbsMatch = target.database.toLowerCase() === sourceOrProd.database.toLowerCase();
  const hostsMatch = areHostsEquivalent(target.host, sourceOrProd.host);

  return hostsMatch && portsMatch && dbsMatch;
}

export function isApprovedScratchDatabaseName(dbName: string): boolean {
  if (!dbName || typeof dbName !== 'string') return false;
  const normalized = dbName.trim().toLowerCase();
  if (!normalized) return false;
  if (FORBIDDEN_DATABASE_NAMES.has(normalized)) return false;

  // Must explicitly contain an approved scratch/drill token bounded by word boundaries, underscores, or hyphens
  return /(?:^|[_-])(?:scratch|drill|dr_test)(?:[_-]|$)/i.test(normalized);
}

export function assertApprovedScratchDatabase(dbName: string): void {
  const normalized = (dbName || '').trim().toLowerCase();
  if (FORBIDDEN_DATABASE_NAMES.has(normalized)) {
    throw new Error(
      `Safety stop: target database "${dbName}" is a protected production/application database name. Restore drill strictly prohibited.`,
    );
  }
  if (!isApprovedScratchDatabaseName(normalized)) {
    throw new Error(
      `Safety stop: target database "${dbName}" is not an explicitly approved scratch database name. The database name must contain a 'scratch' or 'drill' token (e.g. 'algora_restore_scratch', 'scratch_db').`,
    );
  }
}

export function identity(value: string): { host: string; port: string; database: string } {
  const url = new URL(value);
  return {
    host: url.hostname.toLowerCase(),
    port: url.port || '5432',
    database: decodeURIComponent(url.pathname.slice(1)),
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

export interface CommandOptions {
  timeoutMs?: number;
  maxStdoutBytes?: number;
  maxStderrBytes?: number;
}

export function command(bin: string, args: string[], env: NodeJS.ProcessEnv, options: CommandOptions = {}): Promise<string> {
  const timeoutMs = options.timeoutMs ?? 300_000; // 5-minute bounded execution
  const maxStdout = options.maxStdoutBytes ?? 512 * 1024; // 512 KiB stdout bound
  const maxStderr = options.maxStderrBytes ?? 64 * 1024; // 64 KiB stderr bound

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
        const forceKill = setTimeout(() => {
          try { child.kill('SIGKILL'); } catch {}
        }, 5000);
        forceKill.unref();
        reject(new Error(`${bin} timed out after ${timeoutMs}ms: ${stderr.slice(-2500)}`));
      }, timeoutMs);
    }

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (chunk: string) => {
      if (stdout.length < maxStdout) {
        stdout += chunk.slice(0, maxStdout - stdout.length);
      }
    });

    child.stderr.on('data', (chunk: string) => {
      if (stderr.length < maxStderr) {
        stderr += chunk.slice(0, maxStderr - stderr.length);
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
      else reject(new Error(`${bin} exited with code ${code}: ${stderr.slice(-2500)}`));
    });
  });
}

export function validateManifest(manifest: any): asserts manifest is Manifest {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error('Backup manifest is missing or not a JSON object');
  }
  if (manifest.format !== 'algora-postgres-custom-v1') {
    throw new Error(`Unsupported backup manifest format: ${manifest.format}`);
  }

  // Timestamp validation
  if (typeof manifest.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(manifest.createdAt)) {
    throw new Error(`Backup manifest contains invalid createdAt format: ${manifest.createdAt}`);
  }
  const timestamp = Date.parse(manifest.createdAt);
  if (isNaN(timestamp)) {
    throw new Error(`Backup manifest contains invalid createdAt timestamp: ${manifest.createdAt}`);
  }
  if (timestamp < Date.parse('2024-01-01T00:00:00Z')) {
    throw new Error(`Backup manifest createdAt timestamp is unreasonably old (${manifest.createdAt})`);
  }
  if (timestamp > Date.now() + 5 * 60 * 1000) {
    throw new Error(`Backup manifest createdAt timestamp is in the future (${manifest.createdAt})`);
  }

  // Source identity
  if (!manifest.source || typeof manifest.source !== 'object' || Array.isArray(manifest.source)) {
    throw new Error('Backup manifest contains invalid source identity');
  }
  if (typeof manifest.source.host !== 'string' || !manifest.source.host.trim()) {
    throw new Error('Backup manifest source.host must be a non-empty string');
  }
  if (typeof manifest.source.database !== 'string' || !manifest.source.database.trim()) {
    throw new Error('Backup manifest source.database must be a non-empty string');
  }
  if (manifest.source.port !== undefined) {
    const portStr = String(manifest.source.port).trim();
    if (!/^\d{1,5}$/.test(portStr)) {
      throw new Error(`Backup manifest source.port must be an integer between 1 and 65535 (got "${manifest.source.port}")`);
    }
    const portNum = Number(portStr);
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
      throw new Error(`Backup manifest source.port out of range 1-65535 (got ${portNum})`);
    }
  }

  // Artifact
  if (!manifest.artifact || typeof manifest.artifact !== 'object' || Array.isArray(manifest.artifact)) {
    throw new Error('Backup manifest is missing artifact definition');
  }
  const key = manifest.artifact.key;
  if (!isAllowedS3BackupKey(key) || !key.endsWith('.dump')) {
    throw new Error(`Backup manifest artifact key is invalid or outside allowed path: "${key}"`);
  }
  if (typeof manifest.artifact.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(manifest.artifact.sha256)) {
    throw new Error(`Backup manifest contains invalid artifact SHA-256 (must be 64-character hex): ${manifest.artifact?.sha256}`);
  }
  if (
    typeof manifest.artifact.bytes !== 'number' ||
    !Number.isInteger(manifest.artifact.bytes) ||
    manifest.artifact.bytes <= 0
  ) {
    throw new Error(`Backup manifest artifact bytes must be a positive integer: ${manifest.artifact?.bytes}`);
  }
  if (manifest.artifact.bytes > MAX_S3_SINGLE_PUT_BYTES) {
    throw new Error(`Backup manifest artifact bytes exceeds 5 GiB limit (${manifest.artifact.bytes} bytes)`);
  }

  // ManifestKey
  if (manifest.manifestKey !== undefined) {
    if (typeof manifest.manifestKey !== 'string' || !/^algora\/postgres\/[a-zA-Z0-9._-]+\.manifest\.json$/.test(manifest.manifestKey)) {
      throw new Error(`Backup manifest contains invalid manifestKey: "${manifest.manifestKey}"`);
    }
  }

  // Metadata
  if (manifest.metadata !== undefined) {
    if (typeof manifest.metadata !== 'object' || manifest.metadata === null || Array.isArray(manifest.metadata)) {
      throw new Error('Backup manifest metadata must be an object');
    }
    if (manifest.metadata.rowCounts !== undefined) {
      if (typeof manifest.metadata.rowCounts !== 'object' || manifest.metadata.rowCounts === null || Array.isArray(manifest.metadata.rowCounts)) {
        throw new Error('Backup manifest metadata.rowCounts must be an object');
      }
      for (const [table, count] of Object.entries(manifest.metadata.rowCounts)) {
        if (typeof count !== 'number' || !Number.isInteger(count) || count < 0) {
          throw new Error(`Backup manifest metadata.rowCounts for "${table}" must be a non-negative integer (got ${count})`);
        }
      }
    }
  }
}

export const TARGET_CLEANLINESS_SQL = [
  'SELECT (',
  "(SELECT count(*) FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'pg_catalog')) +",
  "(SELECT count(*) FROM pg_matviews WHERE schemaname NOT IN ('information_schema', 'pg_catalog')) +",
  "(SELECT count(*) FROM pg_sequences WHERE schemaname NOT IN ('information_schema', 'pg_catalog')) +",
  "(SELECT count(*) FROM information_schema.routines WHERE routine_schema NOT IN ('information_schema', 'pg_catalog')) +",
  "(SELECT count(*) FROM information_schema.triggers WHERE trigger_schema NOT IN ('information_schema', 'pg_catalog')) +",
  "(SELECT count(*) FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast') AND t.typtype IN ('c', 'e', 'd')) +",
  "(SELECT count(*) FROM pg_extension WHERE extname NOT IN ('plpgsql')) +",
  "(SELECT count(*) FROM information_schema.schemata WHERE schema_name NOT IN ('public', 'information_schema', 'pg_catalog', 'pg_toast') AND schema_name NOT LIKE 'pg_temp_%' AND schema_name NOT LIKE 'pg_toast_temp_%')",
  ') AS total_objects;',
].join(' ');

async function main() {
  if (process.env.DR_ALLOW_RESTORE !== 'true') {
    throw new Error('Refusing restore: set DR_ALLOW_RESTORE=true only for an isolated recovery drill');
  }
  const targetUrl = process.env.DR_TARGET_DATABASE_URL;
  if (!targetUrl) throw new Error('DR_TARGET_DATABASE_URL must point to a pre-created scratch database');

  const manifestPath = process.argv[2];
  const expectedManifestSha256 = process.argv[3];
  if (!manifestPath || !expectedManifestSha256) throw new Error('Provide manifest JSON path and its SHA-256 printed by dr:backup');
  if (!/^[a-f0-9]{64}$/i.test(expectedManifestSha256)) throw new Error('Expected manifest SHA-256 must be 64 hexadecimal characters');

  const calculatedManifestSha = await sha256File(manifestPath);
  if (calculatedManifestSha.toLowerCase() !== expectedManifestSha256.toLowerCase()) {
    throw new Error('Backup manifest SHA-256 verification failed');
  }

  const rawManifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  validateManifest(rawManifest);
  const manifest = rawManifest;

  const target = identity(targetUrl);

  // 1. Require explicitly approved scratch database name and block protected production databases
  assertApprovedScratchDatabase(target.database);

  // 2. Target database isolation safety stops against manifest source (including loopback and hostname aliases)
  if (areIdentitiesConflicting(target, manifest.source)) {
    throw new Error(`Safety stop: restore target matches the source database identity (${target.host}:${target.port}/${target.database})`);
  }

  // 3. Target database isolation safety stops against process.env.DATABASE_URL
  if (process.env.DATABASE_URL) {
    const prod = identity(process.env.DATABASE_URL);
    if (areIdentitiesConflicting(target, prod)) {
      throw new Error(`Safety stop: DR_TARGET_DATABASE_URL matches DATABASE_URL identity (${target.host}:${target.port}/${target.database})`);
    }
    if (targetUrl === process.env.DATABASE_URL) {
      throw new Error('Safety stop: DR_TARGET_DATABASE_URL must not equal DATABASE_URL');
    }
  }

  const started = performance.now();
  const scratch = await fs.mkdtemp(path.join(os.tmpdir(), 'algora-restore-drill-'));
  const dumpPath = path.join(scratch, 'recovery.dump');

  try {
    await downloadAndVerifyBackup(manifest.artifact.key, dumpPath, manifest.artifact.sha256, getS3BackupConfig());
    await command(process.env.PG_RESTORE_PATH || 'pg_restore', ['--list', dumpPath], postgresEnv(targetUrl));

    const psql = process.env.PSQL_PATH || 'psql';

    // Verify scratch database is genuinely empty across all user-created object types and schemas
    const existingObjects = await command(psql, [
      ...postgresArgs(targetUrl), '-X', '-A', '-t', '-v', 'ON_ERROR_STOP=1',
      '-c', TARGET_CLEANLINESS_SQL,
    ], postgresEnv(targetUrl));

    const totalCount = Number(existingObjects);
    if (isNaN(totalCount) || totalCount !== 0) {
      throw new Error(`Safety stop: target database is not empty (${existingObjects.trim()} existing user objects/schemas detected)`);
    }

    // Transactional restore; no dropping, strict error stop
    await command(process.env.PG_RESTORE_PATH || 'pg_restore', [
      '--no-owner', '--no-acl', '--exit-on-error', '--single-transaction',
      ...postgresArgs(targetUrl), dumpPath,
    ], postgresEnv(targetUrl));

    // Verify required core schema tables, foreign keys, row counts, and referential integrity
    const coreTablesList = CORE_ALGORA_TABLES.map((t) => `'${t}'`).join(', ');
    const verificationSql = [
      'SELECT',
      "(SELECT count(*) FROM information_schema.tables WHERE table_schema='public'),",
      "(SELECT count(*) FROM information_schema.table_constraints WHERE constraint_schema='public' AND constraint_type='FOREIGN KEY'),",
      `(SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN (${coreTablesList})),`,
      '(SELECT count(*) FROM public.users),',
      '(SELECT count(*) FROM public.problems),',
      '(SELECT count(*) FROM public.learning_tracks),',
      '(SELECT count(*) FROM public.topics),',
      '(SELECT count(*) FROM public.submissions),',
      '(SELECT count(*) FROM public.refresh_tokens),',
      '(SELECT count(*) FROM public.topics t LEFT JOIN public.learning_tracks l ON t.track_id = l.id WHERE l.id IS NULL) + ' +
      '(SELECT count(*) FROM public.submissions s LEFT JOIN public.users u ON s.user_id = u.id WHERE u.id IS NULL)',
    ].join(' ');

    const verification = await command(psql, [
      ...postgresArgs(targetUrl), '-X', '-A', '-t', '-F', '|', '-v', 'ON_ERROR_STOP=1',
      '-c', verificationSql,
    ], postgresEnv(targetUrl));

    const [
      tablesText,
      foreignKeysText,
      coreTablesFoundText,
      usersText,
      problemsText,
      learningTracksText,
      topicsText,
      submissionsText,
      refreshTokensText,
      orphanFkText,
    ] = verification.split('|');

    const tables = Number(tablesText);
    const foreignKeys = Number(foreignKeysText);
    const coreTablesFound = Number(coreTablesFoundText);
    const users = Number(usersText);
    const problems = Number(problemsText);
    const learningTracks = Number(learningTracksText);
    const topics = Number(topicsText);
    const submissions = Number(submissionsText);
    const refreshTokens = Number(refreshTokensText);
    const orphanFk = Number(orphanFkText);

    if (
      !Number.isInteger(tables) || tables < CORE_ALGORA_TABLES.length ||
      !Number.isInteger(foreignKeys) || foreignKeys < 1 ||
      coreTablesFound !== CORE_ALGORA_TABLES.length ||
      !Number.isInteger(users) ||
      !Number.isInteger(problems) ||
      !Number.isInteger(learningTracks) ||
      !Number.isInteger(topics) ||
      !Number.isInteger(submissions) ||
      !Number.isInteger(refreshTokens)
    ) {
      throw new Error(
        `Post-restore schema verification failed: ${verification} (expected all ${CORE_ALGORA_TABLES.length} core tables: ${CORE_ALGORA_TABLES.join(', ')})`,
      );
    }

    if (!Number.isInteger(orphanFk) || orphanFk !== 0) {
      throw new Error(`Data integrity violation: ${orphanFkText} orphaned foreign key records detected in restored database`);
    }

    const restoredRowCounts: Record<string, number> = {
      users,
      problems,
      learning_tracks: learningTracks,
      topics,
      submissions,
      refresh_tokens: refreshTokens,
    };

    // If manifest recorded row counts at backup time, verify exact data integrity
    if (manifest.metadata?.rowCounts) {
      for (const [table, expectedCount] of Object.entries(manifest.metadata.rowCounts)) {
        const actualCount = restoredRowCounts[table];
        if (actualCount !== undefined && actualCount !== expectedCount) {
          throw new Error(
            `Data integrity violation: table "${table}" restored row count (${actualCount}) does not match backup-time metadata (${expectedCount})`,
          );
        }
      }
    }

    const elapsedMs = Math.round(performance.now() - started);
    process.stdout.write(JSON.stringify({
      status: 'RESTORE_DRILL_PASSED',
      target: { host: target.host, port: target.port, database: target.database },
      source: manifest.source,
      backupCreatedAt: manifest.createdAt,
      backupSha256: manifest.artifact.sha256,
      tables,
      foreignKeys,
      coreTablesVerified: CORE_ALGORA_TABLES,
      restoredRowCounts,
      elapsedMs,
      note: 'Isolated target restore, schema validation, and data integrity checks passed; application-level smoke tests remain deployment-specific.',
    }, null, 2) + '\n');
  } finally {
    await fs.rm(scratch, { recursive: true, force: true });
  }
}

const isDirectExecution = Boolean(
  process.argv[1] && (
    fileURLToPath(import.meta.url) === path.resolve(process.argv[1]) ||
    process.argv[1].endsWith('restoreDrill.ts') ||
    process.argv[1].endsWith('restoreDrill.js')
  )
);

if (isDirectExecution) {
  main().catch((error) => {
    process.stderr.write(`RESTORE_DRILL_FAILED: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
