"use client";
import { useEffect, useState } from "react";
const MAP: Record<string, [string, string]> = { running: ["Online", "bg-green-400"], starting: ["Startet", "bg-accent"], stopping: ["Stoppt", "bg-accent"], offline: ["Offline", "bg-zinc-500"] };
export default function StatusBadge({ id }: { id: string }) {
  const [s, setS] = useState<string | null>(null);
  useEffect(() => { let on = true; const l = async () => { try { const j = await (await fetch(`/api/servers/${id}/status`)).json(); if (on) setS(j.state ?? "–"); } catch { /* nächster Versuch */ } }; l(); const t = setInterval(l, 15000); return () => { on = false; clearInterval(t); }; }, [id]);
  const [label, dot] = s && MAP[s] ? MAP[s] : [s ?? "…", "bg-zinc-600"];
  return <span className="inline-flex items-center gap-2 text-sm"><span className={`h-2 w-2 rounded-full ${dot}`} />{label}</span>;
}
