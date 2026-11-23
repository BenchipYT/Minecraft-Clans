import { headers } from "next/headers"; import IORedis from "ioredis";
const m = new Map<string, number[]>(); let r: IORedis | undefined;
/** Mit REDIS_URL verteilt (mehrere Instanzen), sonst im Speicher; bei Redis-Fehlern Fallback auf Speicher. */
export async function limited(key: string, max = 5, win = 6e4) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local", k = `rl:${key}:${ip}`;
  if (process.env.REDIS_URL) { try { r ??= new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: 1 }); const n = await r.incr(k); if (n === 1) await r.pexpire(k, win); return n > max; } catch { /* Fallback */ } }
  const now = Date.now(), a = (m.get(k) ?? []).filter(t => now - t < win); a.push(now); m.set(k, a); return a.length > max;
}
