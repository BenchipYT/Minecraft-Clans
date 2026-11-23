import { requirePerm } from "@/lib/auth"; import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function P() {
  await requirePerm("messages");
  const m = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return <><h1 className="text-2xl font-bold">Kontaktnachrichten</h1><div className="mt-4 space-y-2">{m.map(x => <div key={x.id} className="card"><p className="text-sm text-muted">{x.name} · {x.email} · {x.createdAt.toLocaleString("de-DE")}</p><p className="whitespace-pre-wrap">{x.message}</p></div>)}</div></>;
}
