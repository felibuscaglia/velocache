import type { Server } from "node:net";
import { LRUCache } from "./cache";
import { createTcpServer } from "./server/tcp-server";
import { loadSnapshot, saveSnapshot } from "./persistence";

async function main() {
  const cache = new LRUCache();

  const entries = await loadSnapshot();

  for (const { key, value, expiresAt } of entries) {
    if (!expiresAt || expiresAt > Date.now()) {
      cache.set(key, value, undefined, expiresAt);
    }
  }

  const server = createTcpServer(cache, 8080);

  installShutdownHandlers(server, cache);
}

function installShutdownHandlers(server: Server, cache: LRUCache) {
  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals) => {
    // A second Ctrl-C shouldn't kick off a concurrent save.
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`\nReceived ${signal}, shutting down gracefully...`);

    // Stop accepting new connections; existing sockets are dropped on exit.
    server.close();

    try {
      const savedTo = await saveSnapshot(cache.snapshot());
      console.log(`Saved snapshot to ${savedTo}`);
    } catch (err) {
      console.error(`Failed to save snapshot: ${(err as Error).message}`);
      process.exit(1);
    }

    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
