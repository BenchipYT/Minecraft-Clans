export const CATEGORIES = ["Technisches Problem", "Plugin-Anfrage", "Server-Konfiguration", "Allgemeine Frage", "Sonstiges"];
export const STATUS: Record<string, [string, string]> = { OPEN: ["Offen", "bg-accent/15 text-accent"], ANSWERED: ["Beantwortet", "bg-green-400/15 text-green-400"], CLOSED: ["Geschlossen", "bg-zinc-500/15 text-zinc-400"] };
export const PRIO: Record<string, [string, string]> = { LOW: ["Niedrig", "bg-zinc-500/15 text-zinc-400"], NORMAL: ["Normal", "bg-sky-400/15 text-sky-400"], HIGH: ["Hoch", "bg-red-400/15 text-red-400"] };
export const Badge = ({ map, k }: { map: Record<string, [string, string]>; k: string }) => <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + map[k][1]}>{map[k][0]}</span>;
type M = { id: string; body: string; internal: boolean; createdAt: Date; author: { name: string; role: string }; attachments: { id: string; fileName: string; size: number }[] };
export function Thread({ messages }: { messages: M[] }) {
  return (<div className="space-y-3">{messages.map(m => { const team = m.author.role !== "CUSTOMER";
    return (<div key={m.id} className={"card " + (m.internal ? "border-dashed border-accent" : team ? "border-l-2 border-l-accent" : "")}>
      <p className="text-xs text-muted"><b className="text-white">{m.author.name}</b>{team && " · Team"}{m.internal && " · interne Notiz"} · {m.createdAt.toLocaleString("de-DE")}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm">{m.body}</p>
      {m.attachments.map(a => <a key={a.id} href={`/api/attachments/${a.id}`} className="mr-3 mt-2 inline-block text-sm text-accent hover:underline">📎 {a.fileName} ({Math.max(1, Math.round(a.size / 1024))} KB)</a>)}</div>); })}</div>);
}
