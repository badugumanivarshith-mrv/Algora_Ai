/**
 * Algora disaster-recovery S3 transport.
 *
 * This module only transfers already-created backup artifacts. It does not
 * create database dumps, schedule backups, or restore a production database.
 * Credentials are supplied by the deployment environment; never commit them.
 */
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { createReadStream, createWriteStream, promises as fs } from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

export interface S3BackupConfig {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  endpoint?: string;
  forcePathStyle?: boolean;
}

export interface S3BackupObject {
  key: string;
  sha256: string;
  bytes: number;
  etag?: string;
}

const MAX_ERROR_BODY_BYTES = 64 * 1024; // 64 KiB memory bound for error responses
export const MAX_S3_SINGLE_PUT_BYTES = 5 * 1024 * 1024 * 1024; // 5 GiB S3 single-PUT limit

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function isAllowedS3BackupKey(key: string): boolean {
  return (
    typeof key === 'string' &&
    /^algora\/postgres\/[a-zA-Z0-9._-]+\.(dump|manifest\.json)$/.test(key) &&
    !key.includes('..') &&
    !key.startsWith('/')
  );
}

export function validateBucketName(bucket: string): void {
  // RFC 1123 / AWS DNS-compliant bucket naming rules: 3 to 63 characters
  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket)) {
    throw new Error('AWS_S3_BACKUP_BUCKET is not a valid DNS-compatible bucket name');
  }
  if (bucket.includes('..') || bucket.includes('.-') || bucket.includes('-.')) {
    throw new Error('AWS_S3_BACKUP_BUCKET contains invalid label separators');
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(bucket)) {
    throw new Error('AWS_S3_BACKUP_BUCKET must not be formatted as an IP address');
  }
}

export function validateEndpoint(endpoint?: string): URL | undefined {
  if (!endpoint) return undefined;
  try {
    const url = new URL(endpoint);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error(`S3 endpoint must use http or https protocol (got ${url.protocol})`);
    }
    return url;
  } catch (error) {
    if (error instanceof Error && error.message.includes('S3 endpoint must use')) throw error;
    throw new Error(`Invalid S3 endpoint URL: ${endpoint}`);
  }
}

export function getS3BackupConfig(): S3BackupConfig {
  const bucket = required('AWS_S3_BACKUP_BUCKET');
  const region = required('AWS_REGION');
  const accessKeyId = required('AWS_ACCESS_KEY_ID');
  const secretAccessKey = required('AWS_SECRET_ACCESS_KEY');
  validateBucketName(bucket);
  if (!/^[a-z0-9-]+$/.test(region)) {
    throw new Error(`Invalid AWS_REGION format: ${region}`);
  }
  const endpoint = process.env.AWS_ENDPOINT_URL_S3?.trim() || process.env.AWS_ENDPOINT_URL?.trim() || undefined;
  validateEndpoint(endpoint);
  const forcePathStyle = process.env.AWS_S3_FORCE_PATH_STYLE === 'true' || undefined;
  return {
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
    endpoint,
    forcePathStyle,
  };
}

function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

function hmac(key: Buffer | string, value: string, encoding?: 'hex'): Buffer | string {
  const digest = createHmac('sha256', key).update(value, 'utf8');
  return encoding ? digest.digest(encoding) : digest.digest();
}

function awsEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function canonicalPath(key: string): string {
  return '/' + key.split('/').map(awsEncode).join('/');
}

function signingKey(secret: string, date: string, region: string): Buffer {
  const dateKey = hmac(`AWS4${secret}`, date) as Buffer;
  const regionKey = hmac(dateKey, region) as Buffer;
  const serviceKey = hmac(regionKey, 's3') as Buffer;
  return hmac(serviceKey, 'aws4_request') as Buffer;
}

