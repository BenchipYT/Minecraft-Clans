import { Queue } from "bullmq"; import IORedis from "ioredis";
let q: Queue | undefined;
/** Legt einen Provisionierungs-Job an. jobId macht ihn pro Server eindeutig. false = kein Redis konfiguriert. */
export async function enqueueProvision(serverId: string) {
  if (!process.env.REDIS_URL) return false;
  q ??= new Queue("provision", { connection: new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null }) });
  await q.add("provision", { serverId }, { jobId: `provision-${serverId}`, attempts: 3, backoff: { type: "exponential", delay: 30000 }, removeOnComplete: true });
  return true;
}
