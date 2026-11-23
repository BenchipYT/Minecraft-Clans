"use server";
import { revalidatePath } from "next/cache"; import { db } from "@/lib/db"; import { audit, requirePerm } from "@/lib/auth"; import { startProvision } from "@/lib/automation";
export async function createServer(fd: FormData) {
  const u = await requirePerm("servers");
  const owner = await db.user.findUnique({ where: { email: String(fd.get("email")).toLowerCase().trim() } }), name = String(fd.get("name")).trim().slice(0, 60);
  if (!owner || !name) return;
  const s = await db.server.create({ data: { name, ownerId: owner.id, packageId: String(fd.get("packageId")) } }); // Status PENDING; Panel-Anlage folgt in Phase 4
  await audit(u.id, "server.create", s.id); revalidatePath("/admin/servers");
}
export async function deleteServer(fd: FormData) {
  const u = await requirePerm("servers"), id = String(fd.get("id"));
  await db.server.delete({ where: { id } }); await audit(u.id, "server.delete", id); revalidatePath("/admin/servers");
}
export async function provision(fd: FormData) {
  const u = await requirePerm("servers"), id = String(fd.get("id"));
  await audit(u.id, "server.provision", id); await startProvision(id); revalidatePath("/admin/servers");
}
