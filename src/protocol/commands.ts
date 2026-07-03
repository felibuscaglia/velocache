import { LRUCache } from "../cache";
import { parseSet } from "../helpers";
import { saveSnapshot } from "../persistence";

export async function handleCommand(
  cache: LRUCache,
  input: string
): Promise<string> {
  const [command, key, ...rest] = input.split(" ");
  const value = rest.join(" ");

  switch (command?.toUpperCase()) {
    case "SET":
      if (!key) return "ERROR missing key";

      const parsed = parseSet(rest);
      if (!parsed.ok) return parsed.error || "UNEXPECTED ERROR";

      cache.set(key, parsed.value || "", parsed.ttl);
      return "OK";

    case "GET":
      if (!key) return "ERROR missing key";
      return cache.get(key) ?? "NULL";

    case "DELETE":
      if (!key) return "ERROR missing key";
      return cache.delete(key) ? "1" : "0";

    case "SAVE": {
      const entries = cache.snapshot();

      try {
        const savedTo = await saveSnapshot(entries);
        return `OK ${savedTo}`;
      } catch (err) {
        return `ERROR save failed: ${(err as Error).message}`;
      }
    }

    case "STATS":
      return cache.getStats();

    default:
      return `ERROR unknown command: ${command ?? ""}`;
  }
}
