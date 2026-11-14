# Algora PostgreSQL S3 backup / isolated restore

This branch adds an **explicit operator-run** backup and restore path. It is not wired into web-server startup, production routes, or a scheduler.

## Required runtime

- Node dependencies already installed (`npm ci`).
- PostgreSQL client tools: `pg_dump`, `pg_restore`, and `psql` on PATH.
- An S3 bucket with Block Public Access enabled and versioning enabled.
- Runtime environment variables: `AWS_S3_BACKUP_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`; set `AWS_SESSION_TOKEN` when using temporary credentials.
- Use a dedicated IAM principal restricted to `s3:PutObject` and `s3:GetObject` on `arn:aws:s3:::BUCKET/algora/postgres/*`. Do not grant delete or bucket-administration permissions to the application principal.
- Configure S3 lifecycle retention and, where required, replication to a separately administered account/region. The code sets SSE-S3 on each object; bucket policy should deny non-TLS requests.

The current transport uses signed single-part S3 PUT/GET requests and supports objects up to 5 GiB. Multipart upload and automatic credential discovery (instance/task roles) are not implemented. Inject short-lived credentials securely; never commit secrets or place them in source control.

## Create a backup

Run from the isolated implementation branch/deployment environment:

```sh
DR_ALLOW_BACKUP=true npm run dr:backup
```

The command reads `DATABASE_URL`, creates a full PostgreSQL custom-format dump, checks that `pg_restore --list` can read it, uploads the dump and a JSON manifest, and prints both the manifest and its SHA-256. The database password is passed through `PGPASSWORD`, not a process argument. Keep the printed manifest checksum with the incident/run record.

## Run an isolated restore drill

1. Download the manifest named by `manifest.manifestKey` from S3 to a protected local file, for example with `aws s3 cp`.
2. Provision a **new, empty scratch PostgreSQL database** that is isolated from production. Do not point this at the production database.
3. Set `DR_TARGET_DATABASE_URL` to that scratch database URL and configure the same S3 credentials.
4. Compare the local manifest with the checksum printed by the backup command, then run:

```sh
DR_ALLOW_RESTORE=true DR_TARGET_DATABASE_URL='postgresql://...' \
  npm run dr:restore-drill -- ./backup.manifest.json MANIFEST_SHA256
```

The drill verifies the manifest checksum, downloads and verifies the dump SHA-256, checks the archive, refuses a non-empty target, restores in one transaction without dropping existing objects, and reports table, foreign-key, user-row, problem-row counts and elapsed time. The target must not match the source identity recorded in the manifest.

A passing drill proves this one backup can be restored to this isolated target; it does not by itself prove host-loss protection, application-level correctness, a measured production RPO/RTO, or cross-account durability. Those depend on bucket replication, retention, credentials, infrastructure and separate application smoke tests.
