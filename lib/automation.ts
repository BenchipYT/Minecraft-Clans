import { db } from "./db"; import { enqueueProvision } from "./queue"; import { provisionServer } from "./provision"; import { audit } from "./auth-audit"; import { hashPassword } from "./password"; import { randomBytes } from "crypto"; import { sendMail } from "./mail"; import { resetLink } from "./reset";
/** Mit Redis als Job, sonst direkt (Fehler werden protokolliert und der Server bleibt auf ERROR). */
export async function startProvision(id: string) {
  if (await enqueueProvision(id)) return;
  try { await provisionServer(id); } catch { /* Status + AuditLog gesetzt */ }
}
/** Bewerbung angenommen: Server (Free Creator) genau einmal anlegen, sobald es einen Account mit der Bewerber-E-Mail gibt. */
export async function autoServerForApplication(appId: string, actorId: string | null): Promise<"started" | "no-account"> {
  const app = await db.creatorApplication.findUniqueOrThrow({ where: { id: appId } });
  const email = app.contactEmail.toLowerCase().trim(), pkg = await db.package.findUnique({ where: { slug: "free" } });
  if (!pkg) return "no-account";
  let user = await db.user.findUnique({ where: { email } });
  if (!user) { // Account wird erst nutzbar, wenn der Bewerber den Link aus der E-Mail öffnet (beweist den Besitz der Adresse)
    user = await db.user.create({ data: { email, name: app.creatorName.slice(0, 100), passwordHash: hashPassword(randomBytes(24).toString("hex")) } });
    await sendMail(email, "Dein Zugang zu Chip Networks", `Hallo ${app.creatorName},\n\nfür dich wurde ein Account angelegt. Passwort festlegen (48 Stunden gültig):\n${await resetLink(user.id, 48)}`);
    await audit(actorId, "application.account_created", user.id);
  }
  const s = await db.server.upsert({ where: { applicationId: app.id }, update: {}, create: { name: app.channelName.slice(0, 60), ownerId: user.id, packageId: pkg.id, applicationId: app.id } });
  await audit(actorId, "application.server_created", s.id); await startProvision(s.id); return "started";
}
