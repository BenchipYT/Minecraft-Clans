"use server";
import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import { audit, requireVerified } from "@/lib/auth"; import { clientCall } from "@/lib/ptero-client"; import { limited } from "@/lib/ratelimit";
async function mine(fd: FormData) { const u = await requireVerified(), id = String(fd.get("id")); return { u, id, s: await db.server.findFirst({ where: { id, ownerId: u.id } }) }; }
export async function power(fd: FormData) {
  const { u, id, s } = await mine(fd), signal = String(fd.get("signal"));
  if (!s || !["start", "stop", "restart", "kill"].includes(signal)) redirect("/portal");
  if (await limited("power", 10)) redirect(`/portal/servers/${id}?e=Zu+viele+Aktionen`);
  let msg = `ok=${signal}`; try { await clientCall(s, "/power", { method: "POST", body: JSON.stringify({ signal }) }); await audit(u.id, `server.${signal}`, id); } catch (e) { msg = "e=" + encodeURIComponent((e as Error).message); }
  redirect(`/portal/servers/${id}?${msg}`);
}
export async function sendCommand(fd: FormData) {
  const { u, id, s } = await mine(fd), command = String(fd.get("command")).trim().slice(0, 200);
  if (!s || !command) redirect("/portal");
  if (await limited("cmd", 30)) redirect(`/portal/servers/${id}?e=Zu+viele+Befehle`);
  let msg = "ok=command"; try { await clientCall(s, "/command", { method: "POST", body: JSON.stringify({ command }) }); await audit(u.id, "server.command", id); } catch (e) { msg = "e=" + encodeURIComponent((e as Error).message); }
  redirect(`/portal/servers/${id}?${msg}`);
}
export async function createBackup(fd: FormData) {
  const { u, id, s } = await mine(fd); if (!s) redirect("/portal");
  if (await limited("backup", 3, 36e5)) redirect(`/portal/servers/${id}?e=Zu+viele+Backups`);
  let msg = "ok=backup"; try { await clientCall(s, "/backups", { method: "POST", body: JSON.stringify({ name: `Manuell ${new Date().toLocaleDateString("de-DE")}` }) }); await audit(u.id, "backup.create", id); } catch (e) { msg = "e=" + encodeURIComponent((e as Error).message); }
  redirect(`/portal/servers/${id}?${msg}`);
}
export async function syncBackups(fd: FormData) {
  const { id, s } = await mine(fd); if (!s) redirect("/portal");
  let msg = "ok=sync"; try {
    const r = await clientCall(s, "/backups");
    for (const b of r.data ?? []) { const a = b.attributes; if (!a.is_successful) continue; const d = { label: String(a.name).slice(0, 100), sizeMb: Math.round(a.bytes / 1048576) };
      await db.backup.upsert({ where: { panelUuid: a.uuid }, update: d, create: { ...d, serverId: s.id, panelUuid: a.uuid, createdAt: new Date(a.created_at) } }); }
  } catch (e) { msg = "e=" + encodeURIComponent((e as Error).message); }
  redirect(`/portal/servers/${id}?${msg}`);
}
