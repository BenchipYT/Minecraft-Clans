import { Page } from "@/lib/page"; import { FAQ } from "@/lib/faq";
export default function P() { return <Page title="FAQ">{FAQ.map(([q, a]) => <details key={q} className="card"><summary className="cursor-pointer font-semibold text-white">{q}</summary><p className="mt-2">{a}</p></details>)}</Page>; }
