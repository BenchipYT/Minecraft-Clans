import { requirePerm } from "@/lib/auth"; import { db } from "@/lib/db"; import { addBackup, closeRestore, restoreNow } from "./actions";
export const dynamic = "force-dynamic";
export default async function P() {
  await requirePerm("backups");
  const [bs, sv] = await Promise.all([db.backup.findMany({ include: { server: { include: { owner: true } } }, orderBy: [{ restoreRequestedAt: "desc" }, { createdAt: "desc" }] }), db.server.findMany()]);
  return (<><h1 className="text-2xl font-bold">Backups</h1><p className="text-muted">Einträge werden mit der Pterodactyl-Anbindung automatisch synchronisiert; bis dahin manuell.</p>
    <form action={addBackup} className="card mt-4 flex gap-2"><select name="serverId" className="input w-auto">{sv.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select><input name="label" placeholder="Bezeichnung" className="input" /><button className="btn btn-ghost">Eintrag anlegen</button></form>
    <div className="mt-4 space-y-2">{bs.map(b => <form key={b.id} action={closeRestore} className="card flex items-center justify-between"><input type="hidden" name="id" value={b.id} /><span>{b.server.name} · {b.label} <span className="text-sm text-muted">· {b.server.owner.email}</span></span>
      {b.panelUuid && <span className="flex gap-2"><input name="confirm" placeholder="RESTORE" className="input w-28" /><button formAction={restoreNow} className="btn btn-ghost">Jetzt wiederherstellen</button></span>}{b.restoreRequestedAt && <button className="btn btn-primary">Anfrage erledigt</button>}</form>)}</div></>);
}
