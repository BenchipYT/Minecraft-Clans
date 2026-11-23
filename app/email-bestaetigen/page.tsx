import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import { findReset } from "@/lib/reset";
// Bestätigung per Button (POST), damit Link-Vorschauen von Mailprogrammen den Token nicht verbrauchen.
async function confirm(fd: FormData) {
  "use server";
  const r = await findReset(String(fd.get("token")), "verify"); if (!r) redirect("/portal");
  await db.user.update({ where: { id: r.userId }, data: { emailVerified: true } }); await db.passwordReset.deleteMany({ where: { userId: r.userId, purpose: "verify" } }); redirect("/portal");
}
export default async function P({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  if (!(await findReset(token, "verify"))) return <p className="card mx-auto max-w-sm">Der Link ist ungültig oder abgelaufen. Im Portal kannst du eine neue Bestätigungs-Mail anfordern.</p>;
  return <form action={confirm} className="card mx-auto max-w-sm space-y-3"><h1 className="text-xl font-bold">E-Mail bestätigen</h1><input type="hidden" name="token" value={token} /><button className="btn btn-primary w-full">Adresse bestätigen</button></form>;
}