export function resolveTargetUrl(
  config: S3BackupConfig,
  key: string,
): {
  protocol: 'http:' | 'https:';
  hostname: string;
  port: number | undefined;
  path: string;
  hostHeader: string;
} {
  const parsedEndpoint = validateEndpoint(config.endpoint);
  const isDotted = config.bucket.includes('.');
  const usePathStyle = Boolean(config.forcePathStyle || isDotted || parsedEndpoint);

  if (parsedEndpoint) {
    const protocol = parsedEndpoint.protocol as 'http:' | 'https:';
    const hostname = parsedEndpoint.hostname;
    const port = parsedEndpoint.port ? Number(parsedEndpoint.port) : undefined;
    const hostHeader = parsedEndpoint.host; // Host header includes port when non-default
    const basePath = parsedEndpoint.pathname.replace(/\/+$/, '');
    const path = `${basePath}/${awsEncode(config.bucket)}${canonicalPath(key)}`;
    return { protocol, hostname, port, path, hostHeader };
  }

  const protocol = 'https:';
  if (usePathStyle) {
    // Dotted bucket or explicit path-style:
    // TLS wildcard certificates (*.s3.region.amazonaws.com) do not match bucket names containing dots.
    // Path-style addressing against s3.region.amazonaws.com preserves TLS certificate validation.
    const hostname = `s3.${config.region}.amazonaws.com`;
    const path = `/${awsEncode(config.bucket)}${canonicalPath(key)}`;
    return { protocol, hostname, port: undefined, path, hostHeader: hostname };
  }

  // Virtual-hosted style
  const hostname = `${config.bucket}.s3.${config.region}.amazonaws.com`;
  const path = canonicalPath(key);
  return { protocol, hostname, port: undefined, path, hostHeader: hostname };
}

export function signedHeaders(
  config: S3BackupConfig,
  method: 'PUT' | 'GET',
  key: string,
  payloadHash: string,
  extra: Record<string, string> = {},
): {
  protocol: 'http:' | 'https:';
  hostname: string;
  port: number | undefined;
  path: string;
  headers: Record<string, string>;
} {
  const target = resolveTargetUrl(config, key);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = amzDate.slice(0, 8);
  const headers: Record<string, string> = {
    host: target.hostHeader,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
    ...extra,
  };
  if (config.sessionToken) headers['x-amz-security-token'] = config.sessionToken;

  const names = Object.keys(headers).map((name) => name.toLowerCase()).sort();
  const canonicalHeaders = names.map((name) => `${name}:${headers[name].trim().replace(/\s+/g, ' ')}\n`).join('');
  const signedNames = names.join(';');
  const canonicalRequest = [
    method, target.path, '', canonicalHeaders, signedNames, payloadHash,
  ].join('\n');
  const scope = `${date}/${config.region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest),
  ].join('\n');
  const signature = hmac(signingKey(config.secretAccessKey, date, config.region), stringToSign, 'hex') as string;
  headers.Authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, SignedHeaders=${signedNames}, Signature=${signature}`;
  return {
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port,
    path: target.path,
    headers,
  };
}

export async function sha256File(filePath: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filePath)) hash.update(chunk as Buffer);
  return hash.digest('hex');
}

function responseError(status: number, body: string): Error {
  return new Error(`S3 request failed (HTTP ${status}): ${body.slice(0, 1000)}`);
}

/** Uploads a completed backup file using a signed, streaming S3 PutObject request. */
export async function uploadBackupFile(
  filePath: string,
  objectKey: string,
  config = getS3BackupConfig(),
): Promise<S3BackupObject> {
  if (!isAllowedS3BackupKey(objectKey)) {
    throw new Error(`S3 backup object key must be a safe relative key under algora/postgres/ (got "${objectKey}")`);
  }
  const stat = await fs.stat(filePath);
  if (!stat.isFile() || stat.size === 0) throw new Error('Backup artifact is missing or empty');
  if (stat.size > MAX_S3_SINGLE_PUT_BYTES) {
    throw new Error(`S3 single-PUT limit exceeded (5 GiB, file is ${stat.size} bytes); multipart upload is not implemented yet`);
  }
  const checksum = await sha256File(filePath);
  const payloadHash = checksum;
  const signed = signedHeaders(config, 'PUT', objectKey, payloadHash, {
    'content-length': String(stat.size),
    'content-type': 'application/octet-stream',
    'x-amz-meta-sha256': checksum,
    'x-amz-server-side-encryption': 'AES256',
  });

  const client = signed.protocol === 'http:' ? http : https;
  const result = await new Promise<{ etag?: string }>((resolve, reject) => {
    let settled = false;
    let timer: NodeJS.Timeout | undefined;

    const request = client.request({
      hostname: signed.hostname,
      port: signed.port,
      method: 'PUT',
      path: signed.path,
      headers: signed.headers,
    }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk: string) => {
        if (body.length < MAX_ERROR_BODY_BYTES) {
          body += chunk.slice(0, MAX_ERROR_BODY_BYTES - body.length);
        }
      });
      response.on('end', () => {
        if (timer) clearTimeout(timer);
        if (settled) return;
        settled = true;
        const status = response.statusCode || 0;
        if (status < 200 || status >= 300) reject(responseError(status, body));
        else resolve({ etag: response.headers.etag?.replace(/"/g, '') });
      });
    });

    const cleanupAndReject = (err: Error) => {
      if (timer) clearTimeout(timer);
      if (settled) return;
      settled = true;
      request.destroy();
      source.destroy();
      reject(err);
    };

    request.on('error', cleanupAndReject);
    request.setTimeout(120_000, () => {
      cleanupAndReject(new Error('S3 request socket timed out (idle for 120s)'));
    });

    const source = createReadStream(filePath);
    source.on('error', cleanupAndReject);
    source.pipe(request);
  });

  return { key: objectKey, sha256: checksum, bytes: stat.size, etag: result.etag };
}

