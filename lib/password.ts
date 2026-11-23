import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
export function hashPassword(p: string) { const s = randomBytes(16).toString("hex"); return `${s}:${scryptSync(p, s, 64).toString("hex")}`; }
export function verifyPassword(p: string, st: string) {
  const [s, h] = st.split(":"); const a = Buffer.from(h, "hex"), b = scryptSync(p, s, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}
