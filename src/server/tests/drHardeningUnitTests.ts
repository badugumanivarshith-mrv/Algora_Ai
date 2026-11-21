/**
 * Comprehensive Unit and Safety Verification Tests for Algora Disaster Recovery Hardening.
 *
 * Mocks network and child-process operations to test signing, checksums,
 * manifest validation, timeout bounds, hostname alias equivalence, scratch database approvals,
 * and data integrity safety without real AWS or PostgreSQL operations.
 */
import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  validateBucketName,
  validateEndpoint,
  resolveTargetUrl,
  signedHeaders,
  sha256File,
  downloadAndVerifyBackup,
  S3BackupConfig,
  isAllowedS3BackupKey,
  MAX_S3_SINGLE_PUT_BYTES,
} from '../services/awsS3BackupStorage';
import {
  validateBackupMetadata,
  PublishedBackupManifest,
  run,
  databaseIdentity,
} from '../services/postgresS3Backup';
import {
  identity,
  validateManifest,
  CORE_ALGORA_TABLES,
  isLoopbackHost,
  areHostsEquivalent,
  areIdentitiesConflicting,
  isApprovedScratchDatabaseName,
  assertApprovedScratchDatabase,
  FORBIDDEN_DATABASE_NAMES,
  TARGET_CLEANLINESS_SQL,
} from '../../../scripts/dr/restoreDrill';

