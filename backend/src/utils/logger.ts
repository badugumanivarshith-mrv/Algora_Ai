import { Request, Response, NextFunction } from "express";

export const logger = {
  info: (msg: string, ...args: any[]) => console.log(`\x1b[34m[INFO]\x1b[0m ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`\x1b[33m[WARN]\x1b[0m ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`, ...args),
  debug: (msg: string, ...args: any[]) => console.log(`\x1b[36m[DEBUG]\x1b[0m ${msg}`, ...args),
};

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? "\x1b[31m" : status >= 400 ? "\x1b[33m" : status >= 300 ? "\x1b[36m" : "\x1b[32m";
    const reset = "\x1b[0m";
    console.log(
      `[${new Date().toISOString()}] ${method} ${originalUrl} ${color}${status}${reset} - ${duration}ms (${ip})`
    );
  });

  next();
}