/** Downloads an S3 object to a new local file and verifies its recorded SHA-256. */
export async function downloadAndVerifyBackup(
  objectKey: string,
  destinationPath: string,
  expectedSha256: string,
  config = getS3BackupConfig(),
): Promise<S3BackupObject> {
  if (!isAllowedS3BackupKey(objectKey)) {
    throw new Error(`S3 backup object key must be a safe relative key under algora/postgres/ (got "${objectKey}")`);
  }
  if (!/^[a-f0-9]{64}$/i.test(expectedSha256)) throw new Error('Expected SHA-256 must be 64 hexadecimal characters');

  // Guard against overwriting or deleting pre-existing files
  try {
    await fs.access(destinationPath);
    throw new Error(`Destination path already exists: ${destinationPath}`);
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error;
  }

  const destDir = path.dirname(path.resolve(destinationPath));
  await fs.mkdir(destDir, { recursive: true });

  const tempPath = `${destinationPath}.part-${Date.now()}-${randomUUID().slice(0, 8)}`;
  let tempCreated = false;

  const signed = signedHeaders(config, 'GET', objectKey, sha256(Buffer.alloc(0)));
  let bytes = 0;
  let remoteChecksum = '';
  const client = signed.protocol === 'http:' ? http : https;

  try {
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      let timer: NodeJS.Timeout | undefined;

      const request = client.request({
        hostname: signed.hostname,
        port: signed.port,
        method: 'GET',
        path: signed.path,
        headers: signed.headers,
      }, async (response) => {
        const status = response.statusCode || 0;
        if (status !== 200) {
          let body = '';
          response.setEncoding('utf8');
          response.on('data', (chunk: string) => {
            if (body.length < MAX_ERROR_BODY_BYTES) {
              body += chunk.slice(0, MAX_ERROR_BODY_BYTES - body.length);
            }
          });
          response.on('end', () => {
            if (timer) clearTimeout(timer);
            if (settled) return;
            settled = true;
            reject(responseError(status, body));
          });
          return;
        }

        remoteChecksum = String(response.headers['x-amz-meta-sha256'] || '');
        bytes = Number(response.headers['content-length'] || 0);

        try {
          tempCreated = true;
          const writeStream = createWriteStream(tempPath, { flags: 'wx' });
          await pipeline(response, writeStream);
          if (timer) clearTimeout(timer);
          if (settled) return;
          settled = true;
          resolve();
        } catch (pipeError) {
          if (timer) clearTimeout(timer);
          if (settled) return;
          settled = true;
          reject(pipeError);
        }
      });

      const cleanupAndReject = (err: Error) => {
        if (timer) clearTimeout(timer);
        if (settled) return;
        settled = true;
        request.destroy();
        reject(err);
      };

      request.on('error', cleanupAndReject);
      request.setTimeout(120_000, () => {
        cleanupAndReject(new Error('S3 request socket timed out (idle for 120s)'));
      });
      request.end();
    });

    const actual = await sha256File(tempPath);
    if (actual.toLowerCase() !== expectedSha256.toLowerCase()) {
      throw new Error(`Downloaded backup SHA-256 does not match expected checksum: got ${actual}, expected ${expectedSha256}`);
    }
    if (remoteChecksum && actual.toLowerCase() !== remoteChecksum.toLowerCase()) {
      throw new Error(`Downloaded backup SHA-256 does not match S3 object metadata: got ${actual}, header had ${remoteChecksum}`);
    }

    // Atomically move verified download to final destination
    await fs.rename(tempPath, destinationPath);
    tempCreated = false;

    const finalSize = (await fs.stat(destinationPath)).size;
    return { key: objectKey, sha256: actual, bytes: bytes || finalSize };
  } finally {
    if (tempCreated) {
      await fs.rm(tempPath, { force: true }).catch(() => undefined);
    }
  }
}
