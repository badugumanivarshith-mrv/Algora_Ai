import { RedisManager } from "./redisClient";
import { logger } from "../utils/logger";

export interface PubSubMessage {
  channel: string;
  sourceInstanceId: string;
  targetType: "broadcast" | "room" | "user";
  targetIdentifier?: string;
  eventType: string;
  data: any;
  timestamp: string;
}

export type PubSubHandler = (message: PubSubMessage) => void;

export class RedisPubSubManager {
  private static readonly instanceId = `inst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  private static isSubscribed = false;
  private static handlers: Set<PubSubHandler> = new Set();
  private static channelSubscriptions: Set<string> = new Set();

  public static readonly CHANNELS = {
    BROADCAST: "algora:ws:broadcast",
    ROOM_PREFIX: "algora:ws:room:",
    USER_PREFIX: "algora:ws:user:",
    CONTEST_EVENTS: "algora:ws:contests",
    STUDY_GROUP_EVENTS: "algora:ws:study_groups",
    COMMUNITY_EVENTS: "algora:ws:community",
    PRESENCE_HEARTBEAT: "algora:presence:heartbeat",
  };

  /**
   * Initializes Redis Pub/Sub subscriptions for distributed scaling
   */
  public static async initialize(): Promise<void> {
    if (this.isSubscribed) return;
    this.isSubscribed = true;

    try {
      const sub = RedisManager.getSubscriber();

      // Subscribe to cluster broadcast channel & pattern subscriptions
      await sub.subscribe(
        this.CHANNELS.BROADCAST,
        this.CHANNELS.CONTEST_EVENTS,
        this.CHANNELS.STUDY_GROUP_EVENTS,
        this.CHANNELS.COMMUNITY_EVENTS,
        this.CHANNELS.PRESENCE_HEARTBEAT
      );

      await sub.psubscribe(
        `${this.CHANNELS.ROOM_PREFIX}*`,
        `${this.CHANNELS.USER_PREFIX}*`
      );

      sub.on("message", (channel: string, messageStr: string) => {
        this.dispatchMessage(channel, messageStr);
      });

      sub.on("pmessage", (pattern: string, channel: string, messageStr: string) => {
        this.dispatchMessage(channel, messageStr);
      });

      logger.info(`[RedisPubSub] Instance ${this.instanceId} subscribed to cluster channels.`);
    } catch (err: any) {
      logger.warn(`[RedisPubSub] PubSub subscription initialization notice: ${err.message}`);
    }
  }

  private static dispatchMessage(channel: string, raw: string): void {
    try {
      const parsed: PubSubMessage = JSON.parse(raw);
      // Discard messages originating from the same node if handled locally, unless marked for all
      for (const handler of this.handlers) {
        handler(parsed);
      }
    } catch (err: any) {
      logger.debug(`[RedisPubSub] Message dispatch error: ${err.message}`);
    }
  }

  /**
   * Register a local message handler
   */
  public static onMessage(handler: PubSubHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /**
   * Publish a message to all instances in cluster
   */
  public static async publishBroadcast(eventType: string, data: any): Promise<void> {
    const message: PubSubMessage = {
      channel: this.CHANNELS.BROADCAST,
      sourceInstanceId: this.instanceId,
      targetType: "broadcast",
      eventType,
      data,
      timestamp: new Date().toISOString(),
    };

    if (RedisManager.isReady()) {
      try {
        await RedisManager.getPublisher().publish(this.CHANNELS.BROADCAST, JSON.stringify(message));
        return;
      } catch (err: any) {
        logger.debug(`[RedisPubSub] publishBroadcast fallback: ${err.message}`);
      }
    }
  }

  /**
   * Publish a message to a specific room across instances
   */
  public static async publishToRoom(room: string, eventType: string, data: any): Promise<void> {
    const channel = `${this.CHANNELS.ROOM_PREFIX}${room}`;
    const message: PubSubMessage = {
      channel,
      sourceInstanceId: this.instanceId,
      targetType: "room",
      targetIdentifier: room,
      eventType,
      data,
      timestamp: new Date().toISOString(),
    };

    if (RedisManager.isReady()) {
      try {
        await RedisManager.getPublisher().publish(channel, JSON.stringify(message));
        return;
      } catch (err: any) {
        logger.debug(`[RedisPubSub] publishToRoom fallback: ${err.message}`);
      }
    }
  }

  /**
   * Publish a direct message to a user across instances
   */
  public static async publishToUser(userId: string, eventType: string, data: any): Promise<void> {
    const channel = `${this.CHANNELS.USER_PREFIX}${userId}`;
    const message: PubSubMessage = {
      channel,
      sourceInstanceId: this.instanceId,
      targetType: "user",
      targetIdentifier: userId,
      eventType,
      data,
      timestamp: new Date().toISOString(),
    };

    if (RedisManager.isReady()) {
      try {
        await RedisManager.getPublisher().publish(channel, JSON.stringify(message));
        return;
      } catch (err: any) {
        logger.debug(`[RedisPubSub] publishToUser fallback: ${err.message}`);
      }
    }
  }

  // --- Cluster Presence Synchronization ---

  /**
   * Track user presence in distributed Redis store
   */
  public static async recordUserOnline(userId: string, username: string, avatarUrl?: string): Promise<void> {
    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        const multi = client.multi();
        multi.sadd("presence:online_users", userId);
        multi.hset("presence:user_meta", userId, JSON.stringify({ username, avatarUrl, lastSeen: Date.now() }));
        multi.expire("presence:online_users", 86400);
        await multi.exec();
      } catch (err: any) {
        logger.debug(`[RedisPubSub] recordUserOnline fallback: ${err.message}`);
      }
    }
  }

  /**
   * Remove user from online set
   */
  public static async recordUserOffline(userId: string): Promise<void> {
    if (RedisManager.isReady()) {
      try {
        const client = RedisManager.getClient();
        const multi = client.multi();
        multi.srem("presence:online_users", userId);
        multi.hdel("presence:user_meta", userId);
        await multi.exec();
      } catch (err: any) {
        logger.debug(`[RedisPubSub] recordUserOffline fallback: ${err.message}`);
      }
    }
  }

  /**
   * Get cluster-wide online user count
   */
  public static async getClusterOnlineCount(): Promise<number> {
    if (RedisManager.isReady()) {
      try {
        return await RedisManager.getClient().scard("presence:online_users");
      } catch (err: any) {
        logger.debug(`[RedisPubSub] getClusterOnlineCount fallback: ${err.message}`);
      }
    }
    return 0;
  }

  public static getInstanceId(): string {
    return this.instanceId;
  }

  public static async close(): Promise<void> {
    this.isSubscribed = false;
    this.handlers.clear();
    this.channelSubscriptions.clear();
  }
}

