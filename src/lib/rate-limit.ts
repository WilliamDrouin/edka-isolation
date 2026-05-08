interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

interface RateLimitOptions {
  /** Identifiant unique (ex : adresse IP) */
  key: string;
  /** Nombre max de requêtes dans la fenêtre */
  limit: number;
  /** Fenêtre en millisecondes */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Rate limit en mémoire. Suffisant pour une démo single-instance.
 * Pour la production multi-instance (Vercel serverless cold starts),
 * remplacer par Upstash Redis ou équivalent.
 */
export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(options.key);

  if (!existing || existing.resetAt < now) {
    const fresh: Bucket = { count: 1, resetAt: now + options.windowMs };
    buckets.set(options.key, fresh);
    return { allowed: true, remaining: options.limit - 1, resetAt: fresh.resetAt };
  }

  if (existing.count >= options.limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: options.limit - existing.count,
    resetAt: existing.resetAt,
  };
}
