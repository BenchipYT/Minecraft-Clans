import { login } from "../login/actions";
export default async function P({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (<form action={login} className="card mx-auto max-w-sm space-y-3"><h1 className="text-xl font-bold">login</h1>{e && <p className="text-red-400">{e}</p>}
    <input name="email" type="email" placeholder="E-Mail" required className="input" /><input name="password" type="password" placeholder="Passwort" required className="input" />
    <button className="btn btn-primary w-full">Weiter</button>
    <a href="/passwort-vergessen" className="block text-center text-sm text-muted hover:text-white">Passwort vergessen?</a></form>);
}
