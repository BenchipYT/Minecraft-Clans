"use server";
import { revalidatePath } from "next/cache"; import { db } from "@/lib/db"; import { audit, requirePerm } from "@/lib/auth";
const ROLES = ["CUSTOMER", "OWNER", "ADMIN", "TECHNICIAN", "SUPPORT", "CREATOR_MGMT"] as const;
const done = (id: string) => revalidatePath(`/admin/customers/${id}`);
export async function toggleBlock(fd: FormData) {
  const u = await requirePerm("customers"), id = String(fd.get("id"));
  const t = await db.user.findUnique({ where: { id } });
  if (!t || t.id === u.id || (t.role !== "CUSTOMER" && u.role !== "OWNER")) return; // keine Selbstsperre; Teammitglieder sperrt nur der Owner
  await db.user.update({ where: { id }, data: { blocked: !t.blocked } });
  if (!t.blocked) await db.session.deleteMany({ where: { userId: id } });
  await audit(u.id, t.blocked ? "user.unblock" : "user.block", id); done(id);
}
export async function saveNote(fd: FormData) {
  const u = await requirePerm("customers"), id = String(fd.get("id"));
  await db.user.update({ where: { id }, data: { internalNote: String(fd.get("note")).slice(0, 4000) || null } }); await audit(u.id, "user.note", id); done(id);
}
export async function changeServerPackage(fd: FormData) {
  const u = await requirePerm("customers"), sid = String(fd.get("serverId")), uid = String(fd.get("id"));
  await db.server.update({ where: { id: sid }, data: { packageId: String(fd.get("packageId")) } }); await audit(u.id, "server.package", sid); done(uid);
}
