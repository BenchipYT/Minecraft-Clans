"use server";
import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import { requireVerified } from "@/lib/auth"; import { limited } from "@/lib/ratelimit"; import { prepareFiles, storeFiles } from "@/lib/uploads"; import { notifyTeam } from "@/lib/mail"; import { CATEGORIES } from "@/lib/tickets";
export async function createTicket(fd: FormData) {
  const u = await requireVerified();
  if (await limited("ticket", 5, 36e5)) redirect("/portal/tickets?e=Zu+viele+Tickets");
  const subject = String(fd.get("subject")).trim().slice(0, 150), body = String(fd.get("body")).trim().slice(0, 5000), category = String(fd.get("category"));
  if (!subject || !body || !CATEGORIES.includes(category)) redirect("/portal/tickets?e=Bitte+alle+Felder+ausfüllen");
  const pf = await prepareFiles(fd.getAll("files")); if (pf.error) redirect(`/portal/tickets?e=${encodeURIComponent(pf.error)}`);
  const sid = String(fd.get("serverId") ?? ""), srv = sid ? await db.server.findFirst({ where: { id: sid, ownerId: u.id } }) : null;
  const t = await db.ticket.create({ data: { subject, category, ownerId: u.id, serverId: srv?.id } }); const m = await db.ticketMessage.create({ data: { ticketId: t.id, authorId: u.id, body } }); await storeFiles(m.id, pf.items);
  await notifyTeam("Neues Support-Ticket", `${subject.replace(/[\r\n]+/g, " ")} (${category}), siehe /admin/tickets`); redirect(`/portal/tickets/${t.id}`);
}
export async function reply(fd: FormData) {
  const u = await requireVerified(), id = String(fd.get("id")), body = String(fd.get("body")).trim().slice(0, 5000);
  const t = await db.ticket.findFirst({ where: { id, ownerId: u.id, status: { not: "CLOSED" } } }); // nur eigene, offene Tickets
  if (!t || !body) redirect(`/portal/tickets/${id}`);
  const pf = await prepareFiles(fd.getAll("files")); if (pf.error) redirect(`/portal/tickets/${id}?e=${encodeURIComponent(pf.error)}`);
  const m = await db.ticketMessage.create({ data: { ticketId: id, authorId: u.id, body } }); await db.ticket.update({ where: { id }, data: { status: "OPEN" } }); await storeFiles(m.id, pf.items);
  redirect(`/portal/tickets/${id}`);
}
export async function setClosed(fd: FormData) {
  const u = await requireVerified(), id = String(fd.get("id"));
  await db.ticket.updateMany({ where: { id, ownerId: u.id }, data: { status: fd.get("closed") === "1" ? "CLOSED" : "OPEN" } }); redirect(`/portal/tickets/${id}`);
}
