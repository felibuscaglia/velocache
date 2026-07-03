import { promises as fs } from "node:fs";
import { DEFAULT_SAVE_PATH, type Snapshot, type SnapshotEntry } from "./save";

export async function loadSnapshot(
  filePath: string = DEFAULT_SAVE_PATH
): Promise<SnapshotEntry[]> {
  let raw: string;

  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw err;
  }

  const snapshot = JSON.parse(raw) as Snapshot;
  return snapshot.entries ?? [];
}
