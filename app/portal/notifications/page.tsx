import Link from "next/link"; import { revalidatePath } from "next/cache"; import { requireUser } from "@/lib/auth"; import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
async function readAll() { "use server"; const u = await requireUser(); await db.notification.updateMany({ where: { userId: u.id }, data: { read: true } }); revalidatePath("/portal/notifications"); }
export default async function P() {
  const u = await requireUser(), ns = await db.notification.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return (<><div className="flex justify-between"><h1 className="text-2xl font-bold">Meldungen</h1><form action={readAll}><button className="btn btn-ghost">Alle gelesen</button></form></div>
    <div className="mt-4 space-y-2">{ns.length === 0 && <p className="text-muted">Keine Meldungen.</p>}{ns.map(n => <div key={n.id} className={"card " + (n.read ? "" : "border-accent")}>{n.link ? <Link href={n.link}>{n.text}</Link> : n.text}<p className="text-xs text-muted">{n.createdAt.toLocaleString("de-DE")}</p></div>)}</div></>);
}
