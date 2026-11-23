"use server";
import { revalidatePath } from "next/cache"; import { db } from "@/lib/db"; import { audit, requirePerm } from "@/lib/auth"; import { autoServerForApplication } from "@/lib/automation"; import { sendMail, appUrl } from "@/lib/mail";
export async function review(fd: FormData) {
  const u = await requirePerm("applications");
  const id = String(fd.get("id")), status = fd.get("status") === "ACCEPTED" ? "ACCEPTED" : "REJECTED";
  let note = String(fd.get("note") ?? "").slice(0, 2000);
  if (status === "ACCEPTED" && (await autoServerForApplication(id, u.id)) === "no-account") note += "\n[Auto] Paket 'free' fehlt: Server wurde nicht angelegt.";
  const app = await db.creatorApplication.update({ where: { id }, data: { status, reviewedById: u.id, internalNote: note || null } });
  await sendMail(app.contactEmail, status === "ACCEPTED" ? "Deine Bewerbung bei Chip Networks wurde angenommen" : "Deine Bewerbung bei Chip Networks", status === "ACCEPTED" ? `Hallo ${app.creatorName},\n\ndeine Bewerbung wurde angenommen! Wir richten deinen Server ein. Falls du noch keinen Account hast, bekommst du separat eine E-Mail mit Link zum Passwort festlegen. Anmeldung:\n${appUrl()}/login` : `Hallo ${app.creatorName},\n\nleider können wir deine Bewerbung aktuell nicht berücksichtigen. Danke für dein Interesse!`);
  await audit(u.id, `application.${status}`, id); revalidatePath("/admin"); revalidatePath("/admin/applications");
}
