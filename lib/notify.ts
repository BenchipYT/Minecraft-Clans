import { db } from "./db";
export const notify = (userId: string, text: string, link?: string) => db.notification.create({ data: { userId, text, link } });
