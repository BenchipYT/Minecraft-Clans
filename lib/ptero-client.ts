/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "./db"; import { ptero } from "./pterodactyl";
type S = { id: string; pteroId: number | null; pteroIdentifier: string | null };
/** Client-API des Panels. Key bleibt serverseitig; Aufrufer müssen vorher prüfen, dass der Nutzer den Server besitzen darf. */
export async function clientCall<T = any>(s: S, path: string, init?: RequestInit): Promise<T> {
  if (!process.env.PTERODACTYL_URL || !process.env.PTERODACTYL_CLIENT_KEY) throw new Error("Panel-Client-API nicht konfiguriert");
  if (!s.pteroId) throw new Error("Server wird noch eingerichtet");
  let ident = s.pteroIdentifier;
  if (!ident) { const r: any = await ptero(`/servers/${s.pteroId}`); ident = r.attributes.identifier as string; await db.server.update({ where: { id: s.id }, data: { pteroIdentifier: ident } }); }
  const r = await fetch(`${process.env.PTERODACTYL_URL}/api/client/servers/${ident}${path}`, { ...init, cache: "no-store", headers: { Authorization: `Bearer ${process.env.PTERODACTYL_CLIENT_KEY}`, Accept: "application/json", "Content-Type": "application/json" } });
  if (!r.ok) throw new Error(`Panel antwortet ${r.status}`);
  return (r.status === 204 ? undefined : await r.json()) as T;
}
