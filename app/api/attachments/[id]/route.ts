import { getUser, can } from "@/lib/auth"; import { db } from "@/lib/db"; import { readStored } from "@/lib/uploads";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await getUser(); if (!u) return new Response("Nicht angemeldet", { status: 401 });
  const a = await db.attachment.findUnique({ where: { id: (await params).id }, include: { message: { include: { ticket: true } } } });
  // Besitzer nur bei nicht-internen Nachrichten des eigenen Tickets, sonst Team mit Ticket-Recht
  if (!a || !((a.message.ticket.ownerId === u.id && !a.message.internal) || can(u, "tickets"))) return new Response("Nicht gefunden", { status: 404 });
  try { return new Response(new Uint8Array(await readStored(a.storageKey)), { headers: { "Content-Type": a.mime, "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(a.fileName)}`, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" } }); }
  catch { return new Response("Datei fehlt", { status: 404 }); }
}
