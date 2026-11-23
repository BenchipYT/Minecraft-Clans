import { requireUser } from "@/lib/auth"; import { db } from "@/lib/db"; import { requestRestore } from "./actions";
export const dynamic = "force-dynamic";
export default async function P({ searchParams }: { searchParams: Promise<{ ok?: string; e?: string }> }) {
  const u = await requireUser(), { ok, e } = await searchParams;
  const bs = await db.backup.findMany({ where: { server: { ownerId: u.id } }, include: { server: true }, orderBy: { createdAt: "desc" } });
  return (<><h1 className="text-2xl font-bold">Backups</h1>{ok && <p className="mt-2 text-green-400">Wiederherstellung angefragt, unser Team meldet sich.</p>}{e && <p className="mt-2 text-red-400">{e}</p>}
    <div className="mt-4 space-y-2">{bs.length === 0 && <p className="text-muted">Keine Backups vorhanden.</p>}{bs.map(b => <form key={b.id} action={requestRestore} className="card flex flex-wrap items-center gap-2"><input type="hidden" name="id" value={b.id} />
      <span className="flex-1">{b.server.name} · {b.label} <span className="text-sm text-muted">· {b.createdAt.toLocaleString("de-DE")}</span></span>
      {b.restoreRequestedAt ? <span className="text-accent">Anfrage gesendet</span> : <><input name="confirm" placeholder="WIEDERHERSTELLEN" className="input w-44" /><button className="btn btn-ghost">Wiederherstellung anfragen</button></>}</form>)}</div></>);
}
