import Link from "next/link"; import { requireUser } from "@/lib/auth"; import { db } from "@/lib/db"; import { CATEGORIES, STATUS, Badge } from "@/lib/tickets"; import { createTicket } from "./actions";
export const dynamic = "force-dynamic";
export default async function Tickets({ searchParams }: { searchParams: Promise<{ e?: string; s?: string }> }) {
  const u = await requireUser(), { e, s } = await searchParams, closed = s === "closed";
  const [ts, servers] = await Promise.all([db.ticket.findMany({ where: { ownerId: u.id, status: closed ? "CLOSED" : { not: "CLOSED" } }, orderBy: { updatedAt: "desc" } }), db.server.findMany({ where: { ownerId: u.id } })]);
  const tab = (on: boolean) => "rounded-lg px-3 py-1 text-sm " + (on ? "bg-surface text-accent" : "text-muted hover:text-white");
  return (<div className="grid gap-8 lg:grid-cols-2"><div><h1 className="text-2xl font-bold">Support</h1><div className="mt-3 flex gap-1"><Link href="/portal/tickets" className={tab(!closed)}>Offen</Link><Link href="/portal/tickets?s=closed" className={tab(closed)}>Geschlossen</Link></div>
    <div className="mt-4 space-y-2">{ts.length === 0 && <p className="text-muted">Keine Tickets.</p>}{ts.map(t => <Link key={t.id} href={`/portal/tickets/${t.id}`} className="card flex items-center justify-between gap-3 hover:border-accent">
      <span><span className="text-muted">#{t.number}</span> {t.subject}<span className="block text-xs text-muted">{t.category} · {t.updatedAt.toLocaleDateString("de-DE")}</span></span><Badge map={STATUS} k={t.status} /></Link>)}</div></div>
    <form action={createTicket} className="card h-fit space-y-3"><h2 className="font-semibold">Neues Ticket</h2>{e && <p className="text-red-400">{e}</p>}
      <select name="category" className="input">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
      {servers.length > 0 && <select name="serverId" className="input"><option value="">Betrifft keinen bestimmten Server</option>{servers.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select>}
      <input name="subject" placeholder="Betreff" required className="input" /><textarea name="body" rows={5} placeholder="Beschreibe dein Anliegen" required className="input" />
      <input type="file" name="files" multiple accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,.log" className="text-sm" /><button className="btn btn-primary w-full">Ticket erstellen</button></form></div>);
}
