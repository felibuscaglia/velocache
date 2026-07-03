import { LRUCache } from "./cache";
import { createTcpServer } from "./server/tcp-server";
import { loadSnapshot } from "./persistence";

async function main() {
  const cache = new LRUCache();

  const entries = await loadSnapshot();

  for (const { key, value, expiresAt } of entries) {
    if (!expiresAt || expiresAt > Date.now()) {
      cache.set(key, value, undefined, expiresAt);
    }
  }

  createTcpServer(cache, 8080);
}

main();