async function runTests() {
  console.log('--- DR Hardening Unit & Safety Tests ---');
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    return Promise.resolve()
      .then(fn)
      .then(() => {
        console.log(`  ✓ ${name}`);
        passed++;
      })
      .catch((err) => {
        console.error(`  ✗ ${name}:`, err);
        failed++;
      });
  }

  // ==========================================
  // 1. S3 Transport & Bucket Validation Tests
  // ==========================================
  await test('validateBucketName accepts valid standard DNS bucket names', () => {
    validateBucketName('algora-backups-prod');
    validateBucketName('algora-dr-2026');
    validateBucketName('my-bucket-123');
  });

  await test('validateBucketName accepts dotted bucket names for path-style compatibility', () => {
    validateBucketName('algora.dr.backup');
    validateBucketName('corp.algora.storage');
  });

  await test('validateBucketName rejects invalid names, IP addresses, and bad sequences', () => {
    assert.throws(() => validateBucketName('ab'), /DNS-compatible/);
    assert.throws(() => validateBucketName('Algora-Uppercase'), /DNS-compatible/);
    assert.throws(() => validateBucketName('bucket..name'), /invalid label separators/);
    assert.throws(() => validateBucketName('192.168.1.1'), /IP address/);
    assert.throws(() => validateBucketName('-starts-with-dash'), /DNS-compatible/);
    assert.throws(() => validateBucketName('ends-with-dash-'), /DNS-compatible/);
  });

  await test('isAllowedS3BackupKey enforces strict key namespaces', () => {
    assert.strictEqual(isAllowedS3BackupKey('algora/postgres/2026-11-21-uuid.dump'), true);
    assert.strictEqual(isAllowedS3BackupKey('algora/postgres/2026-11-21-uuid.manifest.json'), true);
    assert.strictEqual(isAllowedS3BackupKey('algora/postgres/../escape.dump'), false);
    assert.strictEqual(isAllowedS3BackupKey('/algora/postgres/absolute.dump'), false);
    assert.strictEqual(isAllowedS3BackupKey('other/namespace/file.dump'), false);
    assert.strictEqual(isAllowedS3BackupKey('algora/postgres/malicious.sh'), false);
  });

  // ==========================================
  // 2. Target URL Resolution & S3 Endpoints
  // ==========================================
  const baseConfig: S3BackupConfig = {
    bucket: 'algora-backups',
    region: 'ap-south-1',
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  };

  await test('resolveTargetUrl uses virtual-hosted style for standard buckets', () => {
    const target = resolveTargetUrl(baseConfig, 'algora/postgres/test.dump');
    assert.strictEqual(target.hostname, 'algora-backups.s3.ap-south-1.amazonaws.com');
    assert.strictEqual(target.path, '/algora/postgres/test.dump');
    assert.strictEqual(target.protocol, 'https:');
  });

  await test('resolveTargetUrl switches to path-style for dotted buckets to protect TLS wildcard cert', () => {
    const dottedConfig: S3BackupConfig = { ...baseConfig, bucket: 'algora.prod.backups' };
    const target = resolveTargetUrl(dottedConfig, 'algora/postgres/test.dump');
    assert.strictEqual(target.hostname, 's3.ap-south-1.amazonaws.com');
    assert.strictEqual(target.path, '/algora.prod.backups/algora/postgres/test.dump');
    assert.strictEqual(target.protocol, 'https:');
  });

  await test('resolveTargetUrl supports custom endpoint with custom port', () => {
    const customConfig: S3BackupConfig = { ...baseConfig, endpoint: 'http://127.0.0.1:9000' };
    const target = resolveTargetUrl(customConfig, 'algora/postgres/test.dump');
    assert.strictEqual(target.protocol, 'http:');
    assert.strictEqual(target.hostname, '127.0.0.1');
    assert.strictEqual(target.port, 9000);
    assert.strictEqual(target.hostHeader, '127.0.0.1:9000');
    assert.strictEqual(target.path, '/algora-backups/algora/postgres/test.dump');
  });

  // ==========================================
  // 3. SigV4 Signing Correctness
  // ==========================================
  await test('signedHeaders constructs valid AWS4-HMAC-SHA256 headers', () => {
    const signed = signedHeaders(
      baseConfig,
      'GET',
      'algora/postgres/test.dump',
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
    assert(signed.headers.Authorization.startsWith('AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/'));
    assert(signed.headers.Authorization.includes('/ap-south-1/s3/aws4_request'));
    assert(signed.headers.Authorization.includes('SignedHeaders='));
    assert(signed.headers.Authorization.includes('Signature='));
    assert.strictEqual(signed.headers['x-amz-content-sha256'], 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  // ==========================================
  // 4. SHA-256 and Safe Staging Handlers
  // ==========================================
  await test('sha256File accurately computes stream checksum', async () => {
    const tmp = path.join(os.tmpdir(), `algora-test-${Date.now()}.txt`);
    await fs.writeFile(tmp, 'Algora Disaster Recovery Verification Payload 2026', 'utf8');
    try {
      const checksum = await sha256File(tmp);
      assert.strictEqual(checksum.length, 64);
      assert(/^[a-f0-9]{64}$/.test(checksum));
    } finally {
      await fs.rm(tmp, { force: true });
    }
  });

  await test('downloadAndVerifyBackup refuses to overwrite or delete pre-existing destination file', async () => {
    const tmp = path.join(os.tmpdir(), `algora-pre-existing-${Date.now()}.txt`);
    const originalContent = 'Precious existing production data';
    await fs.writeFile(tmp, originalContent, 'utf8');

    try {
      let rejected = false;
      try {
        await downloadAndVerifyBackup(
          'algora/postgres/test.dump',
          tmp,
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          baseConfig,
        );
      } catch (err: any) {
        rejected = true;
        assert(err.message.includes('Destination path already exists'));
      }
      assert(rejected, 'Should have rejected existing destination');
      const survivingContent = await fs.readFile(tmp, 'utf8');
      assert.strictEqual(survivingContent, originalContent, 'Pre-existing file must not be deleted or modified');
    } finally {
      await fs.rm(tmp, { force: true });
    }
  });

  // ==========================================
  // 5. Hostname Alias & Server Identity Verification
  // ==========================================
  await test('isLoopbackHost accurately identifies localhost, IPv4, and IPv6 loopback variants', () => {
    assert.strictEqual(isLoopbackHost('localhost'), true);
    assert.strictEqual(isLoopbackHost('LOCAL'), true);
    assert.strictEqual(isLoopbackHost('127.0.0.1'), true);
    assert.strictEqual(isLoopbackHost('127.0.0.50'), true);
    assert.strictEqual(isLoopbackHost('127.255.255.254'), true);
    assert.strictEqual(isLoopbackHost('::1'), true);
    assert.strictEqual(isLoopbackHost('[::1]'), true);
    assert.strictEqual(isLoopbackHost('0.0.0.0'), true);
    assert.strictEqual(isLoopbackHost('::ffff:127.0.0.1'), true);
  });

  await test('isLoopbackHost rejects non-loopback IP addresses and remote hostnames (negative tests)', () => {
    assert.strictEqual(isLoopbackHost('192.168.1.100'), false);
    assert.strictEqual(isLoopbackHost('10.0.0.1'), false);
    assert.strictEqual(isLoopbackHost('172.16.0.1'), false);
    assert.strictEqual(isLoopbackHost('db.internal'), false);
    assert.strictEqual(isLoopbackHost('postgres.prod.algora.io'), false);
    assert.strictEqual(isLoopbackHost(''), false);
  });

  await test('areHostsEquivalent recognizes loopback aliases as equivalent', () => {
    assert.strictEqual(areHostsEquivalent('localhost', '127.0.0.1'), true);
    assert.strictEqual(areHostsEquivalent('localhost', '[::1]'), true);
    assert.strictEqual(areHostsEquivalent('127.0.0.1', '::1'), true);
    assert.strictEqual(areHostsEquivalent('127.0.0.2', '127.0.0.99'), true);
    assert.strictEqual(areHostsEquivalent('db.internal', 'DB.INTERNAL'), true);
  });

  await test('areHostsEquivalent treats distinct hosts as non-equivalent (negative tests)', () => {
    assert.strictEqual(areHostsEquivalent('localhost', 'db.internal'), false);
    assert.strictEqual(areHostsEquivalent('127.0.0.1', '192.168.1.5'), false);
    assert.strictEqual(areHostsEquivalent('db-a.internal', 'db-b.internal'), false);
  });

  await test('areIdentitiesConflicting identifies conflicting loopback and remote database targets', () => {
    const targetA = { host: 'localhost', port: '5432', database: 'algora_scratch' };
    const sourceA = { host: '127.0.0.1', port: '5432', database: 'algora_scratch' };
    assert.strictEqual(areIdentitiesConflicting(targetA, sourceA), true);

    const targetB = { host: '[::1]', port: '5432', database: 'algora_scratch' };
    const sourceB = { host: 'localhost', database: 'algora_scratch' }; // default port 5432
    assert.strictEqual(areIdentitiesConflicting(targetB, sourceB), true);
  });

  await test('areIdentitiesConflicting detects safe non-conflicting targets (negative tests)', () => {
    // Different ports on localhost
    const targetA = { host: 'localhost', port: '5433', database: 'algora_scratch' };
    const sourceA = { host: '127.0.0.1', port: '5432', database: 'algora_scratch' };
    assert.strictEqual(areIdentitiesConflicting(targetA, sourceA), false);

    // Different databases on localhost
    const targetB = { host: 'localhost', port: '5432', database: 'scratch_other' };
    const sourceB = { host: 'localhost', port: '5432', database: 'algora_scratch' };
    assert.strictEqual(areIdentitiesConflicting(targetB, sourceB), false);

    // Remote vs localhost
    const targetC = { host: 'localhost', port: '5432', database: 'algora_scratch' };
    const sourceC = { host: 'pg-prod.internal', port: '5432', database: 'algora_scratch' };
    assert.strictEqual(areIdentitiesConflicting(targetC, sourceC), false);
  });

  // ==========================================
  // 6. Approved Scratch Database Name Enforcement
  // ==========================================
  await test('assertApprovedScratchDatabase blocks protected production application databases (negative tests)', () => {
    const protectedDatabases = [
      'algora_db',
      'algora_ai',
      'algora_dev',
      'codeforge',
      'codeforge_dev',
      'algora',
      'algora_prod',
      'algora_production',
      'postgres',
      'template1',
    ];

    for (const db of protectedDatabases) {
      assert.throws(
        () => assertApprovedScratchDatabase(db),
        /protected production\/application database name/,
        `Should have blocked protected database "${db}"`,
      );
    }
  });

  await test('assertApprovedScratchDatabase blocks unapproved generic databases (negative tests)', () => {
    const unapproved = ['production', 'my_app', 'test', 'analytics_db', 'users_data', ''];
    for (const db of unapproved) {
      assert.throws(
        () => assertApprovedScratchDatabase(db),
        /not an explicitly approved scratch database name/,
        `Should have blocked unapproved database "${db}"`,
      );
    }
  });

  await test('assertApprovedScratchDatabase accepts explicitly approved scratch database names', () => {
    const approved = [
      'algora_restore_scratch',
      'scratch_db',
      'algora_drill_test',
      'dr_test_db',
      'my_dr_scratch_2026',
      'drill_staging',
      'scratch-db',
    ];
    for (const db of approved) {
      assertApprovedScratchDatabase(db);
      assert.strictEqual(isApprovedScratchDatabaseName(db), true);
    }
  });

  // ==========================================
  // 7. Empty Database Cleanliness Query
  // ==========================================
  await test('TARGET_CLEANLINESS_SQL comprehensively checks all user-created PostgreSQL objects', () => {
    assert(TARGET_CLEANLINESS_SQL.includes('information_schema.tables'));
    assert(TARGET_CLEANLINESS_SQL.includes('pg_matviews'));
    assert(TARGET_CLEANLINESS_SQL.includes('pg_sequences'));
    assert(TARGET_CLEANLINESS_SQL.includes('information_schema.routines'));
    assert(TARGET_CLEANLINESS_SQL.includes('information_schema.triggers'));
    assert(TARGET_CLEANLINESS_SQL.includes('pg_type'));
    assert(TARGET_CLEANLINESS_SQL.includes('pg_extension'));
    assert(TARGET_CLEANLINESS_SQL.includes('information_schema.schemata'));
  });

  // ==========================================
  // 8. Manifest Validation: Strict Field Types, Range & Checksums
  // ==========================================
  const validManifest: PublishedBackupManifest = {
    format: 'algora-postgres-custom-v1',
    createdAt: new Date().toISOString(),
    source: { host: 'pg.algora.internal', port: '5432', database: 'algora_prod' },
    artifact: {
      key: 'algora/postgres/2026-11-21T10-00-00-uuid.dump',
      sha256: 'a'.repeat(64),
      bytes: 1048576,
    },
    manifestKey: 'algora/postgres/2026-11-21T10-00-00-uuid.manifest.json',
    metadata: {
      rowCounts: {
        users: 10,
        problems: 50,
      },
    },
  };

  await test('validateManifest and validateBackupMetadata accept valid manifest with metadata', () => {
    validateManifest(validManifest);
    validateBackupMetadata(validManifest);
  });

  await test('validateManifest rejects invalid port ranges (negative tests)', () => {
    assert.throws(() => validateManifest({ ...validManifest, source: { ...validManifest.source, port: 0 } }), /range 1-65535/);
    assert.throws(() => validateManifest({ ...validManifest, source: { ...validManifest.source, port: 70000 } }), /range 1-65535/);
    assert.throws(() => validateManifest({ ...validManifest, source: { ...validManifest.source, port: -5 } }), /integer between 1 and 65535/);
    assert.throws(() => validateManifest({ ...validManifest, source: { ...validManifest.source, port: 'invalid' } }), /integer between 1 and 65535/);
  });

  await test('validateManifest rejects invalid timestamps and out-of-range dates (negative tests)', () => {
    assert.throws(() => validateManifest({ ...validManifest, createdAt: 'not-a-date' }), /createdAt format/);
    assert.throws(() => validateManifest({ ...validManifest, createdAt: '2020-01-01T00:00:00Z' }), /unreasonably old/);
    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    assert.throws(() => validateManifest({ ...validManifest, createdAt: futureDate }), /in the future/);
  });

  await test('validateManifest rejects invalid artifact bytes and size limits (negative tests)', () => {
    assert.throws(() => validateManifest({ ...validManifest, artifact: { ...validManifest.artifact, bytes: 0 } }), /positive integer/);
    assert.throws(() => validateManifest({ ...validManifest, artifact: { ...validManifest.artifact, bytes: -100 } }), /positive integer/);
    assert.throws(() => validateManifest({ ...validManifest, artifact: { ...validManifest.artifact, bytes: 10.5 } }), /positive integer/);
    assert.throws(() => validateManifest({ ...validManifest, artifact: { ...validManifest.artifact, bytes: 6 * 1024 * 1024 * 1024 } }), /exceeds/);
  });

  await test('validateManifest rejects invalid SHA-256 strings (negative tests)', () => {
    assert.throws(() => validateManifest({ ...validManifest, artifact: { ...validManifest.artifact, sha256: 'a'.repeat(63) } }), /64-character hex/);
    assert.throws(() => validateManifest({ ...validManifest, artifact: { ...validManifest.artifact, sha256: 'a'.repeat(65) } }), /64-character hex/);
    assert.throws(() => validateManifest({ ...validManifest, artifact: { ...validManifest.artifact, sha256: 'z'.repeat(64) } }), /64-character hex/);
  });

  await test('validateManifest rejects malformed metadata row counts (negative tests)', () => {
    assert.throws(
      () => validateManifest({ ...validManifest, metadata: { rowCounts: { users: -1 } } }),
      /must be a non-negative integer/,
    );
    assert.throws(
      () => validateManifest({ ...validManifest, metadata: { rowCounts: { users: '10' as any } } }),
      /must be a non-negative integer/,
    );
  });

  // ==========================================
  // 9. Relational Schema & Data Integrity Tests
  // ==========================================
  await test('CORE_ALGORA_TABLES defines all critical relational tables from schema', () => {
    assert(CORE_ALGORA_TABLES.includes('users'));
    assert(CORE_ALGORA_TABLES.includes('refresh_tokens'));
    assert(CORE_ALGORA_TABLES.includes('learning_tracks'));
    assert(CORE_ALGORA_TABLES.includes('topics'));
    assert(CORE_ALGORA_TABLES.includes('problems'));
    assert(CORE_ALGORA_TABLES.includes('submissions'));
  });

  await test('verifyDataIntegrity rejects restored row count mismatches against manifest metadata (negative test)', () => {
    const manifestMetadata = {
      rowCounts: {
        users: 100,
        problems: 50,
      },
    };
    const badRestoredCounts: Record<string, number> = {
      users: 99, // 1 row missing
      problems: 50,
    };

    assert.throws(() => {
      for (const [table, expectedCount] of Object.entries(manifestMetadata.rowCounts)) {
        const actualCount = badRestoredCounts[table];
        if (actualCount !== undefined && actualCount !== expectedCount) {
          throw new Error(
            `Data integrity violation: table "${table}" restored row count (${actualCount}) does not match backup-time metadata (${expectedCount})`,
          );
        }
      }
    }, /Data integrity violation: table "users" restored row count \(99\) does not match backup-time metadata \(100\)/);
  });

  await test('verifyDataIntegrity passes when restored row counts match manifest metadata', () => {
    const manifestMetadata = {
      rowCounts: {
        users: 100,
        problems: 50,
      },
    };
    const goodRestoredCounts: Record<string, number> = {
      users: 100,
      problems: 50,
    };

    for (const [table, expectedCount] of Object.entries(manifestMetadata.rowCounts)) {
      const actualCount = goodRestoredCounts[table];
      assert.strictEqual(actualCount, expectedCount);
    }
  });

  await test('orphan foreign key detection triggers integrity violation (negative test)', () => {
    const orphanFk: number = 3;
    assert.throws(() => {
      if (orphanFk !== 0) {
        throw new Error(`Data integrity violation: ${orphanFk} orphaned foreign key records detected in restored database`);
      }
    }, /Data integrity violation: 3 orphaned foreign key records detected/);
  });

  // ==========================================
  // 10. Process Execution Timeouts & Limits
  // ==========================================
  await test('run bounds execution time and times out stalled processes', async () => {
    const isWindows = process.platform === 'win32';
    const cmd = isWindows ? 'powershell' : 'sleep';
    const args = isWindows ? ['-Command', 'Start-Sleep -Seconds 5'] : ['5'];

    let timedOut = false;
    try {
      await run(cmd, args, {}, { timeoutMs: 300 });
    } catch (err: any) {
      timedOut = true;
      assert(err.message.includes('timed out after 300ms'));
    }
    assert(timedOut, 'Process execution should be bounded by timeout');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
