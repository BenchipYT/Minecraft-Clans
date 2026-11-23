"use server";
import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import { requireVerified } from "@/lib/auth"; import { audit } from "@/lib/auth-audit"; import { createPayment } from "@/lib/mollie"; import { appUrl } from "@/lib/mail"; import { limited } from "@/lib/ratelimit"; import { resolveOrder } from "@/lib/payments";
export async function pay(fd: FormData) {
  const u = await requireVerified(); if (await limited("pay", 10)) redirect("/portal/billing?e=Zu+viele+Versuche");
  if (fd.get("agb") !== "on" || fd.get("early") !== "on") redirect("/portal/billing?e=Bitte+AGB+und+Widerrufshinweis+bestätigen");
  const r = await resolveOrder(u.id, Object.fromEntries(fd) as Record<string, string>); if ("error" in r && typeof r.error === "string") redirect(`/portal/billing?e=${encodeURIComponent(r.error)}`);
  const pay = await db.payment.create({ data: { userId: u.id, kind: r.kind, packageId: r.pkg.id, serverName: r.name, serverId: r.server?.id, months: r.months, baseCents: r.q.base, feeCents: r.q.fee, totalCents: r.q.total, method: r.method, consentAt: new Date() } });
  let url: string | null = null;
  try { const m = await createPayment({ cents: r.q.total, method: r.method, description: `Chip Networks – ${r.pkg.name}, ${r.months} Monat(e)`, redirectUrl: `${appUrl()}/portal/billing?p=${pay.id}`, metadata: { paymentId: pay.id },
      ...(!/localhost|127\.0\.0\.1/.test(appUrl()) && { webhookUrl: `${appUrl()}/api/mollie/webhook` }) }); await db.payment.update({ where: { id: pay.id }, data: { mollieId: m.id } }); url = m._links.checkout.href; } catch { /* unten */ }
  if (!url) { await db.payment.update({ where: { id: pay.id }, data: { status: "FAILED" } }); redirect("/portal/billing?e=Zahlung+derzeit+nicht+verfügbar"); }
  await audit(u.id, "payment.started", pay.id); redirect(url);
}
