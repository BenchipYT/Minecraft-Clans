import { requirePerm } from "@/lib/auth"; import { db } from "@/lib/db"; import { review } from "../actions";
export const dynamic = "force-dynamic";
const ST: Record<string, string> = { OPEN: "Offen", ACCEPTED: "Angenommen", REJECTED: "Abgelehnt" };
export default async function P() {
  await requirePerm("applications"); const apps = await db.creatorApplication.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }] });
  return (<><h1 className="text-2xl font-bold">Bewerbungen</h1><p className="text-muted">{apps.filter(a => a.status === "OPEN").length} offen. Bei Annahme werden Account (falls nötig, per E-Mail-Einladung) und Free-Server automatisch angelegt.</p>
    <div className="mt-4 space-y-3">{apps.map(a => (<form key={a.id} action={review} className="card space-y-2"><input type="hidden" name="id" value={a.id} />
      <div className="flex justify-between"><b>{a.creatorName} <span className="font-normal text-muted">({a.channelName})</span></b><span className={a.status === "OPEN" ? "text-accent" : "text-muted"}>{ST[a.status]}</span></div>
      <p className="text-sm text-muted">{a.serverType} · {a.expectedPlayers} Spieler · {a.avgViews} Aufrufe · Laufzeit {a.duration} · {a.contactEmail}</p><p className="text-sm">{a.socialLinks}</p><p className="text-sm text-muted">{a.project}</p>
      <input name="note" defaultValue={a.internalNote ?? ""} placeholder="Interne Notiz" className="input" />
      <div className="flex gap-2"><button name="status" value="ACCEPTED" className="btn btn-primary">Annehmen</button><button name="status" value="REJECTED" className="btn btn-ghost">Ablehnen</button></div></form>))}</div></>);
}
