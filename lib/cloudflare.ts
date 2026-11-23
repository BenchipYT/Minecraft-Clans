export const dnsConfigured = () => !!(process.env.CF_API_TOKEN && process.env.CF_ZONE_ID && process.env.BASE_DOMAIN);
/** Legt A-Record an, falls er noch nicht existiert (idempotent). Port-Weiterleitung (SRV) ist nicht enthalten. */
export async function ensureARecord(label: string, ip: string) {
  const base = `https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/dns_records`, name = `${label}.${process.env.BASE_DOMAIN}`;
  const h = { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, "Content-Type": "application/json" };
  const l = await (await fetch(`${base}?type=A&name=${name}`, { headers: h })).json();
  if (l.result?.length) return name;
  const r = await fetch(base, { method: "POST", headers: h, body: JSON.stringify({ type: "A", name, content: ip, ttl: 300, proxied: false }) });
  if (!r.ok) throw new Error(`Cloudflare ${r.status}`); return name;
}
