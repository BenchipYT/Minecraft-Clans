# Chip Networks – Plattform (Phase 1 + Kern von Phase 2/3)

## Dynamische Website auf Render

GitHub Pages kann nur die statische Vorschau aus `docs/` hosten. Für Login, Portal und Datenbank:

1. In Render **New → Blueprint** wählen und das GitHub-Repository `BenchipYT/Minecraft-Clans` verbinden.
2. Render erkennt `render.yaml` und legt Web-App und PostgreSQL-Datenbank an.
3. Beim Einrichten `SEED_ADMIN_EMAIL` und `SEED_ADMIN_PASSWORD` setzen. Das Passwort sicher und nur in Render speichern.
4. **Apply** wählen. Nach erfolgreichem Deploy die Render-URL öffnen und mit diesen Zugangsdaten anmelden.

Beim Start synchronisiert Prisma das Schema und legt Hosting-Pakete sowie den Owner-Account an. Die kostenlose Render-Instanz kann nach Inaktivität schlafen gehen; der erste Aufruf kann daher etwas dauern. SMTP, Mollie und Pterodactyl sind nicht vorkonfiguriert. Auf dem kostenlosen Dienst sind Ticket-Anhänge auf lokalem Speicher nicht dauerhaft.

1. `cp .env.example .env` und `DATABASE_URL` anpassen (PostgreSQL)
2. `npm install && npx prisma db push && npm run db:seed`
3. `npm run dev` → http://localhost:3000

**Enthalten:** Designsystem (Schwarz/Gelb), Startseite, Hosting (Pakete aus DB), Creator-Formular → DB, Registrierung/Login (scrypt, DB-Sessions, httpOnly-Cookie, Rate-Limit), Portal (nur eigene Server), Admin: Bewerbungen annehmen/ablehnen mit Notiz + AuditLog, serverseitige Rollenprüfung.

**Weitere Funktionen:** Meldungen (z. B. Ticket-Antworten), Kontoeinstellungen, Paketübersicht, Automation: Bewerbung annehmen → Server (Free Creator) genau einmal anlegen (fehlt der Account, wird er angelegt und per E-Mail-Einladung aktiviert) → Provisionierung per BullMQ-Worker (`npm run worker`, ohne `REDIS_URL` direkt) → Pterodactyl (idempotent über `external_id`) → optional Cloudflare-A-Record.

**Einrichtung Pterodactyl:** `PTERODACTYL_URL`, `PTERODACTYL_API_KEY` (Application-API) und die `PTERO_*`-Werte in `.env` setzen; Egg-Variablen in `PTERO_ENV_JSON` an dein Paper-Egg anpassen. Die Anbindung ist **nicht gegen ein echtes Panel getestet**.

**Noch offen:** Zahlungsanbieter/Rechnungen, Ticket-Anhänge, E-Mail-Versand, SRV-Records/Port-Weiterleitung, Redis-Rate-Limit, Live-Status und Backup-Sync aus dem Panel, echte Plugin-Dateiinstallation, Rechtstexte, Tests.

**Team & Rechte:** Unter `/admin/team` (nur Owner) Mitglieder anlegen und je Person Bereiche freigeben (Bewerbungen, Kunden, Server, Plugins, Backups, Tickets, Pakete, Kontaktnachrichten). Nicht freigegebene Bereiche sind weder sichtbar noch erreichbar (serverseitig geprüft). Nach dem Update: `npx prisma db push`, dann bereits vorhandene Teammitglieder einmal unter `/admin/team` speichern, sonst haben sie keine Rechte.

**Server-Seite im Portal:** Status/Ressourcen (Polling alle 5 s), Start/Stopp/Neustart/Kill und Konsolenbefehle über die Pterodactyl-Client-API (`PTERODACTYL_CLIENT_KEY`, nur serverseitig). Live-Konsolenausgabe (Websocket zu Wings) ist noch nicht enthalten.

**Lokal starten:** `docker compose up -d` startet PostgreSQL und Redis (passend zu `.env.example`). **Live-Konsole:** In der Wings-`config.yml` die Website-URL unter `allowed_origins` eintragen, sonst lehnt Wings die Websocket-Verbindung ab. Das Websocket-Token erlaubt dem Besitzer zusätzlich Power-Aktionen am Wings-Socket, diese werden dann nicht im AuditLog der Website protokolliert.

**E-Mail:** SMTP in `.env` setzen (`SMTP_*`, `MAIL_FROM`, `APP_URL`). Versendet werden Ticket-Antworten, Bewerbungsentscheidungen, Passwort-zurücksetzen-Links und Team-Einladungen; das Team erhält Hinweise über `TEAM_NOTIFY_EMAIL`. Für zuverlässige Zustellung SPF/DKIM für die Absenderdomain einrichten.

**E-Mail-Bestätigung:** Neue Kunden müssen ihre Adresse bestätigen (Link per Mail), bis dahin sind Tickets und Serversteuerung gesperrt; Teammitglieder müssen bestätigt sein (Owner ausgenommen). **Bestehende Datenbank:** einmal `UPDATE "User" SET "emailVerified" = true;` ausführen, wenn vorhandene Konten nicht erneut bestätigen sollen. **Ticket-Anhänge:** max. 3 Dateien à 5 MB (png, jpg, webp, pdf, txt, log), Prüfung von Endung und Inhalt, Ablage in `UPLOAD_DIR`, Download nur über `/api/attachments/…` für den Ticket-Besitzer bzw. Team mit Ticket-Recht. Kein Virenscan enthalten; Dateien werden beim Löschen eines Tickets nicht von der Platte entfernt.

