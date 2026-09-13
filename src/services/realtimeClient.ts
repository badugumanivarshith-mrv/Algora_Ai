type ListenerCallback = (data: any) => void;

export class RealtimeClient {
  private static socket: WebSocket | null = null;
  private static listeners: Map<string, Set<ListenerCallback>> = new Map();
  private static isConnecting = false;
  private static reconnectTimer: any = null;
  private static subscribedRooms: Set<string> = new Set(["global", "presence"]);
  private static onlineCount = 1;

  public static connect(userId = "u-1", username = "Arjun Sharma", avatarUrl?: string): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (typeof window === "undefined") return;

    this.isConnecting = true;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnecting = false;
        // Authenticate connection
        this.send({
          type: "AUTH",
          data: { userId, username, avatarUrl },
        });

        // Re-subscribe to all required rooms
        for (const room of this.subscribedRooms) {
          this.send({ type: "SUBSCRIBE_ROOM", room });
        }

        this.notifyListeners("status", { connected: true });
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "PRESENCE_UPDATE" || payload.type === "CONNECTED") {
            if (payload.data?.onlineCount) {
              this.onlineCount = payload.data.onlineCount;
            }
          }
          this.notifyListeners(payload.type, payload.data || payload);
          if (payload.room) {
            this.notifyListeners(`room:${payload.room}`, payload.data || payload);
          }
        } catch (e) {
          // ignore malformed ws messages
        }
      };

      this.socket.onclose = () => {
        this.socket = null;
        this.isConnecting = false;
        this.notifyListeners("status", { connected: false });
        this.scheduleReconnect(userId, username, avatarUrl);
      };

      this.socket.onerror = () => {
        this.socket = null;
        this.isConnecting = false;
      };
    } catch (e) {
      this.isConnecting = false;
      this.scheduleReconnect(userId, username, avatarUrl);
    }
  }

  private static scheduleReconnect(userId: string, username: string, avatarUrl?: string): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect(userId, username, avatarUrl);
    }, 4000);
  }

  public static send(payload: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  public static subscribeRoom(room: string): void {
    this.subscribedRooms.add(room);
    this.send({ type: "SUBSCRIBE_ROOM", room });
  }

  public static unsubscribeRoom(room: string): void {
    this.subscribedRooms.delete(room);
    this.send({ type: "UNSUBSCRIBE_ROOM", room });
  }

  public static on(event: string, callback: ListenerCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(callback);
      }
    };
  }

  private static notifyListeners(event: string, data: any): void {
    const set = this.listeners.get(event);
    if (set) {
      for (const cb of set) {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in ws listener callback for ${event}:`, err);
        }
      }
    }
  }

  public static getOnlineCount(): number {
    return this.onlineCount;
  }
}
