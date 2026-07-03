import { promises as fs } from "node:fs";
import { DEFAULT_SAVE_PATH, type Snapshot, type SnapshotEntry } from "./save";

export async function loadSnapshot(
  filePath: string = DEFAULT_SAVE_PATH,
): Promise<SnapshotEntry[]> {
  let snapshot: Snapshot | null;

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    snapshot = JSON.parse(raw) as Snapshot;
  } catch (err) {
    return [];
  }

  // A well-formed but unexpected payload (null, a number, a bare array, or a
  // missing `entries` field) should start empty rather than crash the caller.
  if (!snapshot || !Array.isArray(snapshot.entries)) {
    return [];
  }

  return snapshot.entries;
}
