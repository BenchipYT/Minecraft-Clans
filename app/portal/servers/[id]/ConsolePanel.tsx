"use client";
import { useEffect, useRef, useState } from "react";
const strip = (s: string) => s.replace(/\u001b\[[0-9;]*[A-Za-z]/g, "");
/** Live-Konsole: Websocket direkt zu Wings (Origin dieser Website muss in der Wings-Config unter allowed_origins stehen). */
export default function ConsolePanel({ id }: { id: string }) {
  const [lines, setLines] = useState<string[]>([]); const [st, setSt] = useState("verbinde…"); const box = useRef<HTMLPreElement>(null);
  useEffect(() => {
    let ws: WebSocket | null = null, dead = false;
    const creds = async () => (await fetch(`/api/servers/${id}/ws`)).json();
    const connect = async () => {
      try {
        const c = await creds(); if (c.error) { setSt(c.error); if (!dead) setTimeout(connect, 15000); return; }
        ws = new WebSocket(c.socket);
        ws.onopen = () => ws!.send(JSON.stringify({ event: "auth", args: [c.token] }));
        ws.onmessage = async (m) => { const e = JSON.parse(m.data);
          if (e.event === "auth success") { setSt("verbunden"); ws!.send(JSON.stringify({ event: "send logs", args: [null] })); }
          else if (e.event === "console output") setLines(l => [...l.slice(-499), strip(String(e.args[0]))]);
          else if (e.event === "token expiring") { const n = await creds(); if (n.token) ws!.send(JSON.stringify({ event: "auth", args: [n.token] })); } };
        ws.onclose = () => { if (!dead) { setSt("getrennt, neuer Versuch…"); setTimeout(connect, 5000); } };
      } catch { if (!dead) setTimeout(connect, 5000); }
    };
    connect(); return () => { dead = true; ws?.close(); };
  }, [id]);
  useEffect(() => { box.current?.scrollTo(0, box.current.scrollHeight); }, [lines]);
  return (<div className="card"><p className="mb-2 text-xs text-muted">Konsole · {st}</p><pre ref={box} className="h-64 overflow-auto whitespace-pre-wrap rounded bg-bg p-3 font-mono text-xs">{lines.join("\n")}</pre></div>);
}