**Zahlungen (Mollie, Vorauszahlung):** Paysafecard ist ein Guthaben-Gutschein und kann nicht automatisch abbuchen. Deshalb gibt es keine Abos: Kunden zahlen 1, 3, 6 oder 12 Monate im Voraus (Einmalzahlung) und verlängern selbst. Einrichtung: Mollie-Konto, Methoden (Paysafecard, PayPal, Karte, Überweisung) aktivieren, `MOLLIE_API_KEY` setzen. Der Webhook `/api/mollie/webhook` wird pro Zahlung mitgegeben und braucht eine öffentlich erreichbare `APP_URL` (lokal Tunnel nutzen; ohne Webhook greift die Prüfung beim Zurückkehren ins Portal). Die Gutschrift ist idempotent und prüft den Betrag. **Gebühren:** `PAYMENT_FEES` (JSON je Methode, Prozent + Fixbetrag, Werte aus deinem Mollie-Vertrag). Die Gebühr wird so aufgeschlagen, dass sie gedeckt ist (Gross-up), vor der Zahlung getrennt ausgewiesen und auf Rechnung/Beleg geführt. Mindestens eine Methode ohne Gebühr muss aktiv sein, sonst sind Bestellungen gesperrt (§ 312a BGB). Für SEPA-Überweisung/-Lastschrift und Verbraucher-Karten sind Gebühren nach § 270a BGB unzulässig; PayPal verbietet Aufschläge in seinen Bedingungen. Gebühr daher nur dort setzen, wo sie zulässig ist (z. B. Paysafecard), und die Bedingungen von Mollie/Paysafecard sowie deine AGB juristisch prüfen lassen. **Belege:** fortlaufend nummerierte Rechnung je Zahlung (`/portal/billing/beleg/…`); Firmen- und Steuerangaben über `COMPANY_*`, `VAT_*`, `INVOICE_TAX_NOTE` setzen und prüfen lassen. **Ablauf:** 7 Tage vor Ende Erinnerung per Mail, nach Ablauf wird der Server im Panel pausiert (nie automatisch gelöscht) und mit Verlängerung sofort entsperrt. Läuft über den Worker (`npm run worker`) oder per Cron (`POST /api/cron/expiry`, `CRON_SECRET`). **Paketwechsel:** bei der Verlängerung wählbar, aber nur in den letzten 7 Tagen vor Ablauf (sonst Umgehung bezahlter Laufzeit); Limits werden im Panel angepasst.

**Weitere Funktionen:** Neuigkeiten (`/admin/news`, Dashboard), Nodes (`/admin/nodes`, nur lesend), Plugin-Installation per Panel-Remote-Download in `/plugins`, Backups erstellen/synchronisieren (Kunde) und echtes Wiederherstellen (Admin, mit Bestätigung), Rate-Limit über Redis. Tests: `npm test` (Gebührenberechnung).

**Rechtstexte:** Impressum (§ 5 DDG, ohne den seit 20.07.2025 abgeschafften OS-Plattform-Hinweis), Datenschutzerklärung (passend zu den tatsächlichen Datenflüssen: Session-Cookie, Mollie, SMTP, Pterodactyl, Cloudflare), AGB und Widerrufsbelehrung mit Muster-Widerrufsformular sind als **Entwürfe** hinterlegt; Firmenangaben kommen aus der `.env`. Sie ersetzen keine Rechtsberatung und sind vor dem Livegang von einem Anwalt oder einer Rechtstext-Kanzlei zu prüfen (offene Stellen in `[eckigen Klammern]`). Im Bestellvorgang sind AGB-Zustimmung und die Zustimmung zum vorzeitigen Leistungsbeginn Pflicht-Checkboxen; der Zeitpunkt wird je Zahlung gespeichert.

**Überarbeitung Oberfläche:** Kundenportal und Adminbereich mit Seitenleiste (aktiver Menüpunkt, Zähler für offene Tickets/Meldungen); Kunden-Dashboard mit Kennzahlen, Live-Serverstatus, Ablaufwarnungen und Adresse-Kopieren; Tickets mit Nummern, Statusfarben, Betrifft-Server, Schließen/Wieder öffnen und Tab Offen/Geschlossen; Admin-Tickets mit Filtern (Status, Priorität, „nur meine“, Suche), Textbausteinen und Kundenlink; Admin-Übersicht mit Kennzahlen, Panel-Status und letzten Aktivitäten; neue Seiten Bewerbungen und Logs (neues Recht „Logs“: Teammitglieder unter /admin/team einmal speichern). `npx prisma db push` nötig (Ticketnummer, Server am Ticket).

**Online ansehen ohne eigenen PC (GitHub Codespaces):** Leeres privates GitHub-Repo anlegen, per „Code → Codespaces → Create“ einen Codespace starten, `chip-networks.zip` in den Datei-Explorer ziehen und im Terminal ausführen: `unzip -o chip-networks.zip && cp -n .env.example .env && docker compose up -d && npm install && npx prisma db push && npm run db:seed && npm run dev`. Port 3000 öffnet sich als Vorschau. Logins (nur Entwicklung): `admin@example.com` / `change-me-123` (Owner) und `demo@example.com` / `demo-passwort-123` (Kunde mit Beispieldaten). Ohne SMTP erscheinen Mails (z. B. Bestätigungslinks) im Terminal. Echte Schlüssel (Mollie, Panel) nie ins Repo; `.env` ist per `.gitignore` ausgeschlossen.
