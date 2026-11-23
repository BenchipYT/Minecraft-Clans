"use server";
import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import { limited } from "@/lib/ratelimit"; import { notifyTeam } from "@/lib/mail";
export async function contact(fd: FormData) {
  if (await limited("contact", 3, 36e5)) redirect("/kontakt?e=Zu+viele+Nachrichten");
  const name = String(fd.get("name")).trim().slice(0, 100), email = String(fd.get("email")).trim().slice(0, 200), message = String(fd.get("message")).trim().slice(0, 5000);
  if (!name || !email.includes("@") || !message) redirect("/kontakt?e=Bitte+alle+Felder+ausfüllen");
  await db.contactMessage.create({ data: { name, email, message } }); await notifyTeam("Neue Kontaktnachricht", `Von ${name} (${email}), siehe /admin/messages`); redirect("/kontakt?ok=1");
}
