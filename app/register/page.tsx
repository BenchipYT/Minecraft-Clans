import { register } from "../login/actions";
export default async function P({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (<form action={register} className="card mx-auto max-w-sm space-y-3"><h1 className="text-xl font-bold">register</h1>{e && <p className="text-red-400">{e}</p>}
    {"register" === "register" && <input name="name" placeholder="Name" required className="input" />}
    <input name="email" type="email" placeholder="E-Mail" required className="input" /><input name="password" type="password" placeholder="Passwort" required className="input" />
    <p className="text-xs text-muted">Mit der Registrierung bestätigst du, die <a href="/datenschutz" className="underline">Datenschutzerklärung</a> gelesen zu haben.</p><button className="btn btn-primary w-full">Weiter</button></form>);
}
