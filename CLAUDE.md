# CLAUDE.md – leantris-web

## Auftrag
Baue eine vollständige statische Vue 3 Single-Page-Application für leantris.ch.
Die Site ersetzt die bestehende WordPress-Installation und wird auf Novatrend-Hosting deployed.
Ziel: Sauberer, wartbarer Vue-Code der das bestehende Design 1:1 nachbaut.

## Primäre Quelle: Simply Static Export
Im Ordner `reference/` liegt der vollständige statische HTML-Export der WordPress-Staging-Site.
Diese Dateien sind die **einzige verbindliche Quelle** für:
- Alle CSS-Werte (Farben, Fonts, Abstände, Grid-Proportionen)
- Alle Animationen (CSS @keyframes, Transitions, Scroll-Effekte)
- Alle inline `<style>` Tags mit den PHP-generierten Design-Werten
- Die exakte HTML-Struktur jeder Seite
- Alle Asset-Referenzen (Videos, Bilder, Fonts)

**Workflow:** Lies zuerst die HTML-Dateien im `reference/`-Ordner, extrahiere daraus alle CSS-Regeln, Animationen und Layout-Werte. Baue die Vue-Komponenten basierend auf diesen echten Werten — nicht auf den unten stehenden Annäherungswerten.

Die folgenden Abschnitte dienen als Übersicht und Fallback, aber bei Abweichungen gilt immer der Export.

---

## Tech Stack
- Vue 3 (Composition API)
- Vue Router 4 (Hash-Mode für statisches Hosting)
- Vite als Build-Tool
- Kein CSS-Framework – reines CSS mit CSS-Variables, basierend auf dem Export
- Animationsbibliothek nur falls nötig nach Analyse des Exports (evtl. AOS oder GSAP)
- Kein Backend – Kontaktformular via Formspree oder ähnlichem Static-Form-Service

---

## Design-System

### Farben
```css
--color-bg: #ffffff;
--color-bg-hero: #eef2ee;       /* mintgrün/salbei */
--color-text: #000000;
--color-link: #000000;
--color-btn-primary-bg: #000000;
--color-btn-primary-text: #ffffff;
--color-btn-primary-border: #000000;
--color-btn-secondary-text: #234f37;
--color-btn-secondary-border: #234f37;
--color-btn-accent-bg: #b6daae;
--color-btn-accent-text: #234f37;
--color-btn-accent-border: #b6daae;
```

### Typografie
```css
/* Headlines */
font-family: 'BwGradual-Medium', 'Helvetica Neue', sans-serif;
font-weight: 300;
font-size: 76px;
letter-spacing: 0.01em;

/* Fliesstext / Navigation */
font-family: 'HelveticaNowDisplay-Regular', 'Helvetica Neue', sans-serif;
font-weight: 300;
font-size: 25px;
letter-spacing: 0.03em;
line-height: 1.2;
```

### Buttons
- **Primary**: schwarz gefüllt, weisser Text, border-radius: 100px (Pill), padding: 16px 32px
  - Hover: weisser Hintergrund, schwarzer Text (animiert)
- **Secondary**: Outline dunkelgrün `#234f37`, kein Hintergrund
  - Hover: gefüllt dunkelgrün, weisser Text
- **Accent**: hellgrüner Hintergrund `#b6daae`, Text `#234f37`, border-radius: 100px
  - Hover: invertiert (dunkelgrün Hintergrund, hellgrüner Text)

### Layout Hero
- Zweispaltig: links weiss (Logo + Nav), rechts mintgrün (`#eef2ee`) mit Video
- Vertikale Trennlinie zwischen Spalten
- Navigation vertikal ausgerichtet, oben links
- Logo oben links als SVG-Image

### Navbar (beim Scrollen)
- Versteckt sich beim Scrollen nach unten
- Erscheint wieder beim Scrollen nach oben
- Blur-Effekt (backdrop-filter: blur), Opacity 40%

