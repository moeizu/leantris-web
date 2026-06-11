# Content- & SEO-Analyse leantris.ch

Stand: 11. Juni 2026 · Basis: Vue-3-Umsetzung in diesem Repo, verglichen mit der Prod-Site (www.leantris.ch) und der Staging-Site (www.leantris.ch/staging).

## 1. Sprache & Konsistenz

### Befund: konsistent — keine Korrekturen nötig
- **Schweizer Hochdeutsch** wie auf der Prod-Site: durchgängig „ss" statt „ß" (automatisiert geprüft: 0 ß-Vorkommen im gesamten Quellcode), Schweizer Zahlenformat, „Sie"-Ansprache.
- **Tonfall** deckt sich mit Prod: formell, sachlich, ohne Marketing-Floskeln. Die neuen Texte sind sogar präziser und weniger werblich als die alten („wir melden uns mit einem sachlichen nächsten Schritt" — sehr gut, das ist differenzierend ehrlich).
- Kleinigkeit: `<html lang="de-DE">` sollte **`de-CH`** sein — konsistent mit der Schreibweise und ein (schwaches) Regionalitätssignal für Suchmaschinen.

### Positionierung: bewusste Verschiebung gegenüber Prod
| | Prod (alt) | Staging/Neu |
|---|---|---|
| H1 Startseite | „Softwarelösungen für intelligente Prozesse im Facility-Management und in der Medizintechnik." | „Digitale Lösungen für komplexe Betriebsprozesse" |
| Fokus | FM + Medizintechnik (eng, branchenspezifisch) | Betriebsprozesse allgemein (breit) |
| Navigation | CAFM, Sterilgutaufbereitung, Referenzen, Profil, Kontakt | Leistungen, CAFM, Lösungen, Referenzen, Über Leantris, Kontakt |

Die Verbreiterung ist offenbar gewollt (mehr Individualentwicklung/Schnittstellen-Geschäft). Sie hat aber einen Preis, siehe nächster Punkt.

## 2. Ist sofort sichtbar, was Leantris macht?

**Teilweise — das ist die grösste inhaltliche Schwäche.**

- Die H1 „Digitale Lösungen für komplexe Betriebsprozesse" könnte von hunderten IT-Dienstleistern stammen. Sie sagt weder *was* (Software? Beratung? Integration?) noch *für wen* (Spitäler? Industrie?).
- Der Lead-Text klärt das sehr gut („…von CAFM mit HSD Nova-FM über Schnittstellen und Fachanwendungen bis zu Betrieb, Support und Monitoring") — steht aber auf Desktop **unter dem Fold**.
- Die alte Prod-H1 war spezifischer und SEO-stärker (enthielt „Software", „Facility-Management", „Medizintechnik").

**Konkrete Vorschläge (Auswahl, CI-konform kurz):**
1. H1 behalten, aber eine **sichtbare Subline** in den ersten Viewport: „Software, Schnittstellen und CAFM für Gesundheitswesen und Facility Management — aus Bern."
2. Oder H1 schärfen: „Wir digitalisieren Betriebsprozesse — von CAFM bis zur Individualentwicklung."
3. Die Branchen (Gesundheitswesen, FM, Industrie, Logistik, Reinigung) tauchen erst tief auf der Leistungen-Seite auf. Eine Branchen-Zeile auf der Startseite („Im Einsatz bei Spitälern, Kliniken und Betrieben in der ganzen Schweiz") schafft sofort Kontext und Vertrauen.

## 3. SEO-Technik

### 3.1 Hash-Routing ist das grösste SEO-Hindernis *(strukturell)*
Die App nutzt `createWebHashHistory` → alle Routen liegen hinter `#/…`. Suchmaschinen behandeln das als **eine einzige URL**: Unterseiten sind nicht einzeln indexierbar, erscheinen nicht in Suchergebnissen, können nicht verlinkt-geteilt ranken. Die alte WP-Site hatte echte Pfade — beim Umstieg gingen damit potenziell alle Unterseiten-Rankings verloren.

**Empfehlung (kleiner Eingriff, grosse Wirkung):**
1. `createWebHistory` statt Hash-Mode (eine Zeile in `src/router/index.js`)
2. `.htaccess` mit SPA-Fallback ins Deployment aufnehmen (Novatrend ist Apache):
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```
3. 301-Redirects der alten WP-URLs, die es neu nicht mehr gibt (z. B. `/profil` → `/ueber-leantris`), ebenfalls in der `.htaccess`.

### 3.2 Vollständige Indexierbarkeit: Prerendering *(empfohlen)*
Auch mit History-Mode liefert der Server zunächst leeres HTML; Google rendert JS zwar, aber verzögert und unzuverlässig für kleine Sites. Da die Site vollständig statisch ist, bietet sich **Build-Time-Prerendering** an: pro Route eine fertige HTML-Datei erzeugen (z. B. mit `vite-prerender-plugin` oder einem eigenen Playwright-Skript — die Infrastruktur dafür existiert in `scripts/` bereits). Ergebnis: jede Seite sofort crawlbar mit komplettem Inhalt, Titel und Meta-Tags.

### 3.3 Fehlende SEO-Grundausstattung *(schnell nachrüstbar)*
| Element | Status | Empfehlung |
|---|---|---|
| `robots.txt` | fehlt | `public/robots.txt` mit Sitemap-Verweis |
| `sitemap.xml` | fehlt | beim Build generieren (21 Routen) |
| Meta-Description pro Seite | nur global in `index.html` | per Route in `meta` pflegen und im `afterEach` setzen (wie `title`) |
| Canonical-Tag | fehlt | pro Route setzen |
| Open-Graph/Twitter-Tags | fehlen | global + pro Seite (Titel, Beschreibung, Vorschaubild — z. B. Standbild des jeweiligen Hero-Videos) |
| Strukturierte Daten | fehlen | JSON-LD `ProfessionalService`/`Organization` mit Adresse (Bümplizstrasse 150, 3018 Bern), Telefon, Geo — wichtig für lokale Suche „CAFM Schweiz/Bern" |
| `lang` | `de-DE` | `de-CH` |
| Google Search Console | — | nach Go-live einrichten, Sitemap einreichen, Indexabdeckung der alten URLs überwachen |

### 3.4 Title-Hygiene
- ✅ Behoben in diesem Repo: `/loesungen` hatte denselben Titel wie `/leistungen` (Duplikat aus Staging übernommen).
- Die Titel der alten WP-Seiten sind teils ganze Sätze (z. B. Sterilgutaufbereitung: 104 Zeichen, Nova-FM-Module: 95 Zeichen). Empfehlung: kürzen auf ≤ 60 Zeichen, Muster „Primär-Keyword – Leantris", z. B. „Sterilgutaufbereitung mit HSD ChargenDoc – Leantris".
- Der Home-Titel „Software für das Facility-Management im Gesundheitswesen" ist gut (Keywords + spezifisch) — er passt allerdings nicht zur neuen, breiteren H1. Titel und H1 sollten dieselbe Geschichte erzählen (siehe Abschnitt 2).

### 3.5 Staging-Hygiene
Die Staging-Site unter `leantris.ch/staging` sollte per `noindex` oder Passwortschutz vor Indexierung geschützt sein, sonst konkurriert sie nach dem Go-live mit der neuen Site (Duplicate Content).

## 4. Bilder & Medien

- **Alt-Texte:** Die aus dem Export übernommenen Bilder tragen teils generische oder leere `alt`-Attribute. Für die wenigen Inhaltsbilder (Referenz-Fotos, ChargenDoc-Screenshots, Clarita-Board) beschreibende Alt-Texte ergänzen — bei ~15 Bildern eine halbe Stunde Arbeit.
- **Videos ohne Poster:** Alle Hero-Videos laden ohne `poster`. Ein Standbild als Poster verbessert LCP (Largest Contentful Paint), verhindert leere Flächen bei langsamer Verbindung und liefert gleich das OG-Vorschaubild mit.
- **Gewicht:** `mixkit-particles…mp4` mit 14,2 MB auf sechs Unterseiten ist das grösste Performance-Problem der Site (Details und Zielwerte in `docs/design-ux-analyse.md`, Abschnitt 2.8). Core Web Vitals sind ein Rankingfaktor — das Video-Gewicht ist damit auch ein SEO-Thema.
- **Formatmodernisierung:** JPG/PNG-Bestand bei Gelegenheit nach WebP/AVIF konvertieren (`<picture>`-Fallback); die `srcset`-Struktur aus WordPress ist bereits vorhanden und kann weiterverwendet werden.
- **Fehlende Videos behoben:** Das Lösungen-Hero-Video und das Leistungen-Video existierten auf Prod nicht (404) und werden jetzt lokal mitdeployt.

## 5. Inhaltliche Beobachtungen (über SEO hinaus)

1. **Referenzen sind das schwächste Glied der Conversion-Kette:** nur zwei Projekte, ohne Resultate/Zahlen/Zitate. Für B2B-Entscheider im Gesundheitswesen ist das die wichtigste Seite. Konkrete Anreicherungsvorschläge in der Design-Analyse, Abschnitt 2.4.
2. **Kontakt-Hürde niedrig halten:** Der Text verspricht „eine Demo" — ein direkter Kalender-Link (z. B. „30 Min Demo buchen") neben dem Formular würde die Hürde weiter senken. Formular-Backend (Formspree o. ä.) muss vor Go-live angebunden werden.
3. **Impressum/Datenschutz:** Footer-Link vorhanden, Seite existiert. Datenschutzerklärung vor Go-live auf Aktualität prüfen (Formular-Dienstleister erwähnen, revDSG).
4. **Nicht verlinkte Alt-Seiten:** `/nova-fm-module` und `/hsd-nova-fm-medizintechnik` sind nur von /cafm aus erreichbar und stammen erkennbar aus der alten Site-Generation (anderer Textstil, „45 Module"-Liste). Entscheiden: entweder redaktionell an die neue Tonalität angleichen oder Inhalte in /cafm integrieren und die Seiten per Redirect auflösen.

## 6. Priorisierung

| Prio | Massnahme | Wirkung | Aufwand |
|------|-----------|---------|---------|
| 1 | History-Mode + `.htaccess` (3.1) | Unterseiten überhaupt indexierbar | klein |
| 2 | robots.txt, sitemap.xml, Meta-Descriptions, Canonical (3.3) | Crawling-Grundlagen | klein |
| 3 | Prerendering (3.2) | zuverlässige Indexierung aller Seiten | mittel |
| 4 | H1/Subline-Schärfung Startseite (2.) | Klarheit + Keywords | klein (Texterarbeit) |
| 5 | JSON-LD + OG-Tags (3.3) | lokale Suche, Sharing | klein |
| 6 | Video-Kompression + Poster (4.) | Core Web Vitals | klein |
| 7 | Referenzen ausbauen (5.1) | Conversion | mittel (Inhalt nötig) |
| 8 | Alt-Texte, Title-Kürzungen | Feinschliff | klein |
