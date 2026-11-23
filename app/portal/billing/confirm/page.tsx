import Link from "next/link"; import { requireUser } from "@/lib/auth"; import { resolveOrder, eur, LABEL } from "@/lib/payments"; import { pay } from "../actions";
export const dynamic = "force-dynamic";
export default async function P({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const u = await requireUser(), p = await searchParams, r = await resolveOrder(u.id, p);
  if ("error" in r) return <div className="mx-auto max-w-md space-y-3"><p className="card text-red-400">{r.error}</p><Link href="/portal/billing" className="text-accent">← Zurück</Link></div>;
  return (<form action={pay} className="card mx-auto max-w-md space-y-3"><h1 className="text-xl font-bold">Bestellung prüfen</h1>
    {Object.entries(p).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
    <p>{r.kind === "RENEW" ? "Verlängerung" : "Neuer Server"}: <b>{r.name}</b> · {r.pkg.name} · {r.months} Monat(e)</p>
    <div className="space-y-1 text-sm"><div className="flex justify-between"><span>{r.pkg.name} × {r.months} Monat(e)</span><span>{eur(r.q.base)}</span></div>
      {r.q.fee > 0 && <div className="flex justify-between text-muted"><span>Zahlungsgebühr {LABEL[r.method] ?? r.method}</span><span>{eur(r.q.fee)}</span></div>}
      <div className="flex justify-between border-t border-line pt-1 font-bold"><span>Gesamt</span><span className="text-accent">{eur(r.q.total)}</span></div></div>
    <p className="text-xs text-muted">Einmalzahlung für den gewählten Zeitraum, keine automatische Verlängerung. Ohne Gebühr zahlst du z. B. per Überweisung. </p>
    <label className="block text-xs text-muted"><input type="checkbox" name="agb" required /> Ich habe die <Link href="/agb" className="underline">AGB</Link> und die <Link href="/datenschutz" className="underline">Datenschutzerklärung</Link> gelesen und akzeptiere die AGB.</label>
    <label className="block text-xs text-muted"><input type="checkbox" name="early" required /> Ich verlange ausdrücklich, dass Chip Networks sofort, also vor Ablauf der Widerrufsfrist, mit der Ausführung beginnt. Mir ist bekannt, dass ich mein Widerrufsrecht bei vollständiger Vertragserfüllung verliere und bei einem Widerruf nach Beginn Wertersatz schulde (<Link href="/widerruf" className="underline">Widerrufsbelehrung</Link>).</label>
    <button className="btn btn-primary w-full">Zahlungspflichtig bestellen</button></form>);
}
