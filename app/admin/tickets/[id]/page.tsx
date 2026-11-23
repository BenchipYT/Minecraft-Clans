import Link from "next/link"; import { notFound } from "next/navigation"; import { requirePerm } from "@/lib/auth"; import { db } from "@/lib/db"; import { Thread, Badge, STATUS, PRIO } from "@/lib/tickets"; import Canned from "@/components/Canned"; import { staffReply, updateTicket } from "../actions";
export const dynamic = "force-dynamic";
export default async function ATD({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ e?: string }> }) {
  await requirePerm("tickets"); const { id } = await params, { e } = await searchParams;
  const t = await db.ticket.findUnique({ where: { id }, include: { owner: true, messages: { orderBy: { createdAt: "asc" }, include: { author: true, attachments: true } } } });
  if (!t) notFound();
  const [assignee, srv] = await Promise.all([t.assigneeId ? db.user.findUnique({ where: { id: t.assigneeId } }) : null, t.serverId ? db.server.findUnique({ where: { id: t.serverId } }) : null]);
  return (<div className="mx-auto max-w-3xl space-y-4"><Link href="/admin/tickets" className="text-sm text-muted">← Alle Tickets</Link>
    <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-bold"><span className="text-muted">#{t.number}</span> {t.subject}</h1><span className="flex gap-2"><Badge map={PRIO} k={t.priority} /><Badge map={STATUS} k={t.status} /></span></div>
    <p className="text-sm text-muted">{t.owner.name} · {t.owner.email} · <Link href={`/admin/customers/${t.owner.id}`} className="text-accent">Kundenprofil</Link> · {t.category}{srv && ` · Server ${srv.name} (${srv.status})`} · Zuständig: {assignee?.name ?? "niemand"}</p>
    <form action={updateTicket} className="card flex flex-wrap items-center gap-2"><input type="hidden" name="id" value={t.id} />
      <select name="status" defaultValue={t.status} className="input w-auto">{["OPEN", "ANSWERED", "CLOSED"].map(s => <option key={s} value={s}>{STATUS[s][0]}</option>)}</select>
      <select name="priority" defaultValue={t.priority} className="input w-auto">{["LOW", "NORMAL", "HIGH"].map(s => <option key={s} value={s}>{PRIO[s][0]}</option>)}</select>
      <label className="text-sm"><input type="checkbox" name="assignMe" /> mir zuweisen</label><button className="btn btn-ghost">Speichern</button></form>
    {e && <p className="text-red-400">{e}</p>}<Thread messages={t.messages} />
    <form action={staffReply} className="card space-y-3"><input type="hidden" name="id" value={t.id} /><Canned target="reply" /><textarea id="reply" name="body" rows={5} required className="input" />
      <input type="file" name="files" multiple accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,.log" className="text-sm" /><label className="block text-sm"><input type="checkbox" name="internal" /> interne Notiz (für Kunden unsichtbar)</label><button className="btn btn-primary">Senden</button></form></div>);
}
