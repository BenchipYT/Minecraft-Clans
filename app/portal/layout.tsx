import { requireUser } from "@/lib/auth"; import { db } from "@/lib/db"; import Nav from "@/components/Nav"; import { logout } from "../login/actions";
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const u = await requireUser();
  const [unread, open] = await Promise.all([db.notification.count({ where: { userId: u.id, read: false } }), db.ticket.count({ where: { ownerId: u.id, status: { not: "CLOSED" } } })]);
  const items = [{ href: "/portal", label: "Dashboard" }, { href: "/portal/tickets", label: "Support", badge: open }, { href: "/portal/backups", label: "Backups" }, { href: "/portal/billing", label: "Abrechnung" }, { href: "/portal/notifications", label: "Meldungen", badge: unread }, { href: "/portal/settings", label: "Konto" }, ...(u.role !== "CUSTOMER" ? [{ href: "/admin", label: "Adminbereich" }] : [])];
  return (<div className="grid gap-8 md:grid-cols-[210px_1fr]"><aside className="space-y-4"><p className="px-3 text-sm text-muted">{u.name}</p><Nav items={items} />
    <form action={logout}><button className="px-3 text-sm text-muted hover:text-white">Abmelden</button></form></aside><section className="min-w-0">{children}</section></div>);
}
