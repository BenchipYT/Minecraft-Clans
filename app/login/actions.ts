"use server";
import { sendVerification } from "@/lib/verify"; import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import { hashPassword, verifyPassword } from "@/lib/password"; import { createSession, destroySession, requireUser } from "@/lib/auth"; import { limited } from "@/lib/ratelimit";
export async function login(fd: FormData) {
  if (await limited("login", 8)) redirect("/login?e=Zu+viele+Versuche");
  const u = await db.user.findUnique({ where: { email: String(fd.get("email")).toLowerCase() } });
  if (!u || u.blocked || !verifyPassword(String(fd.get("password")), u.passwordHash)) redirect("/login?e=Login+fehlgeschlagen");
  await createSession(u.id); redirect("/portal");
}
export async function register(fd: FormData) {
  if (await limited("register", 5)) redirect("/register?e=Zu+viele+Versuche");
  const email = String(fd.get("email")).toLowerCase().trim(), pw = String(fd.get("password")), name = String(fd.get("name")).trim();
  if (!email.includes("@") || pw.length < 10 || !name) redirect("/register?e=Passwort+mind.+10+Zeichen");
  if (await db.user.findUnique({ where: { email } })) redirect("/register?e=E-Mail+bereits+vergeben");
  const u = await db.user.create({ data: { email, name, passwordHash: hashPassword(pw) } }); await sendVerification(u); await createSession(u.id); redirect("/portal");
}
export async function logout() { await destroySession(); redirect("/"); }
export async function resendVerification() { const u = await requireUser(); if (u.emailVerified || (await limited("verify", 3, 36e5))) redirect("/portal"); await sendVerification(u); redirect("/portal?ok=Mail+gesendet"); }
