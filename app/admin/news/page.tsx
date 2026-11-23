import { revalidatePath } from "next/cache"; import { requirePerm, audit } from "@/lib/auth"; import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
async function add(fd: FormData) { "use server"; const u = await requirePerm("news"), title = String(fd.get("title")).trim().slice(0, 120), body = String(fd.get("body")).trim().slice(0, 2000); if (!title || !body) return; const n = await db.news.create({ data: { title, body } }); await audit(u.id, "news.create", n.id); revalidatePath("/admin/news"); revalidatePath("/portal"); }
async function del(fd: FormData) { "use server"; const u = await requirePerm("news"), id = String(fd.get("id")); await db.news.delete({ where: { id } }); await audit(u.id, "news.delete", id); revalidatePath("/admin/news"); revalidatePath("/portal"); }
export default async function P() {
  await requirePerm("news"); const ns = await db.news.findMany({ orderBy: { createdAt: "desc" } });
  return (<><h1 className="text-2xl font-bold">Neuigkeiten</h1><p className="text-muted">Die letzten drei erscheinen im Kunden-Dashboard.</p>
    <form action={add} className="card mt-4 space-y-2"><input name="title" placeholder="Titel" className="input" /><textarea name="body" rows={3} placeholder="Text" className="input" /><button className="btn btn-primary">Veröffentlichen</button></form>
    <div className="mt-4 space-y-2">{ns.map(n => <form key={n.id} action={del} className="card flex items-center justify-between"><input type="hidden" name="id" value={n.id} /><span><b>{n.title}</b> <span className="text-sm text-muted">· {n.createdAt.toLocaleDateString("de-DE")}</span></span><button className="btn btn-ghost">Löschen</button></form>)}</div></>);
}
