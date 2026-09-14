import Redis, { RedisOptions } from "ioredis";
import { config } from "../config/env";
import { logger } from "../utils/logger";

export interface RedisHealthMetrics {
  status: "connected" | "connecting" | "reconnecting" | "fallback_memory" | "error";
  isHealthy: boolean;
  latencyMs: number;
  uptimeSeconds?: number;
  usedMemoryBytes?: number;
  usedMemoryHuman?: string;
  connectedClients?: number;
  totalCommandsProcessed?: number;
  pubsubChannels?: number;
  keyCount?: number;
  role?: string;
}

export class RedisManager {
  private static instance: Redis | null = null;
  private static subscriberInstance: Redis | null = null;
  private static publisherInstance: Redis | null = null;
  private static isConnected: boolean = false;
  private static isInitialized: boolean = false;
  private static reconnectAttempts: number = 0;
  private static readonly maxReconnectAttempts: number = 20;

  // In-memory key-value cache fallback if Redis is temporarily unreachable
  private static memoryFallback: Map<string, { value: string; expiresAt?: number }> = new Map();

  public static getOptions(): RedisOptions {
    const baseOptions: RedisOptions = {
      maxRetriesPerRequest: config.redisMaxRetriesPerRequest,
      connectTimeout: config.redisConnectTimeout,
      keyPrefix: config.redisKeyPrefix,
      lazyConnect: false,
      enableOfflineQueue: true,
      retryStrategy(times) {
        RedisManager.reconnectAttempts = times;
        if (times > RedisManager.maxReconnectAttempts) {
          logger.warn(`[RedisManager] Max reconnect attempts (${RedisManager.maxReconnectAttempts}) reached. Continuing with resilient fallback.`);
          return null;
        }
        // Exponential backoff with jitter: min 100ms, max 3000ms
        const delay = Math.min(times * 150 + Math.floor(Math.random() * 100), 3000);
        logger.info(`[RedisManager] Reconnecting to Redis in ${delay}ms (attempt #${times})...`);
        return delay;
      },
    };

    if (config.redisUrl) {
      return {
        ...baseOptions,
      };
    }

    return {
      ...baseOptions,
      host: config.redisHost,
      port: config.redisPort,
      password: config.redisPassword,
      db: config.redisDb,
    };
  }

  /**
   * Initializes primary, publisher, and subscriber Redis connections
   */
  public static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      const options = this.getOptions();
      const createClient = (name: string): Redis => {
        const client = config.redisUrl
          ? new Redis(config.redisUrl, options)
          : new Redis(options);

        client.on("connect", () => {
          logger.info(`[RedisManager] ${name} connecting...`);
        });

        client.on("ready", () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          logger.info(`[RedisManager] ${name} connected and ready.`);
        });

        client.on("error", (err) => {
          logger.warn(`[RedisManager] ${name} connection notice: ${err.message}`);
        });

        client.on("close", () => {
          if (name === "Primary") this.isConnected = false;
          logger.warn(`[RedisManager] ${name} connection closed.`);
        });

        client.on("reconnecting", () => {
          logger.info(`[RedisManager] ${name} reconnecting...`);
        });

