import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";
const db = new PrismaClient();
async function main() {
  const pk = [["free","Free Creator",0,4,10,10],["basic","Creator Basic",699,6,20,20],["advanced","Creator Advanced",1499,10,35,40],["pro","Creator Professional",2999,16,50,80]] as const;
  for (const [i,[slug,name,priceCents,ramGb,maxPlayers,diskGb]] of pk.entries())
    await db.package.upsert({ where:{slug}, update:{}, create:{slug,name,priceCents,ramGb,maxPlayers,diskGb,sortOrder:i,
      features:["Backups","Plugin-Service","Subdomain","Support"]} });
  if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD)
    await db.user.upsert({ where:{email:process.env.SEED_ADMIN_EMAIL}, update:{role:"OWNER",emailVerified:true}, create:{email:process.env.SEED_ADMIN_EMAIL,name:"Owner",role:"OWNER",emailVerified:true,passwordHash:hashPassword(process.env.SEED_ADMIN_PASSWORD)} });
}
/** Nur Entwicklung: Beispieldaten, damit alle Seiten Inhalt zeigen. Mit SEED_DEMO=false abschaltbar. Login: demo@example.com */
async function demo() {
  if (process.env.NODE_ENV === "production" || process.env.SEED_DEMO === "false") return;
  if (await db.user.findUnique({ where: { email: "demo@example.com" } })) return;
  const owner = await db.user.findFirst({ where: { role: "OWNER" } }), pkg = await db.package.findUniqueOrThrow({ where: { slug: "basic" } });
  const u = await db.user.create({ data: { email: "demo@example.com", name: "Demo Creator", emailVerified: true, passwordHash: hashPassword(process.env.SEED_DEMO_PASSWORD ?? "demo-passwort-123") } });
  const s = await db.server.create({ data: { name: "Demo-SMP", ownerId: u.id, packageId: pkg.id, status: "READY", address: "demo.chipnetworks.local", paidUntil: new Date(Date.now() + 5 * 864e5) } });
  await db.backup.create({ data: { serverId: s.id, label: "Nachtbackup", sizeMb: 420 } });
  const t = await db.ticket.create({ data: { subject: "Plugin EssentialsX installieren", category: "Plugin-Anfrage", ownerId: u.id, serverId: s.id } });
  await db.ticketMessage.create({ data: { ticketId: t.id, authorId: u.id, body: "Hallo, könnt ihr bitte EssentialsX auf meinem Server installieren?" } });
  if (owner) { await db.ticketMessage.create({ data: { ticketId: t.id, authorId: owner.id, body: "Hi! Machen wir, wir melden uns gleich." } }); await db.ticket.update({ where: { id: t.id }, data: { status: "ANSWERED", assigneeId: owner.id } }); }
  await db.ticket.create({ data: { subject: "Server laggt abends", category: "Technisches Problem", ownerId: u.id, priority: "HIGH", messages: { create: { authorId: u.id, body: "Ab 20 Uhr gibt es starke Lags." } } } });
  await db.news.create({ data: { title: "Willkommen bei Chip Networks", body: "Das ist ein Beispiel für eine Neuigkeit im Dashboard." } });
  await db.plugin.upsert({ where: { name: "EssentialsX" }, update: {}, create: { name: "EssentialsX", description: "Basis-Befehle und Economy", version: "2.20", mcVersions: "1.21.x", source: "https://example.com/EssentialsX.jar", license: "GPL-3.0" } });
  await db.creatorApplication.create({ data: { creatorName: "Test Creator", channelName: "TestTV", socialLinks: "https://youtube.com/@test", avgViews: "2.000", project: "Survival-Server für meine Community", serverType: "Survival", expectedPlayers: 15, duration: "6 Monate", contactEmail: "testcreator@example.com" } });
  await db.contactMessage.create({ data: { name: "Max", email: "max@example.com", message: "Habt ihr auch Server für Events?" } });
}
main().then(demo).finally(() => db.$disconnect());
