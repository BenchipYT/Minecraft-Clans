/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "./db"; import { ptero } from "./pterodactyl"; import { dnsConfigured, ensureARecord } from "./cloudflare"; import { audit } from "./auth-audit";
/** Idempotent: Ein Server wird über external_id (= Server-ID) im Panel nur einmal angelegt, auch bei Job-Wiederholung. */
export async function provisionServer(serverId: string) {
  const s = await db.server.findUnique({ where: { id: serverId }, include: { owner: true, package: true } });
  if (!s) throw new Error("Server nicht gefunden"); if (s.pteroId) return;
  const e = process.env; for (const k of ["PTERO_NODE_ID", "PTERO_EGG_ID", "PTERO_DOCKER_IMAGE", "PTERO_STARTUP"]) if (!e[k]) throw new Error(`${k} fehlt in der Konfiguration`);
  await db.server.update({ where: { id: s.id }, data: { status: "PROVISIONING" } });
  try {
    let srv: any = null; try { srv = await ptero(`/servers/external/${s.id}`); } catch { /* existiert noch nicht */ }
    if (!srv) {
      const us: any = await ptero(`/users?filter[email]=${encodeURIComponent(s.owner.email)}`); let uid = us.data[0]?.attributes.id;
      if (!uid) { const [f, ...r] = s.owner.name.split(" "); const c: any = await ptero("/users", { method: "POST", body: JSON.stringify({ email: s.owner.email, username: (s.owner.email.split("@")[0].replace(/[^a-z0-9]/gi, "").slice(0, 20) || "kunde") + s.owner.id.slice(-3), first_name: f || "Kunde", last_name: r.join(" ") || "-" }) }); uid = c.attributes.id; }
      const al: any = await ptero(`/nodes/${e.PTERO_NODE_ID}/allocations?per_page=100`), a = al.data.find((x: any) => !x.attributes.assigned);
      if (!a) throw new Error("Keine freie Allocation auf dem Node");
      srv = await ptero("/servers", { method: "POST", body: JSON.stringify({ name: s.name, external_id: s.id, user: uid, egg: Number(e.PTERO_EGG_ID), docker_image: e.PTERO_DOCKER_IMAGE, startup: e.PTERO_STARTUP, environment: JSON.parse(e.PTERO_ENV_JSON || "{}"),
        limits: { memory: s.package.ramGb * 1024, swap: 0, disk: s.package.diskGb * 1024, io: 500, cpu: 0 }, feature_limits: { databases: 0, backups: 3, allocations: 1 }, allocation: { default: a.attributes.id } }) });
    }
    const full: any = await ptero(`/servers/${srv.attributes.id}?include=allocations`), al0 = full.attributes.relationships.allocations.data[0].attributes;
    const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "server";
    const address = dnsConfigured() ? await ensureARecord(`${slug}-${s.id.slice(-4)}`, al0.ip) : `${al0.ip}:${al0.port}`;
    await db.server.update({ where: { id: s.id }, data: { pteroId: srv.attributes.id, pteroIdentifier: srv.attributes.identifier, address, status: "READY" } }); await audit(null, "server.provisioned", s.id);
  } catch (err) { await db.server.update({ where: { id: s.id }, data: { status: "ERROR" } }); await audit(null, `server.provision_failed: ${(err as Error).message}`.slice(0, 200), s.id); throw err; }
}

/** Überträgt die Paket-Limits (RAM/Speicher) auf einen bestehenden Panel-Server, z. B. nach Paketwechsel. */
export async function applyLimits(serverId: string) {
  const s = await db.server.findUnique({ where: { id: serverId }, include: { package: true } }); if (!s?.pteroId) return;
  const a = ((await ptero(`/servers/${s.pteroId}`)) as any).attributes;
  await ptero(`/servers/${s.pteroId}/build`, { method: "PATCH", body: JSON.stringify({ allocation: a.allocation, memory: s.package.ramGb * 1024, swap: 0, disk: s.package.diskGb * 1024, io: 500, cpu: 0, threads: null, feature_limits: a.feature_limits }) });
}
