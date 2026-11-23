import nodemailer from "nodemailer";
let t: nodemailer.Transporter | undefined;
export const appUrl = () => (process.env.APP_URL ?? process.env.RENDER_EXTERNAL_URL ?? "http://localhost:3000").replace(/\/$/, "");
/** Versand über SMTP. Fehlt die Konfiguration oder schlägt der Versand fehl, wird nur geloggt – der aufrufende Ablauf bricht nie ab. */
export async function sendMail(to: string, subject: string, text: string) {
  const e = process.env;
  if (!e.SMTP_HOST) { console.warn(`[mail] SMTP nicht konfiguriert, nicht gesendet: "${subject}" an ${to}`); if (process.env.NODE_ENV !== "production") console.log(`[mail:dev] ${text}`); return false; }
  try {
    t ??= nodemailer.createTransport({ host: e.SMTP_HOST, port: Number(e.SMTP_PORT || 587), secure: e.SMTP_SECURE === "true", auth: e.SMTP_USER ? { user: e.SMTP_USER, pass: e.SMTP_PASS } : undefined });
    await t.sendMail({ from: e.MAIL_FROM ?? "Chip Networks <noreply@localhost>", to, subject: subject.replace(/[\r\n]+/g, " ").slice(0, 200), text }); return true;
  } catch (err) { console.error("[mail]", (err as Error).message); return false; }
}
/** Interne Benachrichtigung an das Team (TEAM_NOTIFY_EMAIL), z. B. bei neuen Bewerbungen. */
export const notifyTeam = (subject: string, text: string) => (process.env.TEAM_NOTIFY_EMAIL ? sendMail(process.env.TEAM_NOTIFY_EMAIL, subject, text) : Promise.resolve(false));
