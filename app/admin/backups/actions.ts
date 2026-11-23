"use server";
import { revalidatePath } from "next/cache"; import { db } from "@/lib/db"; import { audit, requirePerm } from "@/lib/auth"; import { clientCall } from "@/lib/ptero-client"; import { notify } from "@/lib/notify";
export async function addBackup(fd: FormData) {
  const u = await requirePerm("backups"), label = String(fd.get("label")).trim().slice(0, 100);
  if (!label) return; const b = await db.backup.create({ data: { serverId: String(fd.get("serverId")), label } }); await audit(u.id, "backup.add", b.id); revalidatePath("/admin/backups");
}
export async function closeRestore(fd: FormData) {
  const u = await requirePerm("backups"), id = String(fd.get("id"));
  const b = await db.backup.update({ where: { id }, data: { restoreRequestedAt: null }, include: { server: true } }); await notify(b.server.ownerId, `Wiederherstellung für ${b.server.name} abgeschlossen`, "/portal/backups"); await audit(u.id, "backup.restore_done", id); revalidatePath("/admin/backups");
}
export async function restoreNow(fd: FormData) {
  const u = await requirePerm("backups"), id = String(fd.get("id"));
  if (fd.get("confirm") !== "RESTORE") return; // Sicherheitsabfrage: überschreibt den Serverstand
  const b = await db.backup.findUnique({ where: { id }, include: { server: true } }); if (!b?.panelUuid) return;
  try { await clientCall(b.server, `/backups/${b.panelUuid}/restore`, { method: "POST", body: JSON.stringify({ truncate: true }) }); await db.backup.update({ where: { id }, data: { restoreRequestedAt: null } });
    await audit(u.id, "backup.restore", id); await notify(b.server.ownerId, `Wiederherstellung für ${b.server.name} gestartet`, "/portal/backups"); } catch (e) { await audit(u.id, `backup.restore_failed: ${(e as Error).message}`.slice(0, 200), id); }
  revalidatePath("/admin/backups");
}
