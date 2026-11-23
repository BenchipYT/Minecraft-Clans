"use client";
import Link from "next/link"; import { usePathname } from "next/navigation";
export type NavItem = { href: string; label: string; badge?: number };
export default function Nav({ items }: { items: NavItem[] }) {
  const p = usePathname();
  return (<nav className="flex gap-1 overflow-x-auto md:flex-col">{items.map(i => { const on = i.href === "/portal" || i.href === "/admin" ? p === i.href : p.startsWith(i.href);
    return (<Link key={i.href} href={i.href} className={"flex items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition " + (on ? "bg-surface text-accent" : "text-muted hover:text-white")}>{i.label}
      {!!i.badge && <span className="rounded-full bg-accent px-2 text-xs font-semibold text-bg">{i.badge}</span>}</Link>); })}</nav>);
}
