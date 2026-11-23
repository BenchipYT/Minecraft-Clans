"use server";
import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import { limited } from "@/lib/ratelimit"; import { notifyTeam } from "@/lib/mail";
export async function apply(fd: FormData) {
  if (await limited("apply", 3, 36e5)) redirect("/creator-programm?e=Zu+viele+Anfragen");
  const g = (k: string) => String(fd.get(k) ?? "").trim().slice(0, 2000), n = Number(fd.get("expectedPlayers"));
  const d = { creatorName: g("creatorName"), channelName: g("channelName"), socialLinks: g("socialLinks"), avgViews: g("avgViews"), project: g("project"), serverType: g("serverType"), duration: g("duration"), contactEmail: g("contactEmail"), expectedPlayers: n };
  if (Object.values(d).some((v) => v === "" || v === 0 || Number.isNaN(v)) || !d.contactEmail.includes("@")) redirect("/creator-programm?e=Bitte+alle+Felder+ausfüllen");
  await db.creatorApplication.create({ data: d }); await notifyTeam("Neue Creator-Bewerbung", `${d.creatorName} (${d.channelName}) hat sich beworben.`); redirect("/creator-programm?ok=1");
}
