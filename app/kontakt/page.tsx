import { Page } from "@/lib/page"; import { contact } from "./actions";
export default async function P({ searchParams }: { searchParams: Promise<{ ok?: string; e?: string }> }) {
  const { ok, e } = await searchParams;
  return <Page title="Kontakt"><form action={contact} className="card space-y-3">{ok && <p className="text-green-400">Nachricht gesendet.</p>}{e && <p className="text-red-400">{e}</p>}
    <input name="name" placeholder="Name" required className="input" /><input name="email" type="email" placeholder="E-Mail" required className="input" /><textarea name="message" rows={5} placeholder="Nachricht" required className="input" /><button className="btn btn-primary">Senden</button></form></Page>;
}
