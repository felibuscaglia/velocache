function parseSet(rest: string[]) {
  const tokens = [...rest];

  let ttl: number | undefined;

  if (tokens.length >= 2 && tokens.at(-2)?.toUpperCase() === "TTL") {
    const ttlStr = tokens.pop();
    tokens.pop(); // Remove "TTL"

    const parsed = Number(ttlStr);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return { ok: false, error: "ERROR invalid TTL" };
    }

    ttl = parsed;
  }

  if (!tokens.length) {
    return { ok: false, error: "ERROR missing value" };
  }

  return { ok: true, value: tokens.join(" "), ttl };
}

export { parseSet };