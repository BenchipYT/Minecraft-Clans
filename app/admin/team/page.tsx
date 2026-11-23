import { requireRole, PERMS } from "@/lib/auth"; import { db } from "@/lib/db"; import { createMember, savePermissions } from "./actions";
export const dynamic = "force-dynamic";
const ROLES = ["ADMIN", "TECHNICIAN", "SUPPORT", "CREATOR_MGMT"];
export default async function P() {
  await requireRole(["OWNER"]);
  const team = await db.user.findMany({ where: { role: { not: "CUSTOMER" } }, orderBy: { createdAt: "asc" } });
  return (<><h1 className="text-2xl font-bold">Team</h1><p className="text-muted">Rechte bestimmen, welche Admin-Bereiche ein Mitglied sieht und bearbeiten darf. Die Rolle setzt nur die Vorauswahl.</p>
    <form action={createMember} className="card mt-4 grid gap-2 sm:grid-cols-2"><h2 className="font-semibold sm:col-span-2">Mitglied anlegen (oder bestehenden Kunden befördern)</h2>
      <input name="name" placeholder="Name" className="input" /><input name="email" type="email" placeholder="E-Mail" className="input" /><input name="password" type="password" placeholder="Start-Passwort (optional, leer = Einladung per E-Mail)" className="input" />
      <select name="role" className="input">{ROLES.map(r => <option key={r}>{r}</option>)}</select><button className="btn btn-primary sm:col-span-2">Anlegen</button></form>
    <div className="mt-4 space-y-3">{team.map(u => u.role === "OWNER" ? <div key={u.id} className="card">{u.name} · {u.email} <span className="text-accent">OWNER (alle Rechte)</span></div> :
      <form key={u.id} action={savePermissions} className="card space-y-2"><input type="hidden" name="id" value={u.id} /><p>{u.name} <span className="text-sm text-muted">· {u.email}{u.blocked && " · gesperrt"}</span></p>
        <select name="role" defaultValue={u.role} className="input w-auto">{[...ROLES, "CUSTOMER"].map(r => <option key={r} value={r}>{r === "CUSTOMER" ? "aus Team entfernen" : r}</option>)}</select>
        <div className="flex flex-wrap gap-4 text-sm">{Object.entries(PERMS).map(([k, l]) => <label key={k}><input type="checkbox" name="perm" value={k} defaultChecked={u.permissions.includes(k)} /> {l}</label>)}</div>
        <button className="btn btn-ghost">Speichern</button></form>)}</div></>);
}
