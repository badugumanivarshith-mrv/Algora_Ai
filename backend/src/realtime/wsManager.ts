import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage, Server as HttpServer } from "http";
import { logger } from "../utils/logger";
import { RedisPubSubManager, PubSubMessage } from "../redis/pubsub";

export interface WSMessagePayload {
  type: string;
  room?: string;
  data?: any;
  timestamp?: string;
}

export interface ClientConnection {
  ws: WebSocket;
  userId?: string;
  username?: string;
  avatarUrl?: string;
  rooms: Set<string>;
  lastPing: number;
}

export class WebSocketManager {
  private static wss: WebSocketServer | null = null;
  private static clients: Map<WebSocket, ClientConnection> = new Map();
  private static roomSubscribers: Map<string, Set<WebSocket>> = new Map();

  public static initialize(server: HttpServer): void {
    if (this.wss) return;

    // Initialize Redis PubSub listeners
    RedisPubSubManager.initialize().catch((err) => {
      logger.warn(`[WebSocket] Redis PubSub initialization warning: ${err.message}`);
    });

    // Handle incoming messages from other cluster instances
    RedisPubSubManager.onMessage((msg: PubSubMessage) => {
      // If message came from another node, deliver to matching local connections
      if (msg.targetType === "broadcast") {
        this.localBroadcastAll(msg.eventType, msg.data);
      } else if (msg.targetType === "room" && msg.targetIdentifier) {
        this.localBroadcast(msg.targetIdentifier, msg.eventType, msg.data);
      } else if (msg.targetType === "user" && msg.targetIdentifier) {
        this.localBroadcast(`user:${msg.targetIdentifier}`, msg.eventType, msg.data);
      }
    });

    this.wss = new WebSocketServer({
      server,
      path: "/ws",
      clientTracking: true,
    });

    this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
      const client: ClientConnection = {
        ws,
        rooms: new Set<string>(["global", "presence"]),
        lastPing: Date.now(),
      };

      this.clients.set(ws, client);
      this.subscribeRoom(ws, "global");
      this.subscribeRoom(ws, "presence");

      logger.info(`[WebSocket] New client connected. Total clients on this node: ${this.clients.size}`);

      // Send initial welcome & presence state
      this.send(ws, {
        type: "CONNECTED",
        data: {
          onlineCount: this.clients.size,
          timestamp: new Date().toISOString(),
        },
      });

      // Broadcast updated presence
      this.broadcast("presence", "PRESENCE_UPDATE", {
        onlineCount: this.clients.size,
      });

      ws.on("message", (raw: string) => {
        try {
          const parsed: WSMessagePayload = JSON.parse(raw.toString());
          this.handleClientMessage(ws, parsed);
        } catch (err: any) {
          logger.warn(`[WebSocket] Invalid message format: ${err.message}`);
        }
      });

      ws.on("close", () => {
        this.handleDisconnect(ws);
      });

      ws.on("error", (err) => {
        logger.error(`[WebSocket] Client error: ${err.message}`);
        this.handleDisconnect(ws);
      });
    });

    // Heartbeat check every 30s
    setInterval(() => {
      const now = Date.now();
      for (const [ws, client] of this.clients.entries()) {
        if (ws.readyState === WebSocket.OPEN) {
          if (now - client.lastPing > 60000) {
            ws.terminate();
            this.handleDisconnect(ws);
          } else {
            ws.ping();
          }
        }
      }
    }, 30000);

    logger.info("[WebSocket] Real-time engine initialized on path /ws with Redis Pub/Sub scaling");
  }

  private static handleClientMessage(ws: WebSocket, payload: WSMessagePayload): void {
    const client = this.clients.get(ws);
    if (!client) return;
    client.lastPing = Date.now();

    switch (payload.type) {
      case "AUTH":
        if (payload.data?.userId) {
          client.userId = payload.data.userId;
          client.username = payload.data.username || "User";
          client.avatarUrl = payload.data.avatarUrl;
          this.subscribeRoom(ws, `user:${client.userId}`);

          // Register in distributed presence store
          RedisPubSubManager.recordUserOnline(client.userId, client.username, client.avatarUrl).catch(() => {});

          this.broadcast("presence", "USER_ONLINE", {
            userId: client.userId,
            username: client.username,
            avatarUrl: client.avatarUrl,
            onlineCount: this.clients.size,
          });
        }
        break;

      case "SUBSCRIBE_ROOM":
        if (payload.room) {
          this.subscribeRoom(ws, payload.room);
          this.send(ws, {
            type: "ROOM_SUBSCRIBED",
            room: payload.room,
            data: { status: "ok" },
          });
        }
        break;

      case "UNSUBSCRIBE_ROOM":
        if (payload.room) {
          this.unsubscribeRoom(ws, payload.room);
        }
        break;

      case "GROUP_CHAT_MESSAGE":
        if (payload.room && payload.data) {
          // Broadcast to group members across cluster
          this.broadcast(payload.room, "GROUP_CHAT_MESSAGE", {
            ...payload.data,
            timestamp: new Date().toISOString(),
          });
        }
        break;

      case "TYPING_INDICATOR":
        if (payload.room) {
          this.broadcast(payload.room, "TYPING_INDICATOR", {
            userId: client.userId,
            username: client.username || payload.data?.username,
            isTyping: payload.data?.isTyping,
          });
        }
        break;

      case "PING":
        this.send(ws, { type: "PONG", data: { time: Date.now() } });
        break;

      default:
        // Generic forward to room if room specified
        if (payload.room) {
          this.broadcast(payload.room, payload.type, payload.data);
        }
        break;
    }
  }

  private static subscribeRoom(ws: WebSocket, room: string): void {
    const client = this.clients.get(ws);
    if (!client) return;

    client.rooms.add(room);
    if (!this.roomSubscribers.has(room)) {
      this.roomSubscribers.set(room, new Set());
    }
    this.roomSubscribers.get(room)!.add(ws);
  }

  private static unsubscribeRoom(ws: WebSocket, room: string): void {
    const client = this.clients.get(ws);
    if (client) {
      client.rooms.delete(room);
    }
    const subs = this.roomSubscribers.get(room);
    if (subs) {
      subs.delete(ws);
      if (subs.size === 0) {
        this.roomSubscribers.delete(room);
      }
    }
  }

  private static handleDisconnect(ws: WebSocket): void {
    const client = this.clients.get(ws);
    if (client) {
      for (const room of client.rooms) {
        this.unsubscribeRoom(ws, room);
      }
      const leavingUserId = client.userId;
      const leavingUsername = client.username;
      this.clients.delete(ws);

      if (leavingUserId) {
        RedisPubSubManager.recordUserOffline(leavingUserId).catch(() => {});
        this.broadcast("presence", "USER_OFFLINE", {
          userId: leavingUserId,
          username: leavingUsername,
          onlineCount: this.clients.size,
        });
      }
    }
    logger.info(`[WebSocket] Client disconnected. Total active on node: ${this.clients.size}`);
  }

  public static send(ws: WebSocket, payload: WSMessagePayload): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }

  /**
   * Broadcasts to all subscribers of a room across all cluster instances
   */
  public static broadcast(room: string, eventType: string, data: any): void {
    // 1. Deliver to local node clients
    this.localBroadcast(room, eventType, data);
    // 2. Publish to Redis Pub/Sub for other nodes
    RedisPubSubManager.publishToRoom(room, eventType, data).catch(() => {});
  }

  /**
   * Local delivery only (to prevent infinite loops on pubsub receipt)
   */
  private static localBroadcast(room: string, eventType: string, data: any): void {
    const subscribers = this.roomSubscribers.get(room);
    if (!subscribers || subscribers.size === 0) return;

    const msg = JSON.stringify({
      type: eventType,
      room,
      data,
      timestamp: new Date().toISOString(),
    });

    for (const ws of subscribers) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    }
  }

  /**
   * Sends targeted event to a specific user across cluster
   */
  public static sendToUser(userId: string, eventType: string, data: any): void {
    this.localBroadcast(`user:${userId}`, eventType, data);
    RedisPubSubManager.publishToUser(userId, eventType, data).catch(() => {});
  }

  /**
   * Broadcasts to all connected clients across entire cluster
   */
  public static broadcastAll(eventType: string, data: any): void {
    this.localBroadcastAll(eventType, data);
    RedisPubSubManager.publishBroadcast(eventType, data).catch(() => {});
  }

  private static localBroadcastAll(eventType: string, data: any): void {
    const msg = JSON.stringify({
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
    });

    for (const [ws] of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    }
  }

  public static getOnlineCount(): number {
    return this.clients.size;
  }
}

