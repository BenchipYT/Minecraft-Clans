import "./globals.css"; import Link from "next/link"; import { getUser } from "@/lib/auth";
export const metadata = { title: "Chip Networks – Minecraft-Hosting mit Full-Service", description: "Wir übernehmen die Technik, du kümmerst dich um deine Community." };
export default async function Root({ children }: { children: React.ReactNode }) {
  const u = await getUser();
  return (<html lang="de"><body className="font-sans antialiased">
    <header className="border-b border-line"><nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
      <Link href="/" className="font-bold">Chip<span className="text-accent"> Networks</span></Link>
      <div className="flex items-center gap-5 text-sm text-muted">
        <Link href="/hosting" className="hover:text-white">Hosting</Link><Link href="/creator-programm" className="hover:text-white">Creator-Programm</Link>
        <Link href={u ? "/portal" : "/login"} className="btn btn-ghost text-white">{u ? "Portal" : "Login"}</Link></div></nav></header>
    <main className="mx-auto max-w-6xl p-4 py-12">{children}</main>
    <footer className="border-t border-line p-6 text-center text-sm text-muted">© Chip Networks · <a href="/features">Features</a> · <a href="/ueber-uns">Über uns</a> · <a href="/kontakt">Kontakt</a> · <a href="/status">Status</a> · <a href="/faq">FAQ</a> · <a href="/impressum">Impressum</a> · <a href="/datenschutz">Datenschutz</a> · <a href="/agb">AGB</a> · <a href="/widerruf">Widerruf</a></footer>
  </body></html>);
}
