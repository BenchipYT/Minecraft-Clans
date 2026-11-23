"use server";
import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import { audit, requireUser } from "@/lib/auth";
export async function requestRestore(fd: FormData) {
  const u = await requireUser(), id = String(fd.get("id"));
  if (fd.get("confirm") !== "WIEDERHERSTELLEN") redirect("/portal/backups?e=Bitte+WIEDERHERSTELLEN+eintippen");
  const b = await db.backup.findFirst({ where: { id, server: { ownerId: u.id } } }); // nur eigene Backups
  if (!b) redirect("/portal/backups");
  await db.backup.update({ where: { id }, data: { restoreRequestedAt: new Date() } }); await audit(u.id, "backup.restore_request", id); redirect("/portal/backups?ok=1");
}
