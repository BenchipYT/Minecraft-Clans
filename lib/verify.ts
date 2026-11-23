import { sendMail } from "./mail"; import { resetLink } from "./reset";
export async function sendVerification(u: { id: string; email: string; name: string }) {
  await sendMail(u.email, "E-Mail-Adresse bestätigen", `Hallo ${u.name},\n\nbitte bestätige deine E-Mail-Adresse (24 Stunden gültig):\n${await resetLink(u.id, 24, "verify")}`);
}
