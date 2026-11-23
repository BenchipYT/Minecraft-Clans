import { db } from "./db";
export const audit = (actorId: string | null, action: string, target?: string) => db.auditLog.create({ data: { actorId, action, target } });
