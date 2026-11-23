import { db } from "./db"; import { feeRules, withFee } from "./fees"; import { getPayment } from "./mollie"; import { audit } from "./auth-audit"; import { notify } from "./notify"; import { notifyTeam, sendMail, appUrl } from "./mail"; import { startProvision } from "./automation"; import { applyLimits } from "./provision"; import { ptero } from "./pterodactyl";
export const MONTHS = [1, 3, 6, 12];
export const LABEL: Record<string, string> = { paysafecard: "Paysafecard", paypal: "PayPal", creditcard: "Kreditkarte", banktransfer: "Überweisung", applepay: "Apple Pay", ideal: "iDEAL" };
export const allowedMethods = () => (process.env.PAYMENT_METHODS ?? "paysafecard,paypal,creditcard,banktransfer").split(",").map(s => s.trim()).filter(Boolean);
export const isFree = (m: string) => withFee(1000, feeRules()[m]).fee === 0;
export const eur = (c: number) => (c / 100).toFixed(2).replace(".", ",") + " €";
export const quote = (priceCents: number, months: number, method: string) => { const base = priceCents * months, r = withFee(base, feeRules()[method]); return { base, fee: r.fee, total: r.total }; };
const addMonths = (d: Date, m: number) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };
/** Prüft Bestellung/Verlängerung vollständig serverseitig (Preis kommt immer aus der Datenbank). */
export async function resolveOrder(userId: string, p: Record<string, string | undefined>) {
  const months = Number(p.months), method = p.method ?? "";
  if (!MONTHS.includes(months)) return { error: "Laufzeit ungültig" } as const;
  if (!allowedMethods().includes(method)) return { error: "Zahlungsart ungültig" } as const;
  if (!allowedMethods().some(isFree)) return { error: "Zahlung derzeit nicht verfügbar" } as const; // § 312a BGB: mindestens eine kostenlose Zahlungsart
  const pkg = await db.package.findFirst({ where: { id: p.packageId, active: true, priceCents: { gt: 0 } } }); if (!pkg) return { error: "Paket nicht verfügbar" } as const;
  let name = (p.name ?? "").trim().slice(0, 60), server = null;
  if (p.kind === "renew") {
    server = await db.server.findFirst({ where: { id: p.serverId, ownerId: userId, paidUntil: { not: null }, status: { not: "CANCELLED" } } }); if (!server) return { error: "Server nicht gefunden" } as const;
    if (pkg.id !== server.packageId && server.paidUntil!.getTime() > Date.now() + 7 * 864e5) return { error: "Ein Paketwechsel ist erst in den letzten 7 Tagen vor Ablauf möglich" } as const; name = server.name;
  } else if (!name) return { error: "Bitte einen Servernamen angeben" } as const;
  return { pkg, server, name, months, method, q: quote(pkg.priceCents, months, method), kind: p.kind === "renew" ? "RENEW" : "ORDER" } as const;
}
/** Idempotent: Webhook und Rückkehrseite dürfen beide aufrufen; gutgeschrieben wird genau einmal. */
export async function settlePayment(paymentId: string) {
  const p = await db.payment.findUnique({ where: { id: paymentId } }); if (!p?.mollieId || p.status !== "OPEN") return p;
  const m = await getPayment(p.mollieId);
  if (m.status === "paid") {
    if (m.amount?.value !== (p.totalCents / 100).toFixed(2) || m.amount?.currency !== "EUR") { await audit(null, "payment.amount_mismatch", p.id); return p; }
    if ((await db.payment.updateMany({ where: { id: p.id, status: { not: "PAID" } }, data: { status: "PAID", paidAt: new Date() } })).count === 1) {
      const c = await db.counter.upsert({ where: { id: "invoice" }, update: { value: { increment: 1 } }, create: { id: "invoice", value: 1 } });
      await db.payment.update({ where: { id: p.id }, data: { invoiceNo: c.value } }); await fulfil(p.id);
    }
  } else if (["failed", "canceled", "expired"].includes(m.status)) await db.payment.updateMany({ where: { id: p.id, status: "OPEN" }, data: { status: m.status.toUpperCase() } });
  return db.payment.findUnique({ where: { id: p.id } });
}
async function fulfil(paymentId: string) {
  const p = await db.payment.findUniqueOrThrow({ where: { id: paymentId }, include: { user: true } }); let serverId = p.serverId;
  if (p.kind === "ORDER") {
    const s = await db.server.create({ data: { name: p.serverName ?? "Server", ownerId: p.userId, packageId: p.packageId, paidUntil: addMonths(new Date(), p.months) } });
    serverId = s.id; await db.payment.update({ where: { id: p.id }, data: { serverId } }); await notifyTeam("Neue Bestellung", `Server "${s.name}" bestellt, siehe /admin/servers`); await startProvision(s.id);
  } else if (serverId) {
    const s = await db.server.findUniqueOrThrow({ where: { id: serverId } }), now = new Date(), base = s.paidUntil && s.paidUntil > now ? s.paidUntil : now, wasSuspended = s.status === "SUSPENDED";
    await db.server.update({ where: { id: s.id }, data: { paidUntil: addMonths(base, p.months), reminderFor: null, packageId: p.packageId, ...(wasSuspended && { status: "READY" }) } });
    try { if (s.pteroId) { if (wasSuspended) await ptero(`/servers/${s.pteroId}/unsuspend`, { method: "POST" }); if (s.packageId !== p.packageId) await applyLimits(s.id); } }
    catch (e) { await audit(null, `payment.panel_failed: ${(e as Error).message}`.slice(0, 200), s.id); await notifyTeam("Panel-Aktion nach Zahlung fehlgeschlagen", `Server ${s.name}: bitte manuell prüfen (Entsperren/Limits).`); }
  }
  await audit(p.userId, `payment.paid:${p.kind}`, p.id); await notify(p.userId, "Zahlung eingegangen, danke!", "/portal/billing");
  await sendMail(p.user.email, "Zahlung eingegangen", `Hallo ${p.user.name},\n\ndeine Zahlung (${eur(p.totalCents)}) ist eingegangen. Beleg:\n${appUrl()}/portal/billing/beleg/${p.id}`);
}
