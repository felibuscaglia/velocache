import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export interface SnapshotEntry {
  key: string;
  value: string;
  expiresAt?: number;
}

export interface Snapshot {
  savedAt: number;
  entries: SnapshotEntry[];
}

export const DEFAULT_SAVE_PATH = path.join(os.tmpdir(), "velocache", "dump.json");

let tmpCounter = 0;

export async function saveSnapshot(
  entries: SnapshotEntry[],
  filePath: string = DEFAULT_SAVE_PATH
): Promise<string> {
  const snapshot: Snapshot = {
    savedAt: Date.now(),
    entries,
  };

  const payload = JSON.stringify(snapshot);
  const tmpPath = `${filePath}.${process.pid}.${tmpCounter++}.tmp`;

  // Make sure the containing folder exists before writing into it.
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const handle = await fs.open(tmpPath, "w");
  try {
    await handle.writeFile(payload);
    await handle.sync();
  } finally {
    await handle.close();
  }

  await fs.rename(tmpPath, filePath);

  return filePath;
}
