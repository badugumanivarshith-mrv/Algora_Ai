/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Enterprise Server-Sent Events (SSE) Central Broadcaster Service
 * Standardized Single Real-Time Transport (100% WebSockets Removed)
 */

import { Response } from "express";

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

export interface SSEClient {
  id: string;
  userId?: string;
  res: Response;
  connectedAt: Date;
}

class RealtimeBroadcaster {
  private clients: Map<string, SSEClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Keep-alive heartbeat every 25 seconds to prevent browser/proxy connection timeouts
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 25000);
  }

  public addClient(id: string, res: Response, userId?: string): void {
    const client: SSEClient = {
      id,
      userId,
      res,
      connectedAt: new Date(),
    };

    this.clients.set(id, client);

    // Initial handshake packet
    const welcomePayload = {
      status: "connected",
      clientId: id,
      userId: userId || null,
      transport: "SSE",
      supportedEvents: [
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
      ],
      timestamp: new Date().toISOString()
    };

    res.write(`event: system_event\ndata: ${JSON.stringify(welcomePayload)}\n\n`);

    // Clean removal upon connection close or client navigation
    res.on("close", () => {
      this.removeClient(id);
    });
  }

  public removeClient(id: string): void {
    this.clients.delete(id);
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  public sendHeartbeat(): void {
    const ping = `event: system_event\ndata: ${JSON.stringify({ type: "heartbeat", timestamp: new Date().toISOString() })}\n\n`;
    this.clients.forEach((client, id) => {
      try {
        client.res.write(ping);
      } catch {
        this.removeClient(id);
      }
    });
  }

  public broadcast(event: SSEEventType, data: any): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify({ ...data, _emittedAt: new Date().toISOString() })}\n\n`;
    this.clients.forEach((client, id) => {
      try {
        client.res.write(payload);
      } catch {
        this.removeClient(id);
      }
    });
  }

  public sendToUser(userId: string, event: SSEEventType, data: any): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify({ ...data, _emittedAt: new Date().toISOString() })}\n\n`;
    this.clients.forEach((client, id) => {
      if (client.userId === userId) {
        try {
          client.res.write(payload);
        } catch {
          this.removeClient(id);
        }
      }
    });
  }

  // ==========================================
  // STANDARDIZED DOMAIN EVENT DISPATCHERS
  // ==========================================

  public broadcastNotification(notification: any, userId?: string): void {
    if (userId) {
      this.sendToUser(userId, "notification", { notification });
    } else {
      this.broadcast("notification", { notification });
    }
  }

  public broadcastCommunityPost(post: any): void {
    this.broadcast("community_post", { post });
  }

  public broadcastCommunityComment(postId: string, comment: any): void {
    this.broadcast("community_comment", { postId, comment });
  }

  public broadcastContestUpdate(contestId: string, contest: any): void {
    this.broadcast("contest_update", { contestId, contest });
  }

  public broadcastLeaderboardUpdate(contestId: string, leaderboard: any[]): void {
    this.broadcast("leaderboard_update", { contestId, leaderboard });
  }

  public broadcastPlacementDrive(drive: any): void {
    this.broadcast("placement_drive", { drive });
  }

  public broadcastPlacementOffer(userId: string, offer: any): void {
    this.sendToUser(userId, "placement_offer", { offer });
    this.broadcast("notification", {
      notification: {
        title: "New Placement Offer Granted!",
        message: `An official placement offer has been confirmed for ${offer.company || 'Enterprise Partner'}.`,
        type: "placement"
      }
    });
  }

  public broadcastRecruiterUpdate(recruiterId: string, payload: any): void {
    this.sendToUser(recruiterId, "recruiter_update", payload);
  }

  public broadcastFacultyIntervention(studentId: string, intervention: any): void {
    this.sendToUser(studentId, "faculty_intervention", { intervention });
    this.broadcastNotification({
      title: "Faculty Guidance Notice",
      message: intervention.recommendation || "Your faculty advisor has provided academic guidance.",
      type: "system"
    }, studentId);
  }

  public broadcastMarketplaceUpdate(update: any): void {
    this.broadcast("marketplace_update", { update });
  }

  public broadcastSystemEvent(eventData: any): void {
    this.broadcast("system_event", eventData);
  }
}

export const realtimeBroadcaster = new RealtimeBroadcaster();
