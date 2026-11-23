import { randomBytes, createHash } from "crypto"; import { db } from "./db"; import { appUrl } from "./mail";
const sha = (t: string) => createHash("sha256").update(t).digest("hex");
type Purpose = "reset" | "verify";
/** Einmal-Link (Passwort setzen oder E-Mail bestätigen); nur der Hash wird gespeichert, ältere Links gleicher Art werden ungültig. */
export async function resetLink(userId: string, hours = 1, purpose: Purpose = "reset") {
  const t = randomBytes(32).toString("hex");
  await db.passwordReset.deleteMany({ where: { userId, purpose } });
  await db.passwordReset.create({ data: { userId, purpose, tokenHash: sha(t), expiresAt: new Date(Date.now() + hours * 3600e3) } });
  return `${appUrl()}/${purpose === "verify" ? "email-bestaetigen" : "passwort-zuruecksetzen"}?token=${t}`;
}
export async function findReset(token: string, purpose: Purpose = "reset") { const r = await db.passwordReset.findUnique({ where: { tokenHash: sha(token) } }); return r && r.purpose === purpose && r.expiresAt > new Date() ? r : null; }
