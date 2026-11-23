import { LegalPage, H, co } from "@/lib/legal"; export const metadata = { title: "Impressum" };
export default function P() { const c = co(); return (<LegalPage title="Impressum">
  <H>Angaben gemäß § 5 DDG</H><p className="whitespace-pre-line">{c.name}{"\n"}{c.address}</p>
  {c.rep && <p>Vertreten durch: {c.rep}</p>}
  <H>Kontakt</H><p>E-Mail: {c.email}{c.phone && <><br />Telefon: {c.phone}</>}<br />Außerdem erreichst du uns über unser <a href="/kontakt" className="text-accent">Kontaktformular</a>.</p>
  {c.register && <><H>Registereintrag</H><p>{c.register}</p></>}
  {c.vat && <><H>Umsatzsteuer-ID</H><p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {c.vat}</p></>}
  <H>Verbraucherstreitbeilegung</H><p>{c.odr}</p></LegalPage>); }
