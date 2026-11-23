import Link from "next/link"; import { notFound } from "next/navigation"; import { requireUser } from "@/lib/auth"; import { db } from "@/lib/db"; import { Thread, Badge, STATUS } from "@/lib/tickets"; import { reply, setClosed } from "../actions";
export const dynamic = "force-dynamic";
export default async function T({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ e?: string }> }) {
  const u = await requireUser(), { id } = await params, { e } = await searchParams;
  const t = await db.ticket.findFirst({ where: { id, ownerId: u.id }, include: { messages: { where: { internal: false }, orderBy: { createdAt: "asc" }, include: { author: true, attachments: true } } } });
  if (!t) notFound();
  const srv = t.serverId ? await db.server.findFirst({ where: { id: t.serverId, ownerId: u.id } }) : null;
  return (<div className="mx-auto max-w-2xl space-y-4"><Link href="/portal/tickets" className="text-sm text-muted">← Alle Tickets</Link>
    <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-bold"><span className="text-muted">#{t.number}</span> {t.subject}</h1><Badge map={STATUS} k={t.status} /></div>
    <p className="text-sm text-muted">{t.category}{srv && ` · Server ${srv.name}`} · erstellt am {t.createdAt.toLocaleDateString("de-DE")}</p>
    {e && <p className="text-red-400">{e}</p>}<Thread messages={t.messages} />
    {t.status !== "CLOSED" ? <><form action={reply} className="card space-y-3"><input type="hidden" name="id" value={t.id} /><textarea name="body" rows={4} required placeholder="Antwort schreiben…" className="input" />
      <input type="file" name="files" multiple accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,.log" className="text-sm" /><button className="btn btn-primary">Antworten</button></form>
      <form action={setClosed}><input type="hidden" name="id" value={t.id} /><input type="hidden" name="closed" value="1" /><button className="text-sm text-muted hover:text-white">Problem gelöst? Ticket schließen</button></form></>
      : <form action={setClosed} className="card flex items-center justify-between"><input type="hidden" name="id" value={t.id} /><input type="hidden" name="closed" value="0" /><span className="text-muted">Dieses Ticket ist geschlossen.</span><button className="btn btn-ghost">Wieder öffnen</button></form>}</div>);
}
