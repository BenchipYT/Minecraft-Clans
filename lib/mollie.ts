/* eslint-disable @typescript-eslint/no-explicit-any */
const API = "https://api.mollie.com/v2";
export const mollieConfigured = () => !!process.env.MOLLIE_API_KEY;
async function call(path: string, init?: RequestInit): Promise<any> {
  if (!process.env.MOLLIE_API_KEY) throw new Error("MOLLIE_API_KEY fehlt");
  const r = await fetch(API + path, { ...init, cache: "no-store", headers: { Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`, "Content-Type": "application/json" } });
  if (!r.ok) throw new Error(`Mollie ${r.status}`); return r.json();
}
export const createPayment = (p: { cents: number; description: string; method: string; redirectUrl: string; webhookUrl?: string; metadata: Record<string, string> }) =>
  call("/payments", { method: "POST", body: JSON.stringify({ amount: { currency: "EUR", value: (p.cents / 100).toFixed(2) }, description: p.description, redirectUrl: p.redirectUrl, webhookUrl: p.webhookUrl, method: p.method, locale: "de_DE", metadata: p.metadata }) });
export const getPayment = (id: string) => call(`/payments/${encodeURIComponent(id)}`);
