import { redirect } from "next/navigation"; import { requireUser, audit } from "@/lib/auth"; import { db } from "@/lib/db"; import { hashPassword, verifyPassword } from "@/lib/password";
async function profile(fd: FormData) { "use server"; const u = await requireUser(), name = String(fd.get("name")).trim().slice(0, 100); if (name) await db.user.update({ where: { id: u.id }, data: { name } }); redirect("/portal/settings?ok=Gespeichert"); }
async function password(fd: FormData) { "use server"; const u = await requireUser(), n = String(fd.get("new"));
  if (!verifyPassword(String(fd.get("old")), u.passwordHash) || n.length < 10) redirect("/portal/settings?e=Altes+Passwort+falsch+oder+neues+zu+kurz");
  await db.user.update({ where: { id: u.id }, data: { passwordHash: hashPassword(n) } }); await audit(u.id, "user.password_change", u.id); redirect("/portal/settings?ok=Passwort+geändert"); }
export default async function P({ searchParams }: { searchParams: Promise<{ ok?: string; e?: string }> }) {
  const u = await requireUser(), { ok, e } = await searchParams;
  return (<div className="mx-auto max-w-md space-y-4"><h1 className="text-2xl font-bold">Konto</h1>{ok && <p className="text-green-400">{ok}</p>}{e && <p className="text-red-400">{e}</p>}
    <form action={profile} className="card space-y-2"><p className="text-sm text-muted">{u.email}</p><input name="name" defaultValue={u.name} className="input" /><button className="btn btn-primary">Speichern</button></form>
    <form action={password} className="card space-y-2"><input name="old" type="password" placeholder="Aktuelles Passwort" required className="input" /><input name="new" type="password" placeholder="Neues Passwort (mind. 10 Zeichen)" required className="input" /><button className="btn btn-ghost">Passwort ändern</button></form></div>);
}
