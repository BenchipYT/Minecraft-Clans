"use server";
import { revalidatePath } from "next/cache"; import { db } from "@/lib/db"; import { audit, requireRole, PERMS, ROLE_DEFAULTS } from "@/lib/auth"; import { hashPassword } from "@/lib/password"; import { randomBytes } from "crypto"; import { sendMail, appUrl } from "@/lib/mail"; import { resetLink } from "@/lib/reset";
const clean = (v: FormDataEntryValue[]) => v.map(String).filter((k) => k in PERMS);
/** Nur der Owner verwaltet das Team (verhindert Rechte-Eskalation). */
export async function createMember(fd: FormData) {
  const o = await requireRole(["OWNER"]), email = String(fd.get("email")).toLowerCase().trim(), name = String(fd.get("name")).trim().slice(0, 100), pw = String(fd.get("password")), role = String(fd.get("role"));
  if (!email.includes("@") || !name || !(role in ROLE_DEFAULTS)) return;
  const ex = await db.user.findUnique({ where: { email } });
  if (ex) { if (ex.role === "OWNER") return; await db.user.update({ where: { id: ex.id }, data: { role: role as "ADMIN", permissions: ROLE_DEFAULTS[role] } }); await audit(o.id, `team.promote:${role}`, ex.id); }
  else { if (pw && pw.length < 10) return; const u = await db.user.create({ data: { email, name, passwordHash: hashPassword(pw || randomBytes(24).toString("hex")), emailVerified: true, role: role as "ADMIN", permissions: ROLE_DEFAULTS[role] } }); await audit(o.id, `team.create:${role}`, u.id);
    if (!pw) await sendMail(u.email, "Einladung zu Chip Networks", `Hallo ${name},\n\nfür dich wurde ein Teamzugang angelegt. Passwort festlegen (48 Stunden gültig):\n${await resetLink(u.id, 48)}\n\nAnmeldung: ${appUrl()}/login`); }
  revalidatePath("/admin/team");
}
export async function savePermissions(fd: FormData) {
  const o = await requireRole(["OWNER"]), id = String(fd.get("id")), role = String(fd.get("role")), t = await db.user.findUnique({ where: { id } });
  if (!t || t.id === o.id || t.role === "OWNER" || !(role in ROLE_DEFAULTS || role === "CUSTOMER")) return;
  const permissions = role === "CUSTOMER" ? [] : clean(fd.getAll("perm"));
  await db.user.update({ where: { id }, data: { role: role as "ADMIN", permissions } }); await audit(o.id, `team.permissions:${role}:${permissions.join(",")}`, id); revalidatePath("/admin/team");
}