        return client;
      };

      this.instance = createClient("Primary");
      this.publisherInstance = createClient("Publisher");
      this.subscriberInstance = createClient("Subscriber");

      // Verify immediate ping with 1.5s timeout
      await Promise.race([
        this.instance.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Redis ping timeout")), 1500)),
      ]).catch((err) => {
        logger.warn(`[RedisManager] Initial ping test notice: ${err.message}. Ready fallback active.`);
      });
    } catch (err: any) {
      logger.warn(`[RedisManager] Initialization fallback active: ${err.message}`);
    }
  }

  /**
   * Primary Redis client instance
   */
  public static getClient(): Redis {
    if (!this.instance) {
      this.initialize();
    }
    return this.instance!;
  }

  /**
   * Dedicated Publisher client instance
   */
  public static getPublisher(): Redis {
    if (!this.publisherInstance) {
      this.initialize();
    }
    return this.publisherInstance!;
  }

  /**
   * Dedicated Subscriber client instance
   */
  public static getSubscriber(): Redis {
    if (!this.subscriberInstance) {
      this.initialize();
    }
    return this.subscriberInstance!;
  }

  /**
   * Duplicate client for isolated tasks/queues
   */
  public static createDuplicateClient(name: string): Redis {
    const options = this.getOptions();
    return config.redisUrl ? new Redis(config.redisUrl, options) : new Redis(options);
  }

  /**
   * Checks if Redis is ready
   */
  public static isReady(): boolean {
    return this.isConnected && this.instance?.status === "ready";
  }

  /**
   * Health metrics and telemetry
   */
  public static async getHealth(): Promise<RedisHealthMetrics> {
    const start = Date.now();
    if (!this.instance || this.instance.status !== "ready") {
      return {
        status: this.instance?.status as any || "fallback_memory",
        isHealthy: false,
        latencyMs: 0,
      };
    }

    try {
      const pong = await this.instance.ping();
      const latencyMs = Date.now() - start;

      let infoRaw = "";
      try {
        infoRaw = await this.instance.info();
      } catch {
        // ignore
      }

      const getVal = (regex: RegExp): string | undefined => {
        const match = infoRaw.match(regex);
        return match ? match[1].trim() : undefined;
      };

      const uptimeSeconds = Number(getVal(/uptime_in_seconds:(\d+)/)) || 0;
      const usedMemoryBytes = Number(getVal(/used_memory:(\d+)/)) || 0;
      const usedMemoryHuman = getVal(/used_memory_human:([^\r\n]+)/) || "0B";
      const connectedClients = Number(getVal(/connected_clients:(\d+)/)) || 1;
      const totalCommandsProcessed = Number(getVal(/total_commands_processed:(\d+)/)) || 0;
      const pubsubChannels = Number(getVal(/pubsub_channels:(\d+)/)) || 0;
      const role = getVal(/role:([^\r\n]+)/) || "master";

      let keyCount = 0;
      try {
        const dbsize = await this.instance.dbsize();
        keyCount = dbsize;
      } catch {
        keyCount = 0;
      }

      return {
        status: "connected",
        isHealthy: pong === "PONG",
        latencyMs,
        uptimeSeconds,
        usedMemoryBytes,
        usedMemoryHuman,
        connectedClients,
        totalCommandsProcessed,
        pubsubChannels,
        keyCount,
        role,
      };
    } catch (err: any) {
      return {
        status: "error",
        isHealthy: false,
        latencyMs: Date.now() - start,
      };
    }
  }

  /**
   * Safe Getter with fallback
   */
  public static async get(key: string): Promise<string | null> {
    if (this.isReady()) {
      try {
        return await this.getClient().get(key);
      } catch (err) {
        logger.debug(`[RedisManager] get fallback: ${err}`);
      }
    }
    const item = this.memoryFallback.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryFallback.delete(key);
      return null;
    }
    return item.value;
  }

  /**
   * Safe Setter with optional TTL in seconds
   */
  public static async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (this.isReady()) {
      try {
        if (ttlSeconds && ttlSeconds > 0) {
          await this.getClient().set(key, value, "EX", ttlSeconds);
        } else {
          await this.getClient().set(key, value);
        }
        return true;
      } catch (err) {
        logger.debug(`[RedisManager] set fallback: ${err}`);
      }
    }
    this.memoryFallback.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
    return true;
  }

  /**
   * Safe Deletion
   */
  public static async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    if (this.isReady()) {
      try {
        return await this.getClient().del(...keys);
      } catch (err) {
        logger.debug(`[RedisManager] del fallback: ${err}`);
      }
    }
    let count = 0;
    for (const k of keys) {
      if (this.memoryFallback.delete(k)) count++;
    }
    return count;
  }

  /**
   * Graceful disconnection on shutdown
   */
  public static async close(): Promise<void> {
    logger.info("[RedisManager] Closing Redis connections...");
    const clients = [this.instance, this.publisherInstance, this.subscriberInstance].filter(Boolean) as Redis[];
    await Promise.all(
      clients.map((c) =>
        c.quit().catch(() => {
          c.disconnect();
        })
      )
    );
    this.isConnected = false;
    logger.info("[RedisManager] Redis connections successfully closed.");
  }
}
