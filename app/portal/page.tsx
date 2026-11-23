import Link from "next/link"; import { requireUser } from "@/lib/auth"; import { db } from "@/lib/db"; import { resendVerification } from "../login/actions"; import StatusBadge from "@/components/StatusBadge"; import CopyButton from "@/components/CopyButton";
export const dynamic = "force-dynamic";
const Stat = ({ label, value, href }: { label: string; value: React.ReactNode; href?: string }) => { const b = <div className="card hover:border-accent"><p className="text-xs text-muted">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>; return href ? <Link href={href}>{b}</Link> : b; };
export default async function Portal({ searchParams }: { searchParams: Promise<{ ok?: string; e?: string }> }) {
  const u = await requireUser(), { ok, e } = await searchParams, now = Date.now();
  const [servers, open, news] = await Promise.all([db.server.findMany({ where: { ownerId: u.id }, include: { package: true }, orderBy: { createdAt: "asc" } }), db.ticket.count({ where: { ownerId: u.id, status: { not: "CLOSED" } } }), db.news.findMany({ orderBy: { createdAt: "desc" }, take: 3 })]);
  const warn = servers.filter(s => s.paidUntil && s.paidUntil.getTime() < now + 7 * 864e5), next = servers.flatMap(s => (s.paidUntil ? [s.paidUntil] : [])).sort((a, b) => +a - +b)[0];
  return (<div className="space-y-6"><h1 className="text-2xl font-bold">Hallo, {u.name}</h1>
    {ok && <p className="text-green-400">{ok}</p>}{e && <p className="text-red-400">{e}</p>}
    {!u.emailVerified && <form action={resendVerification} className="card flex flex-wrap items-center justify-between gap-2 border-accent"><p className="text-sm">Bitte bestätige deine E-Mail-Adresse, sonst sind Tickets und Serversteuerung gesperrt.</p><button className="btn btn-ghost">Mail erneut senden</button></form>}
    {warn.map(s => <Link key={s.id} href="/portal/billing" className="card block border-accent text-sm">{s.paidUntil!.getTime() < now ? `„${s.name}“ ist abgelaufen und pausiert.` : `„${s.name}“ läuft am ${s.paidUntil!.toLocaleDateString("de-DE")} ab.`} <span className="text-accent">Jetzt verlängern →</span></Link>)}
    <div className="grid gap-4 sm:grid-cols-3"><Stat label="Server" value={servers.length} /><Stat label="Offene Tickets" value={open} href="/portal/tickets" /><Stat label="Nächste Verlängerung" value={next ? next.toLocaleDateString("de-DE") : "–"} href="/portal/billing" /></div>
    <div><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Meine Server</h2><Link href="/portal/billing" className="text-sm text-accent">Server bestellen →</Link></div>
      <div className="grid gap-4 sm:grid-cols-2">{servers.length === 0 && <p className="text-muted">Noch keine Server. Bewirb dich für das <Link href="/creator-programm" className="text-accent">Creator-Programm</Link> oder bestelle unter Abrechnung.</p>}
        {servers.map(s => <div key={s.id} className="card space-y-2"><div className="flex items-start justify-between"><Link href={`/portal/servers/${s.id}`} className="font-bold text-accent">{s.name}</Link>{s.pteroId ? <StatusBadge id={s.id} /> : <span className="text-sm text-muted">{s.status === "ERROR" ? "Fehler, Team informiert" : "Wird eingerichtet…"}</span>}</div>
          <p className="text-sm text-muted">{s.package.name} · {s.package.ramGb} GB · Minecraft {s.version}</p>
          {s.address && <p className="flex items-center gap-2 text-sm"><code>{s.address}</code><CopyButton text={s.address} /></p>}
          <div className="flex gap-3 text-sm"><Link href={`/portal/servers/${s.id}`} className="text-accent">Verwalten</Link><Link href="/portal/tickets" className="text-muted hover:text-white">Änderung anfragen</Link></div></div>)}</div></div>
    {news.length > 0 && <div><h2 className="mb-3 font-semibold">Neuigkeiten</h2><div className="space-y-2">{news.map(n => <div key={n.id} className="card"><b className="text-accent">{n.title}</b><p className="text-sm text-muted">{n.body}</p></div>)}</div></div>}</div>);
}
