import { requirePerm } from "@/lib/auth"; import { db } from "@/lib/db"; import { createServer, deleteServer, provision } from "./actions";
export const dynamic = "force-dynamic";
export default async function AS() {
  await requirePerm("servers");
  const [servers, pk] = await Promise.all([db.server.findMany({ include: { owner: true, package: true }, orderBy: { createdAt: "desc" } }), db.package.findMany({ orderBy: { sortOrder: "asc" } })]);
  return (<><h1 className="text-2xl font-bold">Server</h1>
    <form action={createServer} className="card mt-4 flex flex-wrap gap-2"><input name="name" placeholder="Servername" required className="input w-auto" /><input name="email" type="email" placeholder="E-Mail des Kunden" required className="input w-auto" />
      <select name="packageId" className="input w-auto">{pk.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><button className="btn btn-primary">Server anlegen</button></form>
    <div className="mt-4 space-y-2">{servers.map(s => <form key={s.id} action={deleteServer} className="card flex items-center justify-between"><input type="hidden" name="id" value={s.id} />
      <span>{s.name} <span className="text-sm text-muted">· {s.owner.email} · {s.package.name} · {s.status}</span></span><button formAction={provision} className="btn btn-ghost">Provisionieren</button><button className="btn btn-ghost">Löschen</button></form>)}</div></>);
}
