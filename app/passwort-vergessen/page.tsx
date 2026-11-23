import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import { limited } from "@/lib/ratelimit"; import { sendMail } from "@/lib/mail"; import { resetLink } from "@/lib/reset";
async function request(fd: FormData) {
  "use server";
  if (await limited("forgot", 5, 36e5)) redirect("/passwort-vergessen?ok=1");
  const u = await db.user.findUnique({ where: { email: String(fd.get("email")).toLowerCase().trim() } });
  if (u && !u.blocked) await sendMail(u.email, "Passwort zurücksetzen", `Hallo ${u.name},\n\nüber diesen Link kannst du ein neues Passwort setzen (1 Stunde gültig):\n${await resetLink(u.id)}\n\nWenn du das nicht angefordert hast, ignoriere diese E-Mail.`);
  redirect("/passwort-vergessen?ok=1"); // immer gleiche Antwort, damit keine Accounts erraten werden können
}
export default async function P({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  return (<form action={request} className="card mx-auto max-w-sm space-y-3"><h1 className="text-xl font-bold">Passwort vergessen</h1>
    {ok && <p className="text-green-400">Falls ein Account existiert, haben wir eine E-Mail gesendet.</p>}
    <input name="email" type="email" placeholder="E-Mail" required className="input" /><button className="btn btn-primary w-full">Link anfordern</button></form>);
}
