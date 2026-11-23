import { Worker, Queue } from "bullmq"; import IORedis from "ioredis"; import { provisionServer } from "../lib/provision"; import { runExpiry } from "../lib/expiry";
if (!process.env.REDIS_URL) throw new Error("REDIS_URL fehlt");
const conn = () => new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
async function main() {
  new Worker("provision", (job) => provisionServer(job.data.serverId), { connection: conn(), concurrency: 2 }).on("failed", (j, e) => console.error("Provision fehlgeschlagen", j?.data, e.message));
  await new Queue("maintenance", { connection: conn() }).add("expiry", {}, { repeat: { every: 6 * 3600e3 }, jobId: "expiry" }); // Ablauf-Erinnerungen und Sperrung
  new Worker("maintenance", () => runExpiry(), { connection: conn() }).on("failed", (_, e) => console.error("Expiry fehlgeschlagen", e.message));
  console.log("Worker läuft");
}
main();
