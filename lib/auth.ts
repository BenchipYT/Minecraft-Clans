import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, createHash } from "crypto";
import type { Role } from "@prisma/client";
import { db } from "./db";
const sha = (t: string) => createHash("sha256").update(t).digest("hex");
export async function createSession(userId: string) {
  const t = randomBytes(32).toString("hex");
  await db.session.create({ data: { tokenHash: sha(t), userId, expiresAt: new Date(Date.now() + 30 * 864e5) } });
  (await cookies()).set("session", t, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 30 * 86400 });
}
export async function destroySession() {
  const c = await cookies(); const t = c.get("session")?.value;
  if (t) await db.session.deleteMany({ where: { tokenHash: sha(t) } });
  c.delete("session");
}
export async function getUser() {
  const t = (await cookies()).get("session")?.value; if (!t) return null;
  const s = await db.session.findUnique({ where: { tokenHash: sha(t) }, include: { user: true } });
  return !s || s.expiresAt < new Date() || s.user.blocked ? null : s.user;
}
export async function requireUser() { const u = await getUser(); if (!u) redirect("/login"); return u; }
/** Serverseitige Rechteprüfung für Staff-Bereiche. */
export async function requireRole(roles: Role[]) { const u = await requireUser(); if (!roles.includes(u.role)) redirect("/portal"); return u; }
export const audit = (actorId: string | null, action: string, target?: string) => db.auditLog.create({ data: { actorId, action, target } });

/** Berechtigungen: jede deckt Ansehen und Bearbeiten eines Admin-Bereichs ab. Owner hat immer alle. */
export const PERMS = { applications: "Bewerbungen", customers: "Kunden", servers: "Server", plugins: "Plugins", backups: "Backups", tickets: "Tickets", packages: "Pakete & Preise", messages: "Kontaktnachrichten", news: "Neuigkeiten", logs: "Logs & Aktivitäten" } as const;
export type Perm = keyof typeof PERMS;
export const ROLE_DEFAULTS: Record<string, Perm[]> = { ADMIN: Object.keys(PERMS) as Perm[], TECHNICIAN: ["servers", "plugins", "backups", "tickets"], SUPPORT: ["tickets", "customers", "messages"], CREATOR_MGMT: ["applications", "customers"] };
export const can = (u: { role: string; permissions: string[]; emailVerified?: boolean }, p: Perm) => u.role === "OWNER" || (u.role !== "CUSTOMER" && u.emailVerified !== false && u.permissions.includes(p));
export async function requirePerm(p: Perm) { const u = await requireUser(); if (!can(u, p)) redirect("/portal"); return u; }
export async function requireStaff() { const u = await requireUser(); if (u.role === "CUSTOMER" || (u.role !== "OWNER" && (!u.emailVerified || u.permissions.length === 0))) redirect("/portal"); return u; }
/** Aktionen mit Wirkung (Tickets, Serversteuerung) erst nach bestätigter E-Mail. */
export async function requireVerified() { const u = await requireUser(); if (!u.emailVerified) redirect("/portal?e=Bitte+zuerst+E-Mail+bestätigen"); return u; }
