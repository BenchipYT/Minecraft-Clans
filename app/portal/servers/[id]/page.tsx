import Link from "next/link"; import { notFound } from "next/navigation"; import { requireUser } from "@/lib/auth"; import { db } from "@/lib/db"; import StatusPanel from "./StatusPanel"; import ConsolePanel from "./ConsolePanel"; import { power, sendCommand, createBackup, syncBackups } from "./actions";
export const dynamic = "force-dynamic";
export default async function P({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; e?: string }> }) {
  const u = await requireUser(), { id } = await params, { ok, e } = await searchParams;
  const s = await db.server.findFirst({ where: { id, ownerId: u.id }, include: { package: true, plugins: { include: { plugin: true } } } });
  if (!s) notFound();
  return (<div className="mx-auto max-w-3xl space-y-4"><Link href="/portal" className="text-sm text-muted">← Zurück</Link><h1 className="text-2xl font-bold">{s.name}</h1>
    <p className="text-muted">{s.package.name} · Minecraft {s.version} · {s.address ?? "Adresse folgt"} · Setup-Status: {s.status}</p>
    {ok && <p className="text-green-400">Aktion ausgeführt: {ok}</p>}{e && <p className="text-red-400">{e}</p>}
    <StatusPanel id={s.id} />
    <ConsolePanel id={s.id} />
    <form action={power} className="card flex flex-wrap gap-2"><input type="hidden" name="id" value={s.id} />
      <button name="signal" value="start" className="btn btn-primary">Start</button><button name="signal" value="restart" className="btn btn-ghost">Neustart</button><button name="signal" value="stop" className="btn btn-ghost">Stopp</button><button name="signal" value="kill" className="btn btn-ghost">Beenden erzwingen</button></form>
    <form action={sendCommand} className="card flex gap-2"><input type="hidden" name="id" value={s.id} /><input name="command" placeholder="Konsolenbefehl, z. B. say Hallo" className="input" /><button className="btn btn-ghost">Senden</button></form>
    <form className="card flex flex-wrap items-center gap-2"><input type="hidden" name="id" value={s.id} /><span className="flex-1 text-sm">Backups</span><button formAction={createBackup} className="btn btn-ghost">Backup erstellen</button><button formAction={syncBackups} className="btn btn-ghost">Liste aktualisieren</button></form>
    <div className="card"><p className="font-semibold">Plugins</p><p className="text-sm text-muted">{s.plugins.map(p => `${p.plugin.name} ${p.plugin.version}`).join(", ") || "keine"}</p>
      <p className="mt-2 text-sm">Änderungen (Plugins, Version, Welt, Event-Vorbereitung) bitte als <Link href="/portal/tickets" className="text-accent">Ticket</Link> anfragen.</p></div></div>);
}
