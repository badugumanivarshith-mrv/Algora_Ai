/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ALGORA Realtime Context & Provider (Powered 100% by Server-Sent Events)
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { sseService, SSEEventType } from "../services/sseService";
import { useAuth } from "./AuthContext";

export interface RealtimeToast {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "placement" | "contest";
  timestamp: string;
}

interface RealtimeContextType {
  isConnected: boolean;
  toasts: RealtimeToast[];
  dismissToast: (id: string) => void;
  subscribe: <T = any>(event: SSEEventType, handler: (data: T) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState<RealtimeToast[]>([]);

  useEffect(() => {
    // Connect to SSE stream
    sseService.connect(user?.id);

    const unsubSystem = sseService.on("system_event", (data) => {
      if (data?.status === "connected") {
        setIsConnected(true);
      }
    });

    // Global Notification popup toaster
    const unsubNotification = sseService.on("notification", (data) => {
      const notif = data?.notification || data;
      if (notif?.title) {
        const newToast: RealtimeToast = {
          id: notif.id || `toast_${Date.now()}_${Math.random()}`,
          title: notif.title,
          message: notif.message || "",
          type: notif.type === "placement" ? "placement" : notif.type === "contest" ? "contest" : "info",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setToasts((prev) => [newToast, ...prev].slice(0, 5));
      }
    });

    // Placement offer alerts
    const unsubPlacement = sseService.on("placement_offer", (data) => {
      const offer = data?.offer;
      if (offer) {
        const newToast: RealtimeToast = {
          id: `offer_${Date.now()}`,
          title: "🎉 Official Placement Offer Granted!",
          message: `Congratulations! ${offer.company || "Your hiring partner"} has extended an offer.`,
          type: "placement",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setToasts((prev) => [newToast, ...prev].slice(0, 5));
      }
    });

    return () => {
      unsubSystem();
      unsubNotification();
      unsubPlacement();
      sseService.disconnect();
      setIsConnected(false);
    };
  }, [user?.id]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const subscribe = <T = any>(event: SSEEventType, handler: (data: T) => void) => {
    return sseService.on<T>(event, handler);
  };

  return (
    <RealtimeContext.Provider value={{ isConnected, toasts, dismissToast, subscribe }}>
      {children}
      {/* Toast Notification Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto bg-slate-900/95 border border-cyan-500/30 shadow-xl shadow-cyan-950/40 rounded-xl p-4 text-white backdrop-blur-md transition-all transform animate-in slide-in-from-bottom-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-sm text-cyan-400">{toast.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{toast.message}</p>
                </div>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
              <div className="text-[10px] text-slate-500 mt-2 text-right">{toast.timestamp}</div>
            </div>
          ))}
        </div>
      )}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = (): RealtimeContextType => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
};
