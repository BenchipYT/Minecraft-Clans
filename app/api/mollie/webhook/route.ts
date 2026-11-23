import { db } from "@/lib/db"; import { settlePayment } from "@/lib/payments";
/** Mollie sendet nur die Payment-ID; der Status wird immer selbst per API (mit unserem Key) abgefragt. */
export async function POST(req: Request) {
  const id = String((await req.formData()).get("id") ?? "");
  if (/^tr_\w+$/.test(id)) { try { const p = await db.payment.findUnique({ where: { mollieId: id } }); if (p) await settlePayment(p.id); } catch (e) { console.error("[mollie webhook]", (e as Error).message); return new Response("retry", { status: 500 }); } }
  return new Response("ok");
}
