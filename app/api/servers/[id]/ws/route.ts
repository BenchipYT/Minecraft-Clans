import { NextResponse } from "next/server"; import { getUser } from "@/lib/auth"; import { db } from "@/lib/db"; import { clientCall } from "@/lib/ptero-client";
/** Kurzlebiges Websocket-Token für die Konsole, nur für den Besitzer des Servers. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await getUser(); if (!u) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  const { id } = await params, s = await db.server.findFirst({ where: { id, ownerId: u.id } });
  if (!s) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  try { const d = (await clientCall(s, "/websocket")).data; return NextResponse.json({ token: d.token, socket: d.socket }); }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 502 }); }
}
