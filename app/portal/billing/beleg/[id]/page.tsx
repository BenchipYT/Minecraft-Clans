import { notFound } from "next/navigation"; import { requireUser } from "@/lib/auth"; import { db } from "@/lib/db"; import { eur, LABEL } from "@/lib/payments";
export const dynamic = "force-dynamic";
/** Rechnung/Beleg zum Ausdrucken. Firmen- und Steuerangaben kommen aus der Konfiguration und MÜSSEN vor Livegang geprüft werden. */
export default async function P({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser(), p = await db.payment.findFirst({ where: { id: (await params).id, userId: u.id, status: "PAID" }, include: { package: true } }); if (!p) notFound();
  const vat = Number(process.env.VAT_PERCENT ?? 0), vatCents = vat ? Math.round(p.totalCents - p.totalCents / (1 + vat / 100)) : 0, e = process.env;
  return (<div className="card mx-auto max-w-2xl space-y-4 text-sm"><div className="flex justify-between"><div><b>{e.COMPANY_NAME ?? "Chip Networks"}</b><p className="whitespace-pre-line text-muted">{e.COMPANY_ADDRESS}</p>{e.VAT_ID && <p className="text-muted">USt-IdNr.: {e.VAT_ID}</p>}</div>
    <div className="text-right"><h1 className="text-xl font-bold">Rechnung {p.invoiceNo}</h1><p className="text-muted">{p.paidAt?.toLocaleDateString("de-DE")}</p></div></div>
    <p>Rechnungsempfänger: {u.name} ({u.email})</p>
    <div className="space-y-1 border-y border-line py-3"><div className="flex justify-between"><span>{p.package.name} – {p.serverName}, {p.months} Monat(e)</span><span>{eur(p.baseCents)}</span></div>
      {p.feeCents > 0 && <div className="flex justify-between"><span>Zahlungsgebühr {LABEL[p.method] ?? p.method}</span><span>{eur(p.feeCents)}</span></div>}
      <div className="flex justify-between font-bold"><span>Gesamt</span><span>{eur(p.totalCents)}</span></div>{vat > 0 && <p className="text-muted">Enthaltene USt {vat} %: {eur(vatCents)}</p>}</div>
    <p className="text-muted">{e.INVOICE_TAX_NOTE ?? "Steuerhinweis noch nicht konfiguriert."}</p></div>);
}
