import { runExpiry } from "@/lib/expiry";
/** Alternative zum Worker: per Cron mit `Authorization: Bearer $CRON_SECRET` aufrufen. */
export async function POST(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return new Response("Unauthorized", { status: 401 });
  await runExpiry(); return new Response("ok");
}
