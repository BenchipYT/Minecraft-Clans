import { requirePerm } from "@/lib/auth"; import { db } from "@/lib/db"; import { createPlugin, installPlugin } from "./actions";
export const dynamic = "force-dynamic";
const I = ({ n, p }: { n: string; p: string }) => <input name={n} placeholder={p} className="input" />;
export default async function P() {
  await requirePerm("plugins");
  const [pl, sv] = await Promise.all([db.plugin.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { servers: true } } } }), db.server.findMany({ include: { owner: true } })]);
  return (<><h1 className="text-2xl font-bold">Plugin-Bibliothek</h1>
    <form action={createPlugin} className="card mt-4 grid gap-2 sm:grid-cols-2"><I n="name" p="Name" /><I n="version" p="Version" /><I n="mcVersions" p="MC-Versionen (z. B. 1.21.x)" /><I n="dependencies" p="Abhängigkeiten" /><I n="source" p="Downloadquelle (URL)" /><I n="license" p="Lizenz" />
      <input name="description" placeholder="Beschreibung" className="input sm:col-span-2" /><textarea name="changelog" placeholder="Changelog" className="input sm:col-span-2" /><button className="btn btn-primary sm:col-span-2">Plugin hinzufügen</button></form>
    <form action={installPlugin} className="card mt-4 flex flex-wrap gap-2"><select name="serverId" className="input w-auto">{sv.map(x => <option key={x.id} value={x.id}>{x.name} ({x.owner.email})</option>)}</select>
      <select name="pluginId" className="input w-auto">{pl.map(x => <option key={x.id} value={x.id}>{x.name} {x.version}</option>)}</select><button className="btn btn-ghost">Auf Server installieren</button></form>
    <div className="mt-4 space-y-2">{pl.map(x => <div key={x.id} className="card"><b>{x.name}</b> <span className="text-sm text-muted">v{x.version} · MC {x.mcVersions} · {x._count.servers} Server · {x.license}</span><p className="text-sm text-muted">{x.description}</p></div>)}</div></>);
}
