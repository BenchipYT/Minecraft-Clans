import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import { audit } from "@/lib/auth-audit"; import { hashPassword } from "@/lib/password"; import { findReset } from "@/lib/reset";
async function setPassword(fd: FormData) {
  "use server";
  const token = String(fd.get("token")), pw = String(fd.get("password")), r = await findReset(token);
  if (!r) redirect("/passwort-vergessen");
  if (pw.length < 10) redirect(`/passwort-zuruecksetzen?token=${token}&e=Mindestens+10+Zeichen`);
  await db.user.update({ where: { id: r.userId }, data: { passwordHash: hashPassword(pw), emailVerified: true } });
  await db.passwordReset.deleteMany({ where: { userId: r.userId } }); await db.session.deleteMany({ where: { userId: r.userId } }); // alle bestehenden Sitzungen beenden
  await audit(r.userId, "user.password_reset", r.userId); redirect("/login?e=Passwort+gesetzt,+bitte+anmelden");
}
export default async function P({ searchParams }: { searchParams: Promise<{ token?: string; e?: string }> }) {
  const { token = "", e } = await searchParams;
  if (!(await findReset(token))) return <p className="card mx-auto max-w-sm">Der Link ist ungültig oder abgelaufen. <a href="/passwort-vergessen" className="text-accent">Neuen Link anfordern</a></p>;
  return (<form action={setPassword} className="card mx-auto max-w-sm space-y-3"><h1 className="text-xl font-bold">Neues Passwort</h1>{e && <p className="text-red-400">{e}</p>}
    <input type="hidden" name="token" value={token} /><input name="password" type="password" placeholder="Neues Passwort (mind. 10 Zeichen)" required className="input" /><button className="btn btn-primary w-full">Speichern</button></form>);
}
