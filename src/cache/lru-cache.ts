class LRUCache {
  private cache: Map<string, string>;

  constructor() {
    this.cache = new Map<string, string>();
  }

  set(key: string, value: string) {
    this.cache.set(key, value);
  }

  get(key: string) {
    return this.cache.get(key);
  }
}

export { LRUCache };
