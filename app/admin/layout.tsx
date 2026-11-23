import { requireStaff, can, type Perm } from "@/lib/auth"; import Nav from "@/components/Nav";
const L: [Perm | "team" | null, string, string][] = [[null, "/admin", "Übersicht"], ["applications", "/admin/applications", "Bewerbungen"], ["tickets", "/admin/tickets", "Tickets"], ["servers", "/admin/servers", "Server"], ["servers", "/admin/nodes", "Nodes"], ["customers", "/admin/customers", "Kunden"], ["packages", "/admin/packages", "Pakete"], ["plugins", "/admin/plugins", "Plugins"], ["backups", "/admin/backups", "Backups"], ["messages", "/admin/messages", "Nachrichten"], ["news", "/admin/news", "Neuigkeiten"], ["logs", "/admin/logs", "Logs"], ["team", "/admin/team", "Team"]];
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireStaff();
  const items = L.filter(([p]) => p === null || (p === "team" ? me.role === "OWNER" : can(me, p))).map(([, href, label]) => ({ href, label }));
  return (<div className="grid gap-8 md:grid-cols-[200px_1fr]"><aside><p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-accent">Admin</p><Nav items={items} /></aside><section className="min-w-0">{children}</section></div>);
}
