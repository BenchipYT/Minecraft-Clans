"use server";
import { revalidatePath } from "next/cache"; import { db } from "@/lib/db"; import { audit, requirePerm } from "@/lib/auth"; import { notify } from "@/lib/notify"; import { sendMail, appUrl } from "@/lib/mail"; import { redirect } from "next/navigation"; import { prepareFiles, storeFiles } from "@/lib/uploads";
const STAFF = ["OWNER", "ADMIN", "TECHNICIAN", "SUPPORT"] as const;
export async function staffReply(fd: FormData) {
  const u = await requirePerm("tickets"), id = String(fd.get("id")), body = String(fd.get("body")).trim().slice(0, 5000), internal = fd.get("internal") === "on";
  if (!body) return;
  const pf = await prepareFiles(fd.getAll("files")); if (pf.error) redirect(`/admin/tickets/${id}?e=${encodeURIComponent(pf.error)}`);
  const m = await db.ticketMessage.create({ data: { ticketId: id, authorId: u.id, body, internal } }); await storeFiles(m.id, pf.items);
  if (!internal) { const t = await db.ticket.update({ where: { id }, data: { status: "ANSWERED" }, include: { owner: true } }); await sendMail(t.owner.email, "Neue Antwort auf dein Ticket", `Zu deinem Ticket "${t.subject}" gibt es eine Antwort:\n${appUrl()}/portal/tickets/${id}`); await notify(t.ownerId, "Neue Antwort auf dein Ticket", `/portal/tickets/${id}`); }
  await audit(u.id, internal ? "ticket.note" : "ticket.reply", id); revalidatePath(`/admin/tickets/${id}`);
}
export async function updateTicket(fd: FormData) {
  const u = await requirePerm("tickets"), id = String(fd.get("id"));
  const status = ["OPEN", "ANSWERED", "CLOSED"].includes(String(fd.get("status"))) ? String(fd.get("status")) : "OPEN";
  const priority = ["LOW", "NORMAL", "HIGH"].includes(String(fd.get("priority"))) ? String(fd.get("priority")) : "NORMAL";
  await db.ticket.update({ where: { id }, data: { status: status as "OPEN", priority: priority as "LOW", ...(fd.get("assignMe") === "on" && { assigneeId: u.id }) } });
  await audit(u.id, `ticket.update:${status}/${priority}`, id); revalidatePath(`/admin/tickets/${id}`);
}
