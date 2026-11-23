import { NextResponse } from "next/server"; import { getUser } from "@/lib/auth"; import { db } from "@/lib/db"; import { clientCall } from "@/lib/ptero-client";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await getUser(); if (!u) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  const { id } = await params, s = await db.server.findFirst({ where: { id, ownerId: u.id }, include: { package: true } }); // nur eigene Server
  if (!s) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  try { const a = (await clientCall(s, "/resources")).attributes; return NextResponse.json({ state: a.current_state, memory: a.resources.memory_bytes, cpu: a.resources.cpu_absolute, disk: a.resources.disk_bytes, memLimit: s.package.ramGb * 1073741824 }); }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 502 }); }
}
