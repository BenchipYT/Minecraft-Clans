"use server";
import { revalidatePath } from "next/cache"; import { db } from "@/lib/db"; import { audit, requirePerm } from "@/lib/auth"; import { clientCall } from "@/lib/ptero-client";
const R = ["OWNER", "ADMIN", "TECHNICIAN"] as const, s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim().slice(0, 2000);
export async function createPlugin(fd: FormData) {
  const u = await requirePerm("plugins");
  if (!s(fd, "name") || !s(fd, "version") || !s(fd, "source")) return;
  const p = await db.plugin.create({ data: { name: s(fd, "name"), description: s(fd, "description"), version: s(fd, "version"), mcVersions: s(fd, "mcVersions"), dependencies: s(fd, "dependencies") || null, source: s(fd, "source"), license: s(fd, "license") || null, changelog: s(fd, "changelog") || null } });
  await audit(u.id, "plugin.create", p.id); revalidatePath("/admin/plugins");
}
export async function installPlugin(fd: FormData) {
  const u = await requirePerm("plugins"), serverId = s(fd, "serverId"), pluginId = s(fd, "pluginId");
  await db.serverPlugin.upsert({ where: { serverId_pluginId: { serverId, pluginId } }, update: {}, create: { serverId, pluginId, installedById: u.id } }); // idempotent; Datei-Installation via Pterodactyl folgt in Phase 4
  const srv = await db.server.findUnique({ where: { id: serverId } }), pl = await db.plugin.findUnique({ where: { id: pluginId } });
  if (srv?.pteroId && pl && process.env.PTERODACTYL_CLIENT_KEY) { const safe = (x: string) => x.replace(/[^\w.-]/g, "_");
    try { await clientCall(srv, "/files/pull", { method: "POST", body: JSON.stringify({ url: pl.source, directory: "/plugins", filename: `${safe(pl.name)}-${safe(pl.version)}.jar`, use_header: false, foreground: true }) }); }
    catch (e) { await audit(u.id, `plugin.pull_failed: ${(e as Error).message}`.slice(0, 200), `${serverId}:${pluginId}`); } }
  await audit(u.id, "plugin.install", `${serverId}:${pluginId}`); revalidatePath("/admin/plugins");
}
