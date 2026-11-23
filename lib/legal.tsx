const v = (k: string, f = "[bitte ergänzen]") => process.env[k]?.trim() || f;
/** Alle Firmenangaben kommen aus der .env (einmal pflegen, überall gültig). */
export const co = () => ({ name: v("COMPANY_NAME"), address: v("COMPANY_ADDRESS"), email: v("COMPANY_EMAIL"), phone: v("COMPANY_PHONE", ""), rep: v("COMPANY_REPRESENTATIVE", ""), register: v("COMPANY_REGISTER", ""), vat: v("VAT_ID", ""),
  hosting: v("HOSTING_PROVIDER"), mail: v("MAIL_PROVIDER"), days: v("DELETE_AFTER_DAYS", "30"), tax: v("INVOICE_TAX_NOTE", "Umsatzsteuerhinweis: [bitte ergänzen]"),
  odr: v("ODR_STATEMENT", "Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.") });
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div className="mx-auto max-w-3xl"><h1 className="text-3xl font-bold">{title}</h1>
    {process.env.LEGAL_REVIEWED !== "true" && <p className="card mt-4 border-accent text-sm">Entwurf: Dieser Text ist eine Vorlage und muss vor der Veröffentlichung anwaltlich geprüft werden. Mit <code>LEGAL_REVIEWED=true</code> verschwindet dieser Hinweis.</p>}
    <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted">{children}</div></div>);
}
export const H = ({ children }: { children: React.ReactNode }) => <h2 className="pt-4 text-lg font-semibold text-white">{children}</h2>;
