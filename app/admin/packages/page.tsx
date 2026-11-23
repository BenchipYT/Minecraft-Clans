import { requirePerm } from "@/lib/auth"; import { db } from "@/lib/db"; import { updatePackage } from "./actions";
export const dynamic = "force-dynamic";
export default async function AP() {
  await requirePerm("packages");
  const pk = await db.package.findMany({ orderBy: { sortOrder: "asc" } });
  return (<><h1 className="text-2xl font-bold">Pakete</h1><p className="text-muted">Änderungen erscheinen sofort auf der Hosting-Seite. Preisänderungen gelten für neue Zahlungen.</p>
    <div className="mt-4 grid gap-4 md:grid-cols-2">{pk.map(p => (<form key={p.id} action={updatePackage} className="card space-y-2"><input type="hidden" name="id" value={p.id} />
      <input name="name" defaultValue={p.name} className="input" />
      <div className="grid grid-cols-4 gap-2 text-xs text-muted"><label>Preis €<input name="price" defaultValue={(p.priceCents / 100).toFixed(2)} className="input" /></label><label>RAM GB<input name="ramGb" defaultValue={p.ramGb} className="input" /></label>
        <label>Spieler<input name="maxPlayers" defaultValue={p.maxPlayers} className="input" /></label><label>Disk GB<input name="diskGb" defaultValue={p.diskGb} className="input" /></label></div>
      <textarea name="features" rows={4} defaultValue={p.features.join("\n")} className="input" /><label className="text-sm"><input type="checkbox" name="active" defaultChecked={p.active} /> aktiv</label>
      <button className="btn btn-primary block">Speichern</button></form>))}</div></>);
}