### Animationen
**Alle Animationen sind im Simply Static Export enthalten** — in den inline `<style>` Tags und den exportierten JS-Dateien.
Extrahiere die exakten @keyframes, Transitions und Scroll-Animationen aus den HTML-Dateien im `reference/`-Ordner.
Folgende Animationstypen sind bekannt:
- Scroll-Animationen (Text einblenden)
- Video-Hintergründe: `autoplay muted loop playsinline`
- CSS-Linien-Animationen
- Hover-Animationen auf Buttons
- Startanimation beim Laden der Seite
Die genauen CSS-Werte und Keyframes stehen im Export — diese 1:1 übernehmen.

---

## Assets

### Logo
```
https://leantris.ch/staging/wp-content/uploads/2021/04/Leantris-Logo.svg
```
Lokal speichern als: `src/assets/Leantris-Logo.svg`

### Videos (direkt von Novatrend referenzieren)
```
Abstract:   https://leantris.ch/wp-content/uploads/2021/05/LEA-Abstract-1293206533.mp4
Referenzen: https://leantris.ch/wp-content/uploads/2021/05/LEA-Referenzen-1252590746_LR.mp4
Angebot:    https://leantris.ch/wp-content/uploads/2021/05/LEA-Angebot-1171543575_LR.mp4
Tablet:     https://leantris.ch/wp-content/uploads/2021/05/LEA-Tablet-664912028_LR.mp4
Profil:     https://leantris.ch/wp-content/uploads/2021/05/LEA-Profil-1171052254_LR.mp4
Webinar:    https://leantris.ch/wp-content/uploads/2021/05/LEA-Webinar-1220330363_LR.mp4
Lösungen:   https://leantris.ch/wp-content/uploads/2026/05/150-135737445.mp4
```

---

## Seitenstruktur & Routen

```
/                    → Home
/leistungen          → Leistungen
/cafm                → CAFM
/loesungen           → Lösungen
/referenzen          → Referenzen
/ueber-leantris      → Über Leantris
/kontakt             → Kontakt
```

