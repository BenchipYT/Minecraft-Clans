import { describe, expect, it } from "vitest"; import { withFee } from "../lib/fees";
describe("withFee", () => {
  it("ohne Gebühr unverändert", () => expect(withFee(1000)).toEqual({ fee: 0, total: 1000 }));
  it("Prozent wird aufgeschlagen, sodass die Gebühr gedeckt ist", () => { const r = withFee(1000, { percent: 10, fixedCents: 0 }); expect(r.total).toBe(1112); expect(r.total - Math.round(r.total * 0.1)).toBeGreaterThanOrEqual(1000); });
  it("Fixbetrag", () => expect(withFee(1000, { percent: 0, fixedCents: 25 })).toEqual({ fee: 25, total: 1025 }));
});
