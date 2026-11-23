import Link from "next/link"; import { requirePerm } from "@/lib/auth"; import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function P({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requirePerm("logs"); const { q = "", page = "1" } = await searchParams, pg = Math.max(1, Number(page) || 1), where = q ? { action: { contains: q, mode: "insensitive" as const } } : {};
  const logs = await db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 51, skip: (pg - 1) * 50 }), shown = logs.slice(0, 50);
  const names = new Map((await db.user.findMany({ where: { id: { in: shown.flatMap(l => (l.actorId ? [l.actorId] : [])) } } })).map(u => [u.id, `${u.name} (${u.email})`]));
  const href = (n: number) => `/admin/logs?q=${encodeURIComponent(q)}&page=${n}`;
  return (<><h1 className="text-2xl font-bold">Logs &amp; Aktivitäten</h1><p className="text-muted">Wer hat wann was geändert.</p>
    <form className="card mt-4 flex gap-2"><input name="q" defaultValue={q} placeholder="Aktion filtern, z. B. ticket, server, payment" className="input" /><button className="btn btn-ghost">Suchen</button></form>
    <div className="mt-4 space-y-1">{shown.map(l => <div key={l.id} className="card py-2 text-sm"><span className="text-muted">{l.createdAt.toLocaleString("de-DE")}</span> · <b>{l.actorId ? names.get(l.actorId) ?? l.actorId : "System"}</b> · {l.action}{l.target && <span className="text-muted"> · {l.target}</span>}</div>)}</div>
    <div className="mt-4 flex justify-between text-sm">{pg > 1 ? <Link href={href(pg - 1)} className="text-accent">← Neuere</Link> : <span />}{logs.length > 50 && <Link href={href(pg + 1)} className="text-accent">Ältere →</Link>}</div></>);
}
