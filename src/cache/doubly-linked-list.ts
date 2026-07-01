class ListNode {
  private readonly value: string;
  private readonly key: string;
  public next: ListNode | null;
  public prev: ListNode | null;

  constructor(key: string, value: string) {
    this.value = value;
    this.key = key;
    this.next = null;
    this.prev = null;
  }

  public getValue() {
    return this.value;
  }

  public getKey() {
    return this.key;
  }
}

class DoublyLinkedList {
  private head: ListNode | null;
  private tail: ListNode | null;

  constructor() {
    this.head = null;
    this.tail = null;
  }

  add(key: string, value: string) {
    const newNode = new ListNode(key, value);

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
