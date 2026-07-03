import { DoublyLinkedList, type ListNode } from "./doubly-linked-list";
import type { SnapshotEntry } from "../persistence";
import { formatUptime } from "../helpers";

class LRUCache {
  private readonly max: number;
  private readonly startedAt: number;
  private cache: Map<string, ListNode>;
  private order: DoublyLinkedList;
  private size: number;
  private stats: { hits: number; misses: number };

  constructor(max = 100) {
    this.cache = new Map<string, ListNode>();
    this.order = new DoublyLinkedList();
    this.max = max;
    this.size = 0;
    this.stats = { hits: 0, misses: 0 };
    this.startedAt = Date.now();
  }

  set(key: string, value: string, ttl?: number, expiresAt?: number) {
    const existing = this.cache.get(key);

    if (existing) {
      existing.setValue(value);

      if (ttl !== undefined) {
        existing.setExpiresAt(Date.now() + ttl * 1000);
      }

      return;
    }

    if (this.size >= this.max) {
      const expired = this.order.removeExpired();

      if (expired.length) {
        this.size -= expired.length;

        expired.forEach((node) => this.cache.delete(node.getKey()));
      }
    }

    // If the cache is still at its maximum capacity, delete the least used one
    if (this.size >= this.max) {
      const leastUsed = this.order.removeTail();

      if (leastUsed) {
        this.cache.delete(leastUsed.getKey());
        this.size--;
      }
    }

    const node = this.order.add(key, value, ttl);

    if (expiresAt) {
      node.setExpiresAt(expiresAt);
    }

    this.cache.set(key, node);
    this.size++;
  }

  get(key: string): string | null {
    const node = this.cache.get(key);

    if (!node || node.isExpired) {
      if (node?.isExpired) {
        this.order.delete(node);
        this.cache.delete(key);
        this.size--;
      }

      this.stats.misses++;
      return null;
    }

    this.order.moveToFront(node);
    this.stats.hits++;
    return node.getValue();
  }

  delete(key: string): boolean {
    const node = this.cache.get(key);

    if (!node) return false;

    this.cache.delete(key);
    this.order.delete(node);
    this.size--;

    return true;
  }

  snapshot(): SnapshotEntry[] {
    return this.order
      .toArray()
      .filter((node) => !node.isExpired)
      .map((node) => ({
        key: node.getKey(),
        value: node.getValue(),
        expiresAt: node.expiresAt,
      }));
  }

  getStats() {
    const uptime = Math.floor((Date.now() - this.startedAt) / 1000);

    return `
    +--------+--------------+
    Items: ${this.size}
    Hits: ${this.stats.hits}
    Misses: ${this.stats.misses}
    Uptime: ${formatUptime(uptime)}
    +--------+--------------+
    `;
  }
}

export { LRUCache };
