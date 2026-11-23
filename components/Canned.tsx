"use client";
const T = [["Eingang bestätigt", "Danke für deine Anfrage, wir kümmern uns darum und melden uns schnellstmöglich."], ["Rückfrage", "Damit wir dir helfen können, brauchen wir noch einige Informationen: "], ["Plugin installiert", "Das gewünschte Plugin wurde installiert und konfiguriert. Starte den Server bitte einmal neu."], ["Gelöst", "Das Problem sollte damit behoben sein. Melde dich gern, falls es weiterhin auftritt."]];
export default function Canned({ target }: { target: string }) {
  return (<select className="input w-auto text-sm" defaultValue="" onChange={e => { const el = document.getElementById(target) as HTMLTextAreaElement | null; if (el && e.target.value) { el.value = e.target.value; el.focus(); } e.target.value = ""; }}>
    <option value="">Textbaustein…</option>{T.map(([l, t]) => <option key={l} value={t}>{l}</option>)}</select>);
}
