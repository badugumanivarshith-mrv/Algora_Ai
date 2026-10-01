/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Enterprise Client-Side SSE Service
 * Standardized Single Real-Time Transport (100% WebSockets Removed)
 */

export type SSEEventType =
  | "notification"
  | "community_post"
  | "community_comment"
  | "contest_update"
  | "leaderboard_update"
  | "placement_drive"
  | "placement_offer"
  | "recruiter_update"
  | "faculty_intervention"
  | "marketplace_update"
  | "system_event";

export type SSEEventHandler<T = any> = (data: T) => void;

class SSEService {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<SSEEventHandler>> = new Map();
  private reconnectTimeout: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30000;
  private isConnecting = false;
  private currentUserId: string | null = null;

  public connect(userId?: string): void {
    if (this.eventSource && this.currentUserId === userId) {
      return;
    }

    this.disconnect();
    this.currentUserId = userId || null;
    this.isConnecting = true;

    const url = userId ? `/api/realtime/stream?userId=${encodeURIComponent(userId)}` : "/api/realtime/stream";

    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit("system_event", { status: "connected", transport: "SSE" });
      };

      this.eventSource.onerror = () => {
        this.isConnecting = false;
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        this.scheduleReconnect();
      };

      // Register standard SSE listeners
      const standardEvents: SSEEventType[] = [
        "notification",
        "community_post",
        "community_comment",
        "contest_update",
        "leaderboard_update",
        "placement_drive",
        "placement_offer",
        "recruiter_update",
        "faculty_intervention",
        "marketplace_update",
        "system_event"
      ];

      standardEvents.forEach((eventType) => {
        this.eventSource?.addEventListener(eventType, (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            this.emit(eventType, parsed);
          } catch {
            this.emit(eventType, e.data);
          }
        });
      });
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);

    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      if (this.currentUserId) {
        this.connect(this.currentUserId);
      } else {
        this.connect();
      }
    }, delay);
  }

  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnecting = false;
  }

  public on<T = any>(event: SSEEventType | string, handler: SSEEventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return cleanup unsubscribe function
    return () => {
      this.off(event, handler);
    };
  }

  public off(event: string, handler: SSEEventHandler): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  private emit(event: string, data: any): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((handler) => {
        try {
          handler(data);
        } catch (err) {
          console.error(`Error in SSE listener for '${event}':`, err);
        }
      });
    }
  }
}

export const sseService = new SSEService();
