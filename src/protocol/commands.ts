import { LRUCache } from "../cache";

export function handleCommand(cache: LRUCache, input: string): string {
  const [command, key, ...rest] = input.split(" ");
  const value = rest.join(" ");

  switch (command?.toUpperCase()) {
    case "SET":
      if (!key) return "ERROR missing key";
      if (!value) return "ERROR missing value";

      cache.set(key, value);
      return "OK";

    case "GET":
      if (!key) return "ERROR missing key";
      return cache.get(key) ?? "NULL";
    
    case "DELETE":
      if (!key) return "ERROR missing key";
      return cache.delete(key) ? "1" : "0";
    
    case "STATS":
      return cache.getStats();

    default:
      return `ERROR unknown command: ${command ?? ""}`;
  }
}
