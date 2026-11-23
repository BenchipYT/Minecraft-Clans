import Link from "next/link"; import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Hosting() {
  const pk = await db.package.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return (<><h1 className="text-3xl font-bold">Hosting-Pakete</h1><p className="mt-2 text-muted">Preise und Leistungen kommen aus der Datenbank und sind im Adminbereich pflegbar.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{pk.map(p=>(<div key={p.id} className="card flex flex-col"><h2 className="font-semibold">{p.name}</h2>
      <p className="mt-3 text-3xl font-bold text-accent">{p.priceCents===0?"0 €":(p.priceCents/100).toFixed(2).replace(".",",")+" €"}<span className="text-sm font-normal text-muted">{p.priceCents?" /Monat":""}</span></p>
      <ul className="mt-4 flex-1 space-y-1 text-sm text-muted"><li>{p.ramGb} GB RAM</li><li>{p.maxPlayers} Spieler</li><li>{p.diskGb} GB Speicher</li>{p.features.map(f=><li key={f}>{f}</li>)}</ul>
      <Link href={p.priceCents===0?"/creator-programm":"/portal/billing"} className="btn btn-primary mt-5 text-center">{p.priceCents===0?"Bewerben":"Auswählen"}</Link></div>))}</div></>);
}
