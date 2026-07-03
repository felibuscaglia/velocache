# VeloCache — interactive demo

A single, self-contained page that runs a faithful in-browser build of VeloCache's
LRU algorithm. Type the real wire-protocol commands (`SET`, `GET`, `DELETE`, `STATS`,
`SAVE`) and watch entries promote to the head, evict from the tail, and expire on their
TTL in real time.

It is one file — `index.html` — with no build step and no dependencies. All CSS and
JavaScript are inlined.

## View it

Open the file directly:

```bash
open demo/index.html        # macOS
# or just double-click it in a file browser
```

> Note: the demo reimplements the cache in browser JavaScript for illustration. The
> authoritative implementation is the TypeScript server in [`../src`](../src).
