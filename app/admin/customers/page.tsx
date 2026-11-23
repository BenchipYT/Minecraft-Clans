import Link from "next/link"; import { requirePerm } from "@/lib/auth"; import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function AC() {
  await requirePerm("customers");
  const us = await db.user.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { servers: true } } } });
  return (<><h1 className="text-2xl font-bold">Kunden &amp; Team</h1><div className="mt-4 space-y-2">{us.map(x => <Link key={x.id} href={`/admin/customers/${x.id}`} className="card flex justify-between hover:border-accent">
    <span>{x.name} <span className="text-sm text-muted">· {x.email} · {x._count.servers} Server</span></span><span className="text-sm text-accent">{x.blocked ? "GESPERRT" : x.role}</span></Link>)}</div></>);
}
