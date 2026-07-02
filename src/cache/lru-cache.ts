import { DoublyLinkedList, type ListNode } from "./doubly-linked-list";

class LRUCache {
  private cache: Map<string, ListNode>;
  private order: DoublyLinkedList;
  private readonly max: number;
  private size: number;
  private stats: { hits: number; misses: number };

  constructor(max = 4) {
    this.cache = new Map<string, ListNode>();
    this.order = new DoublyLinkedList();
    this.max = max;
    this.size = 0;
    this.stats = { hits: 0, misses: 0 };
  }

  set(key: string, value: string, ttl?: number) {
    if (this.size === this.max) {
      const leastUsed = this.order.removeTail();

      if (leastUsed) {
        this.cache.delete(leastUsed.getKey());
      }
    }

    const node = this.order.add(key, value);
    this.cache.set(key, node);
    this.size++;

    if (ttl !== undefined) {
      setTimeout(() => {
        this.delete(key);
      }, ttl * 1000);
    }
  }

  get(key: string): string | null {
    const node = this.cache.get(key);

    if (!node) {
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

    return true;
  }

  getStats() {
    return `
      +--------+-------+
      | Metric | Value |
      +--------+-------+
      | Items  |   ${this.cache.size}   |
      | Hits   |   ${this.stats.hits}   |
      | Misses |   ${this.stats.misses}   |
      +--------+-------+
    `;
  }
}

export { LRUCache };
