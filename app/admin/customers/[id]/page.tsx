import { notFound } from "next/navigation"; import { requirePerm } from "@/lib/auth"; import { db } from "@/lib/db"; import { toggleBlock, saveNote, changeServerPackage } from "../actions";
export const dynamic = "force-dynamic";
export default async function ACD({ params }: { params: Promise<{ id: string }> }) {
  const me = await requirePerm("customers"), { id } = await params;
  const [c, pk] = await Promise.all([db.user.findUnique({ where: { id }, include: { servers: { include: { package: true } } } }), db.package.findMany({ orderBy: { sortOrder: "asc" } })]);
  if (!c) notFound();
  const mayEdit = true;
  return (<div className="mx-auto max-w-2xl space-y-4"><h1 className="text-2xl font-bold">{c.name}</h1><p className="text-muted">{c.email} · {c.role} · {c.blocked ? "gesperrt" : "aktiv"}</p>
    {mayEdit && <form action={toggleBlock}><input type="hidden" name="id" value={c.id} /><button className="btn btn-ghost">{c.blocked ? "Freigeben" : "Account sperren"}</button></form>}
    <h2 className="font-semibold">Server</h2>{c.servers.length === 0 && <p className="text-muted">Keine Server.</p>}
    {c.servers.map(s => <form key={s.id} action={changeServerPackage} className="card flex items-center gap-2"><input type="hidden" name="id" value={c.id} /><input type="hidden" name="serverId" value={s.id} /><span className="flex-1">{s.name}</span>
      <select name="packageId" defaultValue={s.packageId} disabled={!mayEdit} className="input w-auto">{pk.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>{mayEdit && <button className="btn btn-ghost">Paket ändern</button>}</form>)}
    <form action={saveNote} className="card space-y-2"><input type="hidden" name="id" value={c.id} /><textarea name="note" rows={4} defaultValue={c.internalNote ?? ""} placeholder="Interne Notiz" className="input" /><button className="btn btn-primary">Notiz speichern</button></form></div>);
}
