/**
 * Algora disaster-recovery S3 transport.
 *
 * This module only transfers already-created backup artifacts. It does not
 * create database dumps, schedule backups, or restore a production database.
 * Credentials are supplied by the deployment environment; never commit them.
 */
import { createHash, createHmac } from 'node:crypto';
import { createReadStream, createWriteStream, promises as fs } from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

export interface S3BackupConfig {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

export interface S3BackupObject {
  key: string;
  sha256: string;
  bytes: number;
  etag?: string;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getS3BackupConfig(): S3BackupConfig {
  const bucket = required('AWS_S3_BACKUP_BUCKET');
  const region = required('AWS_REGION');
  const accessKeyId = required('AWS_ACCESS_KEY_ID');
  const secretAccessKey = required('AWS_SECRET_ACCESS_KEY');
  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket) || bucket.includes('..')) {
    throw new Error('AWS_S3_BACKUP_BUCKET is not a valid DNS-compatible bucket name');
  }
  return {
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
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

function signedHeaders(
  config: S3BackupConfig,
  method: 'PUT' | 'GET',
  key: string,
  payloadHash: string,
  extra: Record<string, string> = {},
): { hostname: string; path: string; headers: Record<string, string> } {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = amzDate.slice(0, 8);
  const hostname = `${config.bucket}.s3.${config.region}.amazonaws.com`;
  const path = canonicalPath(key);
  const headers: Record<string, string> = {
    host: hostname,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
    ...extra,
  };
  if (config.sessionToken) headers['x-amz-security-token'] = config.sessionToken;

  const names = Object.keys(headers).map((name) => name.toLowerCase()).sort();
  const canonicalHeaders = names.map((name) => `${name}:${headers[name].trim().replace(/\s+/g, ' ')}`).join('\n');
  const signedNames = names.join(';');
  const canonicalRequest = [
    method, path, '', canonicalHeaders, signedNames, payloadHash,
  ].join('\n');
  const scope = `${date}/${config.region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest),
  ].join('\n');
  const signature = hmac(signingKey(config.secretAccessKey, date, config.region), stringToSign, 'hex') as string;
  headers.Authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, SignedHeaders=${signedNames}, Signature=${signature}`;
  return { hostname, path, headers };
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
  if (!objectKey || objectKey.startsWith('/') || objectKey.split('/').includes('..')) {
    throw new Error('S3 backup object key must be a safe relative key');
  }
  const stat = await fs.stat(filePath);
  if (!stat.isFile() || stat.size === 0) throw new Error('Backup artifact is missing or empty');
  const checksum = await sha256File(filePath);
  const payloadHash = checksum;
  const signed = signedHeaders(config, 'PUT', objectKey, payloadHash, {
    'content-length': String(stat.size),
    'content-type': 'application/octet-stream',
    'x-amz-meta-sha256': checksum,
    'x-amz-server-side-encryption': 'AES256',
  });

  const result = await new Promise<{ etag?: string }>((resolve, reject) => {
    const request = https.request({
      hostname: signed.hostname, method: 'PUT', path: signed.path, headers: signed.headers,
    }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        const status = response.statusCode || 0;
        if (status < 200 || status >= 300) reject(responseError(status, body));
        else resolve({ etag: response.headers.etag?.replace(/"/g, '') });
      });
    });
    request.on('error', reject);
    const source = createReadStream(filePath);
    source.on('error', (error) => request.destroy(error));
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
  if (!objectKey || objectKey.startsWith('/') || objectKey.split('/').includes('..')) {
    throw new Error('S3 backup object key must be a safe relative key');
  }
  if (!/^[a-f0-9]{64}$/i.test(expectedSha256)) throw new Error('Expected SHA-256 must be 64 hexadecimal characters');
  await fs.mkdir(path.dirname(path.resolve(destinationPath)), { recursive: true });
  const signed = signedHeaders(config, 'GET', objectKey, sha256(Buffer.alloc(0)));
  let bytes = 0;
  let remoteChecksum = '';

  await new Promise<void>((resolve, reject) => {
    const request = https.request({
      hostname: signed.hostname, method: 'GET', path: signed.path, headers: signed.headers,
    }, async (response) => {
      if (response.statusCode !== 200) {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => reject(responseError(response.statusCode || 0, body)));
        return;
      }
      remoteChecksum = String(response.headers['x-amz-meta-sha256'] || '');
      bytes = Number(response.headers['content-length'] || 0);
      try {
        await pipeline(response, createWriteStream(destinationPath, { flags: 'wx' }));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
    request.end();
  });

  try {
    const actual = await sha256File(destinationPath);
    if (actual.toLowerCase() !== expectedSha256.toLowerCase()) {
      throw new Error('Downloaded backup SHA-256 does not match the expected checksum');
    }
    if (remoteChecksum && actual.toLowerCase() !== remoteChecksum.toLowerCase()) {
      throw new Error('Downloaded backup SHA-256 does not match S3 object metadata');
    }
    return { key: objectKey, sha256: actual, bytes: bytes || (await fs.stat(destinationPath)).size };
  } catch (error) {
    await fs.rm(destinationPath, { force: true }).catch(() => undefined);
    throw error;
  }
}
