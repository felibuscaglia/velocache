import { LRUCache } from "./cache";
import { createTcpServer } from "./server/tcp-server";

const cache = new LRUCache();
createTcpServer(cache, 8080);
