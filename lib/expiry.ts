import { db } from "./db"; import { ptero } from "./pterodactyl"; import { audit } from "./auth-audit"; import { sendMail, appUrl } from "./mail"; import { notify } from "./notify";
/** Idempotent: Erinnerung 7 Tage vor Ablauf (einmal je Laufzeit), Sperrung nach Ablauf. Gelöscht wird nie automatisch. */
export async function runExpiry() {
  const now = new Date(), soon = new Date(+now + 7 * 864e5);
  for (const s of await db.server.findMany({ where: { paidUntil: { gt: now, lte: soon }, status: { notIn: ["CANCELLED", "SUSPENDED"] } }, include: { owner: true } })) {
    if (s.reminderFor?.getTime() === s.paidUntil!.getTime()) continue;
    await sendMail(s.owner.email, "Dein Server läuft bald ab", `Dein Server "${s.name}" läuft am ${s.paidUntil!.toLocaleDateString("de-DE")} ab. Verlängern:\n${appUrl()}/portal/billing`);
    await notify(s.ownerId, `"${s.name}" läuft bald ab`, "/portal/billing"); await db.server.update({ where: { id: s.id }, data: { reminderFor: s.paidUntil } });
  }
  for (const s of await db.server.findMany({ where: { paidUntil: { lt: now }, status: { notIn: ["CANCELLED", "SUSPENDED"] } }, include: { owner: true } })) {
    await db.server.update({ where: { id: s.id }, data: { status: "SUSPENDED" } });
    try { if (s.pteroId) await ptero(`/servers/${s.pteroId}/suspend`, { method: "POST" }); } catch (e) { await audit(null, `expiry.suspend_failed: ${(e as Error).message}`.slice(0, 200), s.id); }
    await audit(null, "server.expired", s.id); await sendMail(s.owner.email, "Dein Server wurde pausiert", `Dein Server "${s.name}" ist abgelaufen und pausiert. Mit einer Verlängerung geht es sofort weiter:\n${appUrl()}/portal/billing`);
  }
}