### Navigation (alle Seiten)
- Leistungen
- CAFM
- Lösungen
- Referenzen
- Über Leantris
- Kontakt ↓ (Anchor-Link zu #kontakt)

---

## Seiteninhalte

### Home (`/`)
**Hero (zweispaltig)**
- Links: Logo + Navigation
- Rechts: Video `LEA-Abstract-1293206533.mp4` + Text unten:
  - H1: „Digitale Lösungen für komplexe Betriebsprozesse"
  - Lead: „Leantris digitalisiert Abläufe, verbindet Systeme und entwickelt individuelle Lösungen, die im Alltag funktionieren. Von CAFM mit HSD Nova-FM über Schnittstellen und Fachanwendungen bis zu Betrieb, Support und Monitoring."
  - Buttons: „Leistungen ansehen" (primary) | „Kontakt aufnehmen" (secondary)

**Sektion 1**
- H2: „Systeme, Daten und Abläufe sinnvoll verbinden"
- Text: „Viele Organisationen arbeiten mit gewachsenen Systemlandschaften, manuellen Abläufen und Daten, die an verschiedenen Orten gepflegt werden. Leantris bringt Struktur in diese Komplexität: Wir analysieren Prozesse, verbinden Systeme und entwickeln digitale Lösungen, die zur Organisation passen."
- Video: `LEA-Referenzen-1252590746_LR.mp4`

**Sektion 2**
- H2: „Wenn Prozesse wachsen, entstehen Medienbrüche"
- Text: „Daten werden mehrfach gepflegt, Auswertungen entstehen manuell, Schnittstellen fehlen und wichtige Informationen sind nicht dort verfügbar, wo sie gebraucht werden. Das kostet Zeit, erschwert Entscheidungen und macht den Betrieb unnötig fehleranfällig."
- H3: „Vom Prozess zur funktionierenden Lösung"
- Text: „Wir starten nicht mit einer fertigen Standardantwort. Zuerst klären wir Abläufe, Rollen, Daten und Systeme. Danach entwickeln oder integrieren wir Lösungen, die fachlich passen, technisch sauber umgesetzt sind und im laufenden Betrieb betreut werden können."

**Sektion 3 – Was Leantris leistet**
- H2: „Was Leantris leistet"
- Lead: „Leantris unterstützt Organisationen bei Prozessanalyse, Schnittstellen, Individualentwicklung, Reporting, Betrieb und CAFM-Einführung – pragmatisch, praxisnah und von der Analyse bis zum laufenden Betrieb."
- Button: „Zu den Leistungen"

**Sektion 4 – CAFM**
- H2: „CAFM mit HSD Nova-FM"
- Text: „CAFM bleibt ein Kernbereich von Leantris. Mit HSD Nova-FM unterstützen wir technisches, kaufmännisches und infrastrukturelles Facility Management. Die modulare Lösung bildet Gebäude, Anlagen, Geräte, Flächen, Aufträge, Verträge und Datenflüsse strukturiert ab. Leantris begleitet Sie von der Bedarfsanalyse über Einführung und Schnittstellen bis zum laufenden Support."
- Button: „CAFM mit HSD Nova-FM entdecken"

**Sektion 5 – Lösungen**
- H2: „Produkte und Fachlösungen für den Betriebsalltag"
- Text: „Neben CAFM realisiert Leantris weitere Lösungen für spezifische Betriebsprozesse: Sterilgutaufbereitung mit HSD ChargenDoc, individuelle Fachanwendungen, Schnittstellen- und Middleware-Lösungen, Reporting, Automatisierung sowie technische Umsetzungen im Auftrag von Partnern."
- Button: „Zu unseren Lösungen"

**Sektion 6 – Referenzen**
- H2: „Projekte aus der Praxis"
- Text: „Unsere Projekte zeigen, wie digitale Lösungen im Alltag wirken: in Facility Management, Medizintechnik, Reinigung, Gesundheitswesen, Individualentwicklung, Schnittstellen, Backend-/Frontend-Umsetzung und Monitoring."
- Button: „Projekte ansehen"

**Sektion 7 – Abschluss mit Video**
- Video: `LEA-Angebot-1171543575_LR.mp4`
- H3: „Von der Analyse bis zum laufenden Betrieb"
- Text: „Leantris begleitet Projekte schrittweise: Anforderungen und Prozesse klären, Lösung und Systemlandschaft konzipieren, Software und Schnittstellen umsetzen, Einführung begleiten, Betrieb überwachen und Weiterentwicklung sicherstellen."
- H3: „Warum Leantris?"
- Text: „Leantris verbindet fachliches Prozessverständnis mit technischer Umsetzung. Wir sind ein Schweizer KMU aus Bern, arbeiten pragmatisch und bleiben auch nach dem Go-live erreichbar. Unser Ziel sind Lösungen, die nicht nur eingeführt werden, sondern im Alltag zuverlässig funktionieren."
- Button: „Kontakt aufnehmen"

---

### Leistungen (`/leistungen`)
**Hero**
- Video: `LEA-Tablet-664912028_LR.mp4`
- H1: „Leistungen für digitale Betriebsprozesse"
- Lead: „Komplexe Betriebsprozesse lassen sich nicht mit Standardsoftware allein verbessern. Leantris unterstützt Organisationen dabei, Prozesse zu analysieren, passende Lösungen zu entwickeln, Systeme zu verbinden und den laufenden Betrieb sicherzustellen."

**Leistungs-Kacheln (6 Stück)**
1. **Prozessanalyse & Digitalisierung** – „Wir klären Abläufe, Rollen, Daten und Systeme, bevor eine Lösung umgesetzt wird." → Link: /leistungen/prozessanalyse
2. **Schnittstellen & Systemintegration** – „Wir verbinden bestehende Systeme und Datenquellen so, dass Informationen zuverlässig verfügbar sind." → Link: /leistungen/schnittstellen
3. **Individualentwicklung** – „Wir entwickeln schlanke Anwendungen, Portale, Backends oder Erweiterungen, wenn Standardsoftware nicht passt." → Link: /leistungen/individualentwicklung
4. **Reporting & Automatisierung** – „Wir machen Daten nutzbar und automatisieren wiederkehrende Auswertungen, Prüfungen und Benachrichtigungen." → Link: /leistungen/reporting
5. **Betrieb, Support & Monitoring** – „Wir begleiten Lösungen nach dem Go-live, überwachen produktive Abläufe und unterstützen bei Anpassungen." → Link: /leistungen/betrieb
6. **CAFM-Beratung & Einführung** – „Wir unterstützen Einführung, Erweiterung und Betrieb von HSD Nova-FM – fachlich und praxisnah." → Link: /cafm

**Abschluss**
- „Wenn Sie prüfen möchten, ob und wie wir bei Ihnen helfen können: Schreiben Sie uns kurz Ihre Ausgangslage — wir melden uns mit einem sachlichen nächsten Schritt."
- Buttons: „Lösungen ansehen" | „CAFM"

---

### CAFM (`/cafm`)
**Hero**
- Video: `LEA-Tablet-664912028_LR.mp4`
- H1: „CAFM für komplexe Betriebsumgebungen"
- Lead: „Mit HSD Nova-FM unterstützt Leantris technisches, kaufmännisches und infrastrukturelles Facility Management. Die modulare CAFM-Lösung bildet Gebäude, Anlagen, Geräte, Flächen, Aufträge, Verträge und Datenflüsse strukturiert ab."

**Hauptvorteile (4 Kacheln)**
1. **Für alles eine Lösung** – „Nova bietet Dutzende von Modulen für das technische, kaufmännische und infrastrukturelle Facility-Management. Von A wie Anlagenmanagement bis Z wie Zuordnung von Arbeitsplätzen. Jedes Modul lässt sich bedarfsgerecht anpassen."
2. **Zentrale Plattform** – „Wir verbinden unterschiedliche Datenquellen wie SAP, CAD oder Outlook mit einer zentralen CAFM-Plattform. Dort sind alle Informationen abgebildet, die Ihr Facility-Management benötigt."
3. **Jederzeit mobil** – „Arbeiten Sie ortsunabhängig. Mit der Weblösung von HSD Nova greifen Sie via Tablet, Smartphone oder Notebook auf Ihre Daten zu."
4. **Basis für Rechtssicherheit** – „HSD Nova bietet alle Voraussetzungen, um medizinische Geräte, Zubehör und Gefahrenstoffe gesetzeskonform zu bewirtschaften."

---

### Lösungen (`/loesungen`)
**Hero**
- Video: `150-135737445.mp4`
- H1: „Lösungen für spezifische Betriebsprozesse"
- Lead: „Neben CAFM realisiert Leantris Lösungen für konkrete betriebliche Anforderungen: Sterilgutaufbereitung mit HSD ChargenDoc, individuelle Fachanwendungen und Schnittstellen – von der Idee bis zum laufenden Betrieb."

**Lösungs-Kacheln (4 Stück)**
1. **Sterilgutaufbereitung mit HSD ChargenDoc** – „Digitale Lösung für Sterilgutaufbereitung nach ISO 13485 – Reinigung, Verpackung, Sterilisation, Lagerung und Dokumentation strukturiert und lückenlos abgebildet."
2. **HSD Nova-FM** – „Modulare CAFM-Software für technisches, kaufmännisches und infrastrukturelles Facility Management."
3. **Individualisierte Fachanwendungen** – „Leantris entwickelt schlanke Fachanwendungen, Portale, Backends oder Erweiterungen für Prozesse, die Standardsoftware nicht sauber abbildet."
4. **Clarita Huddleboard** – „Digitales Huddleboard für Spitäler, Rehakliniken, Psychiatrien und Heime – Stationsplanung, Teamkoordination und Patienteninformationen zentral auf einem Display. Leantris ist technischer Umsetzungspartner von Clarita."

---

### Referenzen (`/referenzen`)
**Hero**
- Video: `LEA-Referenzen-1252590746_LR.mp4`
- H1: „Projekte aus der Praxis"
- Lead: „Eine Auswahl realisierter Projekte – wo Medizintechnik, Facility Management und Vernetzung bereits von unserer Software profitieren."

**Referenz-Karten**
1. **Klinik Schloss Mammern** – Tags: CAFM · Facility Management – „HSD Nova-FM für die vollständige Abbildung des Facility Managements – Servicemanagement, Raumbuch, Flächen- und Schlüsselmanagement."
2. **Spital Thurgau AG** – Tags: CAFM · Medizintechnik – „Ganze Medizintechnik und alle IT-Geräte in HSD Nova-FM integriert, inklusive Rettungsdienst-Fahrzeuge."

---

### Über Leantris (`/ueber-leantris`)
**Hero**
- Video: `LEA-Profil-1171052254_LR.mp4`
- H1: „Leantris: Ihr Team für zukunftsweisendes Facility-Management."

**4 Absätze**
- „Wir sind ein Schweizer KMU aus Bern. Bei uns treffen Sie auf bodenständige, erfahrene Leute, die von Ihrem Metier begeistert sind: Experten in Elektrotechnik, Gebäudetechnik, Informatik und Betriebswirtschaft."
- „Wir optimieren Ihre Prozesse. Unsere Lösungen sind zeitgemäss und vernetzen intelligent, was zusammengehört. Aus Schnittstellen machen wir Nahtstellen, damit Systeme und Menschen besser miteinander kommunizieren."
- „Wir haben hohe Qualitätsansprüche. Wir erwarten viel von uns selber und von unseren Partnerfirmen. HSD, der Hersteller unserer Softwarelösungen, ist ein flexibler Familienbetrieb mit Hauptsitz in Bremen."
- „Wir hören Ihnen zu. Es kommt uns nicht in den Sinn, Ihnen vorgefertigte Ideen aufzudrängen. Wir schätzen Ihre Praxiserfahrung und haben für Sie ein offenes Ohr."

**Abschluss**: H2: „Wir sind Leantris!"

---

### Kontakt (`/kontakt`)
**Hero**
- Video: `LEA-Webinar-1220330363_LR.mp4`
- H1: „Kontakt"
- Text: „Haben Sie eine Frage, eine Projektidee oder möchten Sie bestehende Prozesse digital weiterentwickeln? Wir freuen uns auf Ihre Nachricht."
- Text: „Gerne zeigen wir Ihnen HSD Nova-FM in einer Demo oder sprechen mit Ihnen eine Beratung zu CAFM, Schnittstellen, Individualentwicklung oder Betrieb/Support durch."

**Kontaktformular** (Felder)
- Name (Pflicht)
- E-Mail (Pflicht)
- Telefon (optional)
- Anliegen / Nachricht (Pflicht, Textarea)
- Button: „Nachricht senden" (primary)

**Kontaktdaten**
- Leantris AG, Bümplizstrasse 150, 3018 Bern
- +41 31 533 70 10
- info@leantris.ch
- Google Maps Link: https://goo.gl/maps/Hm8p1meMYbZbQdDL8

---

## Footer (alle Seiten)
- Logo
- Navigation: Leistungen | CAFM | Lösungen | Referenzen | Über Leantris | Kontakt
- Kontaktformular (kompakt, gleiche Felder wie Kontaktseite)
- Adresse: Bümplizstrasse 150, 3018 Bern
- Tel: +41 31 533 70 10
- E-Mail: info@leantris.ch
- Partner-Logo: HSD Händschke (Link: https://www.haendschke.de)
- © 2025 Leantris. Alle Rechte vorbehalten.
- Link: Impressum und Datenschutz

---

## Projektstruktur
```
C:\Code\leantris-web\
├── CLAUDE.md              ← Diese Datei
├── reference/             ← Simply Static Export (HTML/CSS/JS) — NICHT editieren
│   ├── index.html
│   ├── leistungen/
│   ├── cafm/
│   ├── loesungen/
│   ├── referenzen/
│   ├── ueber-leantris/
│   ├── kontakt/
│   └── wp-content/        ← CSS, JS, Fonts, Videos, Bilder
├── src/                   ← Vue 3 Projekt (neu erstellen)
└── ...
```

## Deployment (Novatrend)
- `npm run dev` → lokaler Dev-Server zum Testen unter http://localhost:5173
- `npm run build` → erzeugt `dist/`
- Inhalt von `dist/` per FTP nach `public_html/` auf Novatrend hochladen
- WordPress-Dateien können danach entfernt werden
- `.htaccess` für Vue Router (Hash-Mode braucht keine spezielle Config)
