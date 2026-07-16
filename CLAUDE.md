# CLAUDE.md — www.effinger.ch

Website des Effinger Coworking & Kaffeebar Bern. **Hugo** Static Site (TOML-Frontmatter + Markdown), gehostet auf **Netlify**.

## Build & Vorschau
- `npm run dev` → `hugo server` auf http://localhost:1313/
- `npm run dev:future` → inkl. zukünftiger Events (Events mit `startdate` in der Zukunft; ohne diese Flag im lokalen Server ggf. unsichtbar)
- **Deploy:** Push auf `master` → Netlify baut automatisch. Zusätzlich baut Netlify **jede Nacht (~2–3 Uhr)** neu (via IFTTT-Webhook), damit vergangene Events ausgeblendet werden, der Coworking-Host aus dem Google Calendar erscheint und Öffnungszeiten aktualisiert werden.
- Hugo-Version: siehe `netlify.toml`. Config: `hugo.toml`.

## Verzeichnis-Landkarte
- `content/` — alle Inhalte (Markdown). `static/` — Assets die 1:1 ausgeliefert werden (`/upload/`, `/images/`). `assets/sass/` — Styles (Hugo kompiliert SCSS → `static/css`). `layouts/` — Templates. `data/` — TOML-Datenquellen. `netlify/` — Functions.
- Bilder: Event-/Symbolbilder unter `static/upload/…` (referenziert als `/upload/…`), Personen unter `static/images/effianer/…`.

---

## Häufige Aufgaben (nach Häufigkeit)

### 1. Event hinzufügen (häufigster Fall)
1. Neueste passende Event-Datei als Vorlage kopieren: `content/events/<JAHR>/`.
2. Dateiname = `event_id` + `.md` (z. B. `202635.md`). Manche Events nutzen sprechende Dateinamen (`kunst-im-mai.md`) — beides funktioniert, die **URL kommt aus dem Dateinamen**, nicht aus `event_id`.
3. Frontmatter (TOML zwischen `+++`):
   - `title`, `description` (für Social-Media/SEO wichtig), `image = "/upload/…"`
   - `startdate` / `enddate` im Format `"2026-08-19T18:00:00"`
   - `categories` — bestimmt die Farbe; gültige Werte in `assets/sass/custom/_events.scss` (z. B. `Colearning`, `community`, `kaffeebar`, `coworking`)
   - `location`, `registration` (bool), optional `registration_max`, `registration_close`
4. Inhalt darunter als Markdown; üblich beginnt er mit `![Alt](/upload/…)`.

**`event_id`-Schema: `<JAHR><laufende Nr>`** — 2025er Events = `2025xx`, 2026er Events = `2026xx`.
- 2026 belegt: Community-Treffen `202601`–`202612`, Spezial-Events `202630`–`202634` ff. Vor dem Vergeben freie Nummer prüfen:
  ```
  grep -rh "^event_id" content/events/ | sort
  ```
- **Achtung:** `event_id` wird von keinem Layout verwendet (reine Metadaten, wohl fürs Anmeldesystem). Doppelte IDs brechen die Seite technisch nicht, sind aber zu vermeiden. Die Schatzhebungs-Reihe hat historisch die 2025er-Nummerierung ins Jahr 2026 weitergeführt — für **neue** 2026-Events konsequent `2026xx` vergeben.
- Wiederkehrende Serien: **Schatzhebungstreffen** (Colearning) und monatliche **Community-Treffen** (`community-treffen-N.md`). Text/Bild jeweils vom letzten Termin übernehmen.

### 2. Finanzen aktualisieren
- Monatsbericht: `content/finanzen/verein-coworking-community-bern/<JAHR>/<MM>.md` (Vorlage = Vormonat kopieren). Frontmatter mit `kontostand`, `darlehen`, `[[ertrag]]`/`[[aufwand]]`-Tabellen.
- Jahresabschluss-PDFs: `data/finanzen_jahresabschluss_pdfs.toml`. Farben: `data/finanzen_colors.toml`.

### 3. Mitglieder pflegen
- Aktive: `data/effianer.toml` (`[[Person]]`-Blöcke). Ehemalige: `data/ehemalige.toml`.
- „Zu Ehemalige verschieben" = Block aus `effianer.toml` entfernen, Name (+ ggf. `image`) in `ehemalige.toml` eintragen.
- Personenbilder: `static/images/effianer/…`.

### 4. Banner / saisonale Promos
- Startseite: `layouts/index.html` (z. B. Winterferien-Banner, Sommeraktion). Bevorzugt **datumsbasierte** if-Logik statt manuellem Ein-/Ausschalten.
- Ferien-Öffnungszeiten: `data/oeffnungszeiten_ferien.toml`.

### 5. Öffnungszeiten
- `data/oeffnungszeiten_coworking.toml`, `data/oeffnungszeiten_kaffeebar.toml` (Anzeige wird durch nächtlichen Rebuild aktuell gehalten).

---

## Konventionen
- Sprache: Deutsch (Schweizer Schreibweise, „ss" statt „ß"; Gendern mit `*` oder `:` wie in bestehenden Texten).
- Frontmatter ist **TOML** (`+++`-Delimiter), nicht YAML.
- Markdown erlaubt HTML (`unsafe = true`); sparsam einsetzen. Muster für Lead-Text, Bild-Captions, YouTube-Embeds, Carousel siehe `README.md`.
- Commits/Push nur auf Aufforderung. Aussagekräftige Commit-Messages im Stil der History (z. B. „Event: … (Datum)", „Finanzen: … hinzugefügt").
- Es gibt ein NetlifyCMS unter `/admin/` als Alternative zum direkten Editieren.
