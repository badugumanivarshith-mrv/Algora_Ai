import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import { createExpressApp } from "./backend/src/server";
import { initializeDatabase, Database } from "./backend/src/db";
import { WebSocketManager } from "./backend/src/realtime/wsManager";
import { RedisManager } from "./backend/src/redis/redisClient";
import { RedisPubSubManager } from "./backend/src/redis/pubsub";

const PORT = 3000;

async function start() {
  // Initialize Database, Migrations, and Seeds
  await initializeDatabase();

  // Initialize Redis Connection Manager
  await RedisManager.initialize();

  const app = createExpressApp();

  // Vite middleware in development vs static file serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Algora Server] Running on http://0.0.0.0:${PORT} (${process.env.NODE_ENV || "development"})`);
  });

  // Attach WebSocket infrastructure with Redis Pub/Sub scaling
  WebSocketManager.initialize(server);

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`\n[Algora Server] Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
      console.log("[Algora Server] HTTP server closed.");
      await Database.close();
      console.log("[Algora Server] Database connections terminated.");
      await RedisPubSubManager.close();
      await RedisManager.close();
      console.log("[Algora Server] Redis connections terminated.");
      process.exit(0);
    });

    // Force exit if hanging
    setTimeout(() => {
      console.error("[Algora Server] Forced shutdown timeout exceeded. Exiting.");
      process.exit(1);
    }, 5000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

