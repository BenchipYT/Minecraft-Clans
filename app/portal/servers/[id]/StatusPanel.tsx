"use client";
import { useEffect, useState } from "react";
type D = { state?: string; memory?: number; cpu?: number; disk?: number; memLimit?: number; error?: string };
const mb = (b?: number) => (b == null ? "–" : Math.round(b / 1048576) + " MB");
export default function StatusPanel({ id }: { id: string }) {
  const [d, setD] = useState<D>({});
  useEffect(() => { let on = true; const load = async () => { try { const j = await (await fetch(`/api/servers/${id}/status`)).json(); if (on) setD(j); } catch { /* nächster Versuch */ } };
    load(); const t = setInterval(load, 5000); return () => { on = false; clearInterval(t); }; }, [id]);
  if (d.error) return <p className="card text-muted">Status nicht verfügbar: {d.error}</p>;
  const on = d.state === "running";
  return (<div className="card grid grid-cols-2 gap-3 sm:grid-cols-4"><div><p className="text-xs text-muted">Status</p><b className={on ? "text-green-400" : "text-accent"}>{d.state ?? "lädt…"}</b></div>
    <div><p className="text-xs text-muted">RAM</p><b>{mb(d.memory)} / {mb(d.memLimit)}</b></div><div><p className="text-xs text-muted">CPU</p><b>{d.cpu != null ? d.cpu.toFixed(1) + " %" : "–"}</b></div><div><p className="text-xs text-muted">Speicher</p><b>{mb(d.disk)}</b></div></div>);
}
