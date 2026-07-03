# VeloCache

An in-memory, TTL-aware key–value cache with LRU eviction, served over a plain TCP protocol.

VeloCache is a compact study of the ideas that sit underneath production caches such as Redis and Memcached: an O(1) least-recently-used eviction policy, per-key expiration, a line-oriented wire protocol, and crash-consistent snapshots to disk. It is written from first principles in TypeScript, with no runtime dependencies, so the moving parts stay legible.

## Interactive demo

[`demo/index.html`](demo/index.html) is a self-contained page that runs a faithful in-browser build of the LRU algorithm: type the real wire-protocol commands and watch entries promote to the head, evict from the tail, and expire on their TTL in real time. Open it directly, or serve it via GitHub Pages — see [`demo/README.md`](demo/README.md).

## Design

The cache is built around the classic pairing of a hash map and a doubly linked list, which together give amortized O(1) reads, writes, and evictions.

- **`Map<string, ListNode>`** provides constant-time lookup from a key to its node.
- **A circular doubly linked list** maintains recency order. The head is the most recently used entry and the tail is the least. Promoting an entry on access, evicting the tail, and unlinking an arbitrary node are all pointer rewires, independent of the number of entries.

On a `GET`, the target node is spliced out and moved to the head. When the cache reaches capacity, expired nodes are reclaimed first; if the cache is still full, the tail is evicted. Expiration is lazy — a key is considered gone the moment its deadline passes and is removed on the next access — with a capacity-triggered sweep to bound the number of dead entries that linger.

Durability is provided by a snapshot mechanism. The `SAVE` command serializes live, non-expired entries to JSON and writes them using the write-to-temp-then-rename pattern, so a reader never observes a half-written file. On startup the server loads the most recent snapshot and replays only the entries that have not yet expired.

### Module layout

```
src/
├── index.ts                    Entry point: load snapshot, start server
├── cache/
│   ├── lru-cache.ts            LRU policy, statistics, snapshot view
│   └── doubly-linked-list.ts   Recency-ordered list and node
├── protocol/
│   └── commands.ts             Command parsing and dispatch
├── server/
│   └── tcp-server.ts           TCP listener and per-connection loop
├── persistence/
│   ├── save.ts                 Atomic snapshot writer
│   └── load.ts                 Snapshot reader
└── helpers/
    ├── parse-set.ts            SET argument and TTL parsing
    └── format-uptime.ts        Human-readable uptime for STATS
```

## Getting started

### Requirements

- Node.js 18 or newer

### Install and run

```bash
git clone https://github.com/felibuscaglia/velocache.git
cd velocache
npm install

# Development, with reload on change
npm run dev

# Production build and run
npm run build
npm start
```

The server listens on TCP port `8080`.

### Connecting

Any raw TCP client will do. Using `netcat`:

```bash
nc localhost 8080
```

```
Welcome to the VeloCache server
> SET greeting hello world
OK
> GET greeting
hello world
> STATS
      +--------+--------------+
      | Metric |    Value     |
      +--------+--------------+
      | Items  |      1       |
      | Hits   |      1       |
      | Misses |      0       |
      | Uptime |   0h 0m 12s  |
      +--------+--------------+
```

## Protocol

Commands are newline-terminated and case-insensitive. Keys and values are whitespace-separated tokens; a value may contain spaces and is taken as the remainder of the line.

| Command | Syntax | Description | Response |
| --- | --- | --- | --- |
| `SET` | `SET <key> <value> [TTL <seconds>]` | Store a value, optionally with a time-to-live. | `OK` |
| `GET` | `GET <key>` | Retrieve a value, refreshing its recency. | value, or `NULL` |
| `DELETE` | `DELETE <key>` | Remove a key. | `1` if removed, `0` if absent |
| `SAVE` | `SAVE` | Persist a snapshot to disk. | `OK <path>` |
| `STATS` | `STATS` | Report items, hits, misses, and uptime. | formatted table |

The optional `TTL` clause must appear at the end of a `SET` and take a positive integer number of seconds:

```
> SET session-token abc123 TTL 30
OK
```

After 30 seconds the key expires and the next `GET` returns `NULL`.

## Persistence

Snapshots are written to `<os-tmpdir>/velocache/dump.json`. Only live entries are serialized, each with its absolute expiration timestamp so that time-to-live survives a restart. The writer syncs to a temporary file and atomically renames it into place, and the loader tolerates a missing snapshot by starting with an empty cache.

## Configuration

Two parameters are set in code and documented here for clarity:

- **Capacity** — the maximum number of entries before eviction begins, defined by the `LRUCache` constructor (`src/cache/lru-cache.ts`). It defaults to a small value that makes eviction easy to observe while experimenting.
- **Port** — the listening port, passed to `createTcpServer` in `src/index.ts`, defaulting to `8080`.

## Development

```bash
npm run dev        # run from source with reload
npm run build      # compile TypeScript to dist/
npm run typecheck  # type-check without emitting
```

The codebase is written in strict TypeScript and has no production dependencies.

## Contributing

Issues and pull requests are welcome. For substantial changes, please open an issue first to discuss the direction. Contributions that improve clarity or documentation are valued as much as those that add features.

## License

Released under the ISC License.
