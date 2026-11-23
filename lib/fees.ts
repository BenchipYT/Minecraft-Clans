export type Fee = { percent: number; fixedCents: number };
/** Gebühren je Zahlungsart (Env PAYMENT_FEES als JSON), z. B. {"paysafecard":{"percent":3,"fixedCents":0}}. Ohne Eintrag: keine Gebühr. */
export const feeRules = (): Record<string, Fee> => { try { return JSON.parse(process.env.PAYMENT_FEES ?? "{}"); } catch { return {}; } };
/** Gross-up: Aufschlag so, dass nach Abzug der Zahlungsgebühr der Basisbetrag übrig bleibt. */
export function withFee(baseCents: number, f?: Fee) {
  if (!f || (!f.percent && !f.fixedCents)) return { fee: 0, total: baseCents };
  const total = Math.ceil((baseCents + f.fixedCents) / (1 - f.percent / 100)); return { fee: total - baseCents, total };
}
