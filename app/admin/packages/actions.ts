"use server";
import { revalidatePath } from "next/cache"; import { db } from "@/lib/db"; import { audit, requirePerm } from "@/lib/auth";
export async function updatePackage(fd: FormData) {
  const u = await requirePerm("packages"), id = String(fd.get("id"));
  const num = (k: string) => Math.max(0, Math.round(Number(fd.get(k))));
  const price = Math.round(Number(String(fd.get("price")).replace(",", ".")) * 100), ramGb = num("ramGb"), maxPlayers = num("maxPlayers"), diskGb = num("diskGb"), name = String(fd.get("name")).trim().slice(0, 60);
  if (!name || [price, ramGb, maxPlayers, diskGb].some(Number.isNaN) || price < 0) return;
  const features = String(fd.get("features")).split("\n").map(s => s.trim()).filter(Boolean).slice(0, 20);
  await db.package.update({ where: { id }, data: { name, priceCents: price, ramGb, maxPlayers, diskGb, features, active: fd.get("active") === "on" } });
  await audit(u.id, "package.update", id); revalidatePath("/admin/packages"); revalidatePath("/hosting");
}
