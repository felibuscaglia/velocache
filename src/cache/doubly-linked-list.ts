class ListNode {
  private value: string;
  private readonly key: string;
  public next: ListNode | null;
  public prev: ListNode | null;
  public expiresAt?: number;

  constructor(key: string, value: string, ttl?: number) {
    this.value = value;
    this.key = key;
    this.next = null;
    this.prev = null;
    this.expiresAt = ttl ? Date.now() + ttl * 1000 : undefined;
  }

  public setValue(value: string) {
    this.value = value;
  }

  public getValue() {
    return this.value;
  }

  public getKey() {
    return this.key;
  }

  public get isExpired() {
    return this.expiresAt !== undefined && this.expiresAt <= Date.now();
  }

  public setExpiresAt(expiresAt: number) {
    this.expiresAt = expiresAt;
  }
}

class DoublyLinkedList {
  private head: ListNode | null;
  private tail: ListNode | null;

  constructor() {
    this.head = null;
    this.tail = null;
  }

  add(key: string, value: string, ttl?: number) {
    const newNode = new ListNode(key, value, ttl);

    if (!this.head || !this.tail) {
      // First node forms a single-element ring pointing at itself.
      newNode.next = newNode;
      newNode.prev = newNode;
      this.head = newNode;
      this.tail = newNode;
      return newNode;
    }

    // Insert at the head (MRU end), keeping the ring closed through the tail.
    newNode.prev = this.tail;
    newNode.next = this.head;
    this.head.prev = newNode;
    this.tail.next = newNode;
    this.head = newNode;

    return newNode;
  }

  delete(node: ListNode) {
    if (node.next === node) {
      // Sole node in the ring.
      this.head = null;
      this.tail = null;
    } else {
      if (this.head === node) {
        this.head = node.next;
      }

      if (this.tail === node) {
        this.tail = node.prev;
      }

      node.prev!.next = node.next;
      node.next!.prev = node.prev;
    }

    node.prev = null;
    node.next = null;
  }

  // Returns nodes in recency order (head = most recent, tail = least).
  // Read-only: it never mutates the list, so it's safe to call mid-flight.
  toArray() {
    if (!this.head) return [];

    const nodes: ListNode[] = [];
    let curr: ListNode | null = this.head;

    do {
      nodes.push(curr);
      curr = curr?.next || null;
    } while (curr && curr !== this.head);

    return nodes;
  }

  removeExpired() {
    if (!this.head) return [];

    let curr: ListNode | null = this.head;
    const expired: ListNode[] = [];

    do {
      if (curr?.isExpired) {
        expired.push(curr);
      }

      curr = curr?.next || null;
    } while (curr && curr !== this.head);

    expired.forEach((node) => this.delete(node));
    return expired;
  }

  removeTail() {
    if (!this.tail) return null;

    const removedTail = this.tail;

    if (this.tail === this.head) {
      this.tail = null;
      this.head = null;
    } else {
      this.tail = this.tail.prev;
      this.tail!.next = this.head;
      this.head!.prev = this.tail;
    }

    removedTail.prev = null;
    removedTail.next = null;

    return removedTail;
  }

  moveToFront(node: ListNode) {
    if (node === this.head || !this.head?.next) {
      return;
    }

    if (node === this.tail) {
      this.tail = node.prev;
    }

    node.prev!.next = node.next;
    node.next!.prev = node.prev;
    node.next = this.head;
    node.prev = this.tail;
    this.head.prev = node;
    this.head = node;
    this.tail!.next = node;
  }
}

export { DoublyLinkedList, type ListNode };
