import type { NextRequest } from "next/server";

const WINDOW_MS  = 15 * 60 * 1000; // 15 min
const MAX_FAILS  = 5;
const CLEANUP_MS = 5 * 60 * 1000;  // 5 min

type Entry = { count: number; windowStart: number };
const store = new Map<string, Entry>();

let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_MS) return;
  lastCleanup = now;
  for (const [k, v] of store) {
    if (now - v.windowStart > WINDOW_MS) store.delete(k);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSecs: number;
}

export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_FAILS - 1, retryAfterSecs: 0 };
  }

  entry.count++;
  const remaining = Math.max(0, MAX_FAILS - entry.count);
  const retryAfterSecs = remaining === 0
    ? Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000)
    : 0;

  return { allowed: entry.count <= MAX_FAILS, remaining, retryAfterSecs };
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
