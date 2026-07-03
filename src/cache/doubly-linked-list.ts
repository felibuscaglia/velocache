class ListNode {
  private readonly value: string;
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

    if (!this.head) {
      this.head = newNode;
    } else {
      newNode.prev = this.tail;
      newNode.next = this.head;
      this.tail!.next = newNode;
      this.head.prev = newNode;
    }

    this.tail = newNode;
    return newNode;
  }

  delete(node: ListNode) {
    if (this.head === node) {
      this.head = this.head.next;
    }

    if (this.tail === node) {
      this.tail = this.tail.prev;
    }

    if (node.prev) {
      node.prev.next = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    }
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
    let removedTail: ListNode | null = null;

    if (this.tail) {
      removedTail = this.tail;
      this.tail = this.tail.prev;
    } else {
      removedTail = this.head;
      this.head = null;
    }

    return removedTail;
  }

  moveToFront(node: ListNode) {
    if (!this.head?.next) {
      // If there's no head (impossible given that the function is called only after getting the node, but JIC), or there's only one element, we leave as-is
      return;
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
