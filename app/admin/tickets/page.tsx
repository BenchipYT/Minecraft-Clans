import Link from "next/link"; import type { Prisma } from "@prisma/client"; import { requirePerm } from "@/lib/auth"; import { db } from "@/lib/db"; import { STATUS, PRIO, Badge } from "@/lib/tickets";
export const dynamic = "force-dynamic";
export default async function AT({ searchParams }: { searchParams: Promise<{ status?: string; prio?: string; mine?: string; q?: string }> }) {
  const me = await requirePerm("tickets"), sp = await searchParams, status = sp.status ?? "waiting", where: Prisma.TicketWhereInput = {};
  if (status === "waiting") where.status = "OPEN"; else if (status === "open") where.status = { not: "CLOSED" }; else if (status === "closed") where.status = "CLOSED";
  if (sp.prio) where.priority = sp.prio as "LOW"; if (sp.mine) where.assigneeId = me.id; if (sp.q) where.subject = { contains: sp.q, mode: "insensitive" };
  const ts = await db.ticket.findMany({ where, orderBy: [{ priority: "desc" }, { updatedAt: "asc" }], include: { owner: true }, take: 200 });
  const names = new Map((await db.user.findMany({ where: { id: { in: ts.flatMap(t => (t.assigneeId ? [t.assigneeId] : [])) } } })).map(x => [x.id, x.name]));
  return (<><h1 className="text-2xl font-bold">Tickets</h1>
    <form className="card mt-4 flex flex-wrap items-center gap-2"><select name="status" defaultValue={status} className="input w-auto"><option value="waiting">Wartet auf uns</option><option value="open">Alle offenen</option><option value="closed">Geschlossen</option><option value="all">Alle</option></select>
      <select name="prio" defaultValue={sp.prio ?? ""} className="input w-auto"><option value="">Jede Priorität</option><option value="HIGH">Hoch</option><option value="NORMAL">Normal</option><option value="LOW">Niedrig</option></select>
      <label className="text-sm"><input type="checkbox" name="mine" defaultChecked={!!sp.mine} value="1" /> nur meine</label><input name="q" defaultValue={sp.q ?? ""} placeholder="Betreff suchen" className="input w-auto" /><button className="btn btn-ghost">Filtern</button></form>
    <p className="mt-2 text-sm text-muted">{ts.length} Ticket(s), älteste zuerst, hohe Priorität oben.</p>
    <div className="mt-2 space-y-2">{ts.map(t => <Link key={t.id} href={`/admin/tickets/${t.id}`} className="card flex flex-wrap items-center justify-between gap-2 hover:border-accent">
      <span><span className="text-muted">#{t.number}</span> {t.subject}<span className="block text-xs text-muted">{t.owner.name} · {t.category} · {t.assigneeId ? `bei ${names.get(t.assigneeId) ?? "?"}` : "nicht zugewiesen"} · {t.updatedAt.toLocaleString("de-DE")}</span></span>
      <span className="flex gap-2"><Badge map={PRIO} k={t.priority} /><Badge map={STATUS} k={t.status} /></span></Link>)}</div></>);
}
