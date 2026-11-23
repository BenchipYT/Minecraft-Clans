import { apply } from "./actions";
const F = ({ n, l, t = "text" }: { n: string; l: string; t?: string }) => <label className="block text-sm">{l}<input name={n} type={t} required className="input mt-1" /></label>;
export default async function Creator({ searchParams }: { searchParams: Promise<{ ok?: string; e?: string }> }) {
  const { ok, e } = await searchParams;
  return (<div className="grid gap-10 lg:grid-cols-2"><div><h1 className="text-3xl font-bold">Creator-<span className="text-accent">Programm</span></h1>
    <p className="mt-4 text-muted">Kostenloser Server für Creator und Streamer. Du erhältst einen eingerichteten Server (Free Creator), Plugin-Service und Support. Als Gegenleistung erwarten wir die Nennung von Chip Networks in deinem Umfeld. Bewirb dich, wir prüfen jede Bewerbung persönlich und melden uns per E-Mail.</p></div>
    <form action={apply} className="card space-y-3">{ok && <p className="text-green-400">Bewerbung gesendet. Danke!</p>}{e && <p className="text-red-400">{e}</p>}
      <F n="creatorName" l="Creator-Name"/><F n="channelName" l="Kanalname"/><F n="contactEmail" l="E-Mail" t="email"/><F n="socialLinks" l="Social-Media-Links"/><F n="avgViews" l="Ø Aufrufe"/>
      <label className="block text-sm">Geplantes Projekt<textarea name="project" required rows={3} className="input mt-1"/></label>
      <F n="serverType" l="Gewünschte Serverart"/><F n="expectedPlayers" l="Erwartete Spielerzahl" t="number"/><F n="duration" l="Geplante Laufzeit"/>
      <button className="btn btn-primary w-full">Bewerbung absenden</button></form></div>);
}
