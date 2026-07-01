import { DoublyLinkedList, type ListNode } from "./doubly-linked-list";

class LRUCache {
  private cache: Map<string, ListNode>;
  private order: DoublyLinkedList;
  private readonly max: number;
  private size: number;

  constructor(max = 4) {
    this.cache = new Map<string, ListNode>();
    this.order = new DoublyLinkedList();
    this.max = max;
    this.size = 0;
  }

  set(key: string, value: string) {
    if (this.size === this.max) {
      const leastUsed = this.order.removeTail();

      if (leastUsed) {
        this.cache.delete(leastUsed.getKey());
      }
    }

    const node = this.order.add(key, value);
    this.cache.set(key, node);
    this.size++;
  }

  get(key: string): string | null {
    console.log("========== PREV ==========");
    console.log(this.cache);
    const node = this.cache.get(key);
    
    if (!node) return null;
    
    this.order.moveToFront(node);
    console.log("========== AFTER ==========");
    console.log(this.cache);
    return node.getValue();
  }
}

export { LRUCache };
