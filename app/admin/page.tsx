/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link"; import { requireStaff, can } from "@/lib/auth"; import { db } from "@/lib/db"; import { ptero, pteroConfigured } from "@/lib/pterodactyl";
export const dynamic = "force-dynamic";
const Stat = ({ label, value, href, warn }: { label: string; value: React.ReactNode; href: string; warn?: boolean }) => <Link href={href} className={"card hover:border-accent " + (warn ? "border-red-400" : "")}><p className="text-xs text-muted">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></Link>;
async function panel() {
  if (!pteroConfigured()) return { text: "Panel nicht konfiguriert", ok: false };
  try { const n: any[] = ((await Promise.race([ptero<any>("/nodes"), new Promise((_, r) => setTimeout(() => r(new Error("Zeitüberschreitung")), 4000))])) as any).data;
    const mem = n.reduce((a, x) => a + (x.attributes.memory ?? 0), 0), used = n.reduce((a, x) => a + (x.attributes.allocated_resources?.memory ?? 0), 0);
    return { text: `Panel erreichbar · ${n.length} Node(s)${mem ? ` · RAM ${Math.round((used / mem) * 100)} % zugewiesen` : ""}`, ok: true };
  } catch (e) { return { text: `Panel nicht erreichbar: ${(e as Error).message}`, ok: false }; }
}
export default async function A() {
  const me = await requireStaff(), c = (p: Parameters<typeof can>[1]) => can(me, p);
  const [customers, creators, active, errors, apps, tickets, logs, pn] = await Promise.all([
    c("customers") ? db.user.count({ where: { role: "CUSTOMER" } }) : null, c("customers") ? db.server.findMany({ where: { package: { slug: "free" } }, distinct: ["ownerId"], select: { ownerId: true } }).then(r => r.length) : null,
    c("servers") ? db.server.count({ where: { status: "READY" } }) : null, c("servers") ? db.server.count({ where: { status: "ERROR" } }) : null,
    c("applications") ? db.creatorApplication.count({ where: { status: "OPEN" } }) : null, c("tickets") ? db.ticket.count({ where: { status: "OPEN" } }) : null,
    c("logs") ? db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }) : null, c("servers") ? panel() : null]);
  const names = new Map((logs ? await db.user.findMany({ where: { id: { in: logs.flatMap(l => (l.actorId ? [l.actorId] : [])) } } }) : []).map(u => [u.id, u.name]));
  return (<div className="space-y-6"><h1 className="text-2xl font-bold">Übersicht</h1>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {customers !== null && <Stat label="Kunden" value={customers} href="/admin/customers" />}{creators !== null && <Stat label="Creator (Free-Server)" value={creators} href="/admin/customers" />}
      {active !== null && <Stat label="Aktive Server" value={active} href="/admin/servers" />}{errors !== null && errors > 0 && <Stat label="Server mit Fehler" value={errors} href="/admin/servers" warn />}
      {apps !== null && <Stat label="Offene Bewerbungen" value={apps} href="/admin/applications" />}{tickets !== null && <Stat label="Tickets, die auf uns warten" value={tickets} href="/admin/tickets" />}</div>
    {pn && <div className={"card flex items-center gap-3 " + (pn.ok ? "" : "border-red-400")}><span className={"h-2 w-2 rounded-full " + (pn.ok ? "bg-green-400" : "bg-red-400")} /><span className="text-sm">{pn.text}</span></div>}
    {logs && <div><div className="mb-2 flex justify-between"><h2 className="font-semibold">Letzte Aktivitäten</h2><Link href="/admin/logs" className="text-sm text-accent">Alle Logs →</Link></div>
      <div className="space-y-1">{logs.map(l => <div key={l.id} className="card py-2 text-sm"><span className="text-muted">{l.createdAt.toLocaleString("de-DE")}</span> · <b>{l.actorId ? names.get(l.actorId) ?? "?" : "System"}</b> · {l.action}</div>)}</div></div>}</div>);
}
