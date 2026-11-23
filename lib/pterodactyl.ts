/** Schlüssel ausschließlich serverseitig (.env). Ohne Konfiguration wird sauber abgebrochen, nichts wird vorgetäuscht. */
export const pteroConfigured = () => !!process.env.PTERODACTYL_URL && !!process.env.PTERODACTYL_API_KEY;
export async function ptero<T>(path: string, init?: RequestInit): Promise<T> {
  if (!pteroConfigured()) throw new Error("Pterodactyl nicht konfiguriert (PTERODACTYL_URL / PTERODACTYL_API_KEY)");
  const r = await fetch(`${process.env.PTERODACTYL_URL}/api/application${path}`, { ...init, cache: "no-store",
    headers: { Authorization: `Bearer ${process.env.PTERODACTYL_API_KEY}`, Accept: "application/json", "Content-Type": "application/json", ...init?.headers } });
  if (!r.ok) throw new Error(`Pterodactyl ${r.status}`); return (r.status === 204 ? undefined : await r.json()) as T;
}
