import { mkdir, writeFile, readFile } from "fs/promises"; import { randomBytes } from "crypto"; import path from "path"; import { db } from "./db";
const DIR = () => path.resolve(process.env.UPLOAD_DIR ?? "./uploads"); // außerhalb von public/, Auslieferung nur über geprüfte Route
const noNul = (b: Buffer) => !b.includes(0);
const TYPES: Record<string, { mime: string; ok: (b: Buffer) => boolean }> = {
  png: { mime: "image/png", ok: b => b.subarray(0, 4).toString("hex") === "89504e47" }, jpg: { mime: "image/jpeg", ok: b => b[0] === 0xff && b[1] === 0xd8 }, jpeg: { mime: "image/jpeg", ok: b => b[0] === 0xff && b[1] === 0xd8 },
  webp: { mime: "image/webp", ok: b => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" }, pdf: { mime: "application/pdf", ok: b => b.subarray(0, 4).toString() === "%PDF" },
  txt: { mime: "text/plain; charset=utf-8", ok: noNul }, log: { mime: "text/plain; charset=utf-8", ok: noNul } };
type Item = { name: string; buf: Buffer; ext: string; mime: string };
/** Prüft Anzahl, Größe, Endung (Whitelist) und Inhalt (Magic Bytes). Der Dateityp kommt nie vom Client. */
export async function prepareFiles(entries: FormDataEntryValue[]): Promise<{ error?: string; items: Item[] }> {
  const files = entries.filter((f): f is File => typeof f !== "string" && f.size > 0), items: Item[] = [];
  if (files.length > 3) return { error: "Maximal 3 Dateien", items };
  for (const f of files) {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "", t = TYPES[ext];
    if (f.size > 5 * 1024 * 1024) return { error: `${f.name}: größer als 5 MB`, items };
    if (!t) return { error: `${f.name}: Dateityp nicht erlaubt (png, jpg, webp, pdf, txt, log)`, items };
    const buf = Buffer.from(await f.arrayBuffer()); if (!t.ok(buf)) return { error: `${f.name}: Inhalt passt nicht zum Dateityp`, items };
    items.push({ name: f.name, buf, ext, mime: t.mime });
  }
  return { items };
}
export async function storeFiles(messageId: string, items: Item[]) {
  if (!items.length) return; await mkdir(DIR(), { recursive: true });
  for (const i of items) { const key = randomBytes(16).toString("hex") + "." + i.ext; await writeFile(path.join(DIR(), key), i.buf);
    await db.attachment.create({ data: { messageId, fileName: i.name.replace(/[^\w.\- ]/g, "_").slice(-100), mime: i.mime, size: i.buf.length, storageKey: key } }); }
}
export const readStored = (key: string) => readFile(path.join(DIR(), path.basename(key)));
