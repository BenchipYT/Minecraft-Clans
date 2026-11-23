/* eslint-disable @typescript-eslint/no-explicit-any */
import { requirePerm } from "@/lib/auth"; import { ptero } from "@/lib/pterodactyl";
export const dynamic = "force-dynamic";
export default async function P() {
  await requirePerm("servers"); let nodes: any[] = [], err = "";
  try { nodes = (await ptero<any>("/nodes?include=allocations")).data; } catch (e) { err = (e as Error).message; }
  return (<><h1 className="text-2xl font-bold">Nodes</h1><p className="text-muted">Nur Lesezugriff aus dem Panel. Neue Nodes legst du im Pterodactyl-Panel an; neue Server nutzen den Node aus <code>PTERO_NODE_ID</code>.</p>
    {err && <p className="mt-4 text-red-400">Panel nicht erreichbar: {err}</p>}
    <div className="mt-4 space-y-2">{nodes.map(({ attributes: n }) => { const al: any[] = n.relationships?.allocations?.data ?? [], free = al.filter(a => !a.attributes.assigned).length;
      return <div key={n.id} className="card"><b>{n.name}</b> <span className="text-sm text-muted">· {n.fqdn} · RAM {n.memory} MB · Disk {n.disk} MB · Allocations frei {free}/{al.length}</span></div>; })}</div></>);
}
