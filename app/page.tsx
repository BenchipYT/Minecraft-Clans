import Link from "next/link"; import { db } from "@/lib/db"; import { FAQ } from "@/lib/faq";
export const dynamic = "force-dynamic";
const SERVICES = [["Einrichtung", "Wir setzen deinen Server komplett für dich auf."], ["Plugins", "Installation und Konfiguration durch unser Team."], ["Wartung", "Updates, Backups und Support inklusive."], ["Events", "Server für Projekte und Events auf Anfrage."]];
const STEPS = [["Paket wählen oder bewerben", "Such dir ein Paket aus oder bewirb dich für das Creator-Programm."], ["Wir richten ein", "Unser Team erstellt und konfiguriert deinen Server samt Plugins."], ["Du spielst und wächst", "Änderungen und Fragen laufen über dein Portal, wir kümmern uns um die Technik."]];
const COMPARE = [["Einrichtung", "Selbst machen", "Durch uns"], ["Plugins", "Selbst installieren", "Installation & Konfiguration"], ["Probleme", "Anleitungen suchen", "Persönlicher Support"], ["Events", "Selbst vorbereiten", "Auf Anfrage von uns vorbereitet"]];
const price = (c: number) => (c === 0 ? "0 €" : (c / 100).toFixed(2).replace(".", ",") + " €");
const H = ({ children }: { children: React.ReactNode }) => <h2 className="mb-6 text-2xl font-bold">{children}</h2>;
export default async function Home() {
  const pk = await db.package.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return (<div className="space-y-24">
    <section className="py-16"><p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">Chip Networks</p>
      <h1 className="max-w-3xl text-5xl font-bold leading-tight">Minecraft-Hosting, bei dem <span className="text-accent">wir die Technik übernehmen.</span></h1>
      <p className="mt-6 max-w-2xl text-muted">Für Creator, Streamer und Communities: Du konzentrierst dich auf deine Inhalte, Chip Networks kümmert sich um Server, Plugins und Betreuung.</p>
      <div className="mt-8 flex gap-3"><Link href="/hosting" className="btn btn-primary">Hosting-Angebote</Link><Link href="/creator-programm" className="btn btn-ghost">Creator-Programm</Link></div></section>
    <section><H>Unsere Leistungen</H><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{SERVICES.map(([t, d]) => <div key={t} className="card"><h3 className="font-semibold text-accent">{t}</h3><p className="mt-2 text-sm text-muted">{d}</p></div>)}</div></section>
    <section><H>So funktioniert Chip Networks</H><div className="grid gap-4 md:grid-cols-3">{STEPS.map(([t, d], i) => <div key={t} className="card"><span className="text-3xl font-bold text-accent">{i + 1}</span><h3 className="mt-2 font-semibold">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></div>)}</div></section>
    <section><H>Hosting-Pakete</H><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{pk.map(p => <div key={p.id} className="card"><h3 className="font-semibold">{p.name}</h3><p className="mt-2 text-2xl font-bold text-accent">{price(p.priceCents)}<span className="text-sm font-normal text-muted">{p.priceCents ? " /Monat" : ""}</span></p><p className="mt-2 text-sm text-muted">{p.ramGb} GB RAM · {p.maxPlayers} Spieler</p></div>)}</div>
      <Link href="/hosting" className="mt-4 inline-block text-accent hover:underline">Alle Details ansehen →</Link></section>
    <section><H>Vorteile gegenüber klassischem Hosting</H><div className="card overflow-x-auto p-0"><table className="w-full text-left text-sm"><thead><tr className="border-b border-line text-muted"><th className="p-3"></th><th className="p-3">Klassisches Hosting</th><th className="p-3 text-accent">Chip Networks</th></tr></thead>
      <tbody>{COMPARE.map(([a, b, c]) => <tr key={a} className="border-b border-line last:border-0"><td className="p-3 font-semibold">{a}</td><td className="p-3 text-muted">{b}</td><td className="p-3">{c}</td></tr>)}</tbody></table></div></section>
    <section className="card flex flex-col items-start gap-4 border-accent md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl font-bold">Creator-Programm</h2><p className="mt-2 max-w-xl text-muted">Du bist Creator oder Streamer? Bewirb dich für einen kostenlosen, voll betreuten Server für dein Projekt.</p></div><Link href="/creator-programm" className="btn btn-primary">Jetzt bewerben</Link></section>
    <section><H>Häufige Fragen</H><div className="space-y-2">{FAQ.map(([q, a]) => <details key={q} className="card"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-sm text-muted">{a}</p></details>)}</div></section>
  </div>);
}
