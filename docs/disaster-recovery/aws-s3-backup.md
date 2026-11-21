# Algora PostgreSQL S3 backup / isolated restore

This branch adds an **explicit operator-run** backup and restore path. It is not wired into web-server startup, production routes, or a scheduler.

## Required runtime

- Node dependencies already installed (`npm ci`).
- PostgreSQL client tools: `pg_dump`, `pg_restore`, and `psql` on PATH.
- An S3 bucket with Block Public Access enabled and versioning enabled.
- Runtime environment variables: `AWS_S3_BACKUP_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`; set `AWS_SESSION_TOKEN` when using temporary credentials. Optional: `AWS_ENDPOINT_URL_S3` (or `AWS_ENDPOINT_URL`) for custom/VPC endpoints and `AWS_S3_FORCE_PATH_STYLE=true`.
- S3 bucket naming: DNS-compliant names (3-63 characters, lowercase alphanumeric and hyphens/dots). Buckets containing dots automatically use path-style S3 addressing (`s3.REGION.amazonaws.com/BUCKET/...`) to maintain TLS certificate validation against AWS wildcard certificates.
- Use a dedicated IAM principal restricted to `s3:PutObject` and `s3:GetObject` on `arn:aws:s3:::BUCKET/algora/postgres/*`. Do not grant delete or bucket-administration permissions to the application principal.
- Configure S3 lifecycle retention and, where required, replication to a separately administered account/region. The code sets SSE-S3 on each object; bucket policy should deny non-TLS requests.

The current transport uses signed single-part S3 PUT/GET requests and supports objects up to 5 GiB with bounded error-response buffering (64 KiB), socket timeout handling (120s), and atomic temporary download file staging. All PostgreSQL subprocesses are bounded by a 5-minute timeout and capped stream buffers. Multipart upload and automatic credential discovery (instance/task roles) are not implemented. Inject short-lived credentials securely; never commit secrets or place them in source control.

## Create a backup

Run from the isolated implementation branch/deployment environment:

```sh
DR_ALLOW_BACKUP=true npm run dr:backup
```

The command reads `DATABASE_URL`, creates a full PostgreSQL custom-format dump, checks that `pg_restore --list` can read it (under a sanitized child-process environment), validates backup metadata, uploads the dump and a JSON manifest, and prints both the manifest and its SHA-256. The database password is passed through `PGPASSWORD`, not a process argument. If manifest publication fails after a dump is uploaded, the error reports the orphaned S3 dump key and checksum for operator inspection. Keep the printed manifest checksum with the incident/run record.

## Run an isolated restore drill

1. Download the manifest named by `manifest.manifestKey` from S3 to a protected local file, for example with `aws s3 cp`.
2. Provision a **new, empty scratch PostgreSQL database** that is isolated from production. Do not point this at the production database.
3. Set `DR_TARGET_DATABASE_URL` to that scratch database URL and configure the same S3 credentials.
4. Compare the local manifest with the checksum printed by the backup command, then run:

```sh
DR_ALLOW_RESTORE=true DR_TARGET_DATABASE_URL='postgresql://...' \
  npm run dr:restore-drill -- ./backup.manifest.json MANIFEST_SHA256
```

The drill:
- Validates all manifest fields, source identity, and artifact S3 key constraints.
- Verifies the local manifest SHA-256.
- Verifies target database isolation (rejects matching source or `DATABASE_URL` host, port, and database).
- Downloads the dump into a temporary staging file, verifies SHA-256, and cleans up partial downloads safely without touching pre-existing files.
- Checks the archive structure with `pg_restore --list` under a sanitized environment.
- Refuses non-empty target databases (validating zero existing tables, views, sequences, routines, user types, or non-standard schemas).
- Restores in one transaction without dropping existing objects (`--single-transaction`, `--no-owner`, `--no-acl`, `--exit-on-error`).
- Verifies core schema tables defined in Algora migrations (`users`, `refresh_tokens`, `learning_tracks`, `topics`, `problems`, `submissions`), foreign keys, and row counts within bounded timeouts.
- Reports status, verified tables, restored row counts, and elapsed execution time.

A passing drill proves this one backup can be restored to this isolated target; it does not by itself prove host-loss protection, application-level correctness, a measured production RPO/RTO, or cross-account durability. Those depend on bucket replication, retention, credentials, infrastructure and separate application smoke tests.
