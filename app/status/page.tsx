import { Page } from "@/lib/page"; import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function P() {
  const g = await db.server.groupBy({ by: ["status"], _count: true });
  return <Page title="Status"><p>Server nach Status (aus unserer Datenbank; Live-Daten folgen mit der Pterodactyl-Anbindung):</p>
    {g.length === 0 && <p>Keine Server vorhanden.</p>}{g.map(x => <div key={x.status} className="card flex justify-between"><span>{x.status}</span><b className="text-accent">{x._count}</b></div>)}</Page>;
}
