# Design- & UX-Analyse leantris.ch

Stand: 11. Juni 2026 · Basis: Vue-3-Umsetzung in diesem Repo (Stand nach Unterseiten-Fix), abgeglichen mit der Staging-Site und aktuellen UI/UX-Standards.

> **Umsetzungsstand (Branch `design-optimierungen`):** Die Punkte 2.1–2.3, 2.5–2.8 sowie die kreativen Vorschläge 3.1–3.7 (ausser Hover-Video-Preview 3.4, umgesetzt als dezenter Bild-Zoom) sind auf diesem Branch implementiert. Offen bleiben: Referenzen-Inhalte anreichern (2.4, braucht Kundenfreigabe für Zahlen/Zitate) und das Formular-Backend (Formspree-ID in `ContactForm.vue`).

## 1. Einordnung des Grunddesigns

Das vom Designer entwickelte System ist ein **redaktioneller Swiss-Style-Minimalismus**:

- Markante Display-Typografie (BwGradual) gegen neutralen Fliesstext (Helvetica Now)
- Sichtbares Spaltenraster mit Haarlinien bei 10/30/50/70/90 %
- Eine einzige Akzentfarbe (Mint `#eef2ee`) plus Dunkelgrün (`#234f37`) als Sekundärfarbe
- Monochrome, ruhige Videoflächen statt Stockfotos
- Pill-Buttons mit Invert-Hover

**Bewertung:** Das ist ein starkes, eigenständiges Fundament — deutlich über dem Branchendurchschnitt für KMU-B2B-Sites. Es altert gut, ist nicht trendgetrieben und differenziert klar von typischen CAFM-Anbieter-Websites (die meist blau, dicht und SaaS-generisch aussehen). **Empfehlung: Grundsystem nicht antasten.** Die folgenden Punkte sind Schärfungen innerhalb der bestehenden CI.

## 2. Konkrete Befunde (Usability)

### 2.1 Above the Fold: Wertversprechen kommt zu spät *(hohe Priorität)*
Auf dem Desktop zeigt der erste Viewport der Startseite: Logo, Navigation, Mint-Fläche mit Video — die H1 ragt gerade noch unten hinein. Lead-Text und die beiden CTAs („Leistungen ansehen", „Kontakt aufnehmen") liegen **unter dem Fold**. Ein Erstbesucher sieht 3–4 Sekunden lang keine Aussage darüber, was Leantris tut.

**Vorschlag:** Hero-Komposition so stauchen, dass H1 + ein Kurz-Lead (eine Zeile) + Primär-CTA im ersten Viewport stehen. Die Mint-Fläche darf dafür flacher werden — die Wirkung bleibt. Alternativ: H1 höher setzen und den Lead als zweizeilige Subline direkt darunter.

### 2.2 Mobile: Header-Elemente kontrastarm *(mittlere Priorität)*
Auf Mobile liegt der Leantris-Schriftzug halbtransparent über der Mint-/Video-Fläche und ist kaum lesbar; der Burger ist dünn und klein. Das wirkt elegant, kostet aber Orientierung.

**Vorschlag:** Beim Scroll-Zustand „oben" dem Mobile-Header eine definierte Mindestdeckkraft geben (z. B. Logo voll schwarz), die 40-%-Blur-Optik erst ab Scrollposition > Hero aktivieren.

### 2.3 Grosse Leerflächen auf Unterseiten *(mittlere Priorität)*
Kontakt-, Lösungs- und Leistungsseiten haben sehr grosse weisse Zwischenräume (teils > 1 Viewport ohne Inhalt). Grosszügigkeit gehört zur CI, aber in dieser Dosis entsteht der Eindruck „Seite ist fertig/leer", und Nutzer brechen das Scrollen ab.

**Vorschlag:** Vertikale Paddings der Sektionen um ~30–40 % reduzieren (die `padding-top/bottom: 10–15vw`-Werte auf 6–8vw). Der Rhythmus bleibt luftig, aber die Seite „endet" nicht gefühlt nach jeder Sektion.

### 2.4 Referenzen-Seite wirkt unterbestückt *(mittlere Priorität)*
Die dunkelgrüne Referenzen-Seite ist gestalterisch der stärkste Moment der Site — aber sie trägt nur zwei Karten. Für die wichtigste Vertrauensseite ist das zu wenig Substanz.

**Vorschlag (Inhalt + Design):**
- Pro Referenz ein konkretes Resultat als grosse Zahl („> 3'000 Geräte in Nova-FM erfasst", „45 Module im Einsatz") — passt typografisch perfekt zur CI
- Ein bis zwei kurze Kundenzitate (eine Zeile, kursiv, mit Name/Funktion)
- Logo-Leiste weiterer Kunden (monochrom, klein) — auch ohne eigene Detailseite

### 2.5 Carousel auf der Sterilgut-Seite ist nicht funktional *(niedrige Priorität)*
Die Seite `/loesungen/sterilgutaufbereitung` enthält ein Bild-Carousel aus dem WordPress-Theme. Das Theme-JS wurde bewusst nicht übernommen — aktuell zeigt das Carousel nur die erste Slide, Pfeile/Swipe tun nichts.

**Vorschlag:** Entweder ein kleiner Vue-Composable (`useCarousel`, ~40 Zeilen: Klick auf Pfeile + Touch-Swipe, Transform auf `.lay-carousel-slides`) oder die drei Screenshots als statische Bildspalte layouten. Letzteres ist ehrlicher, wenn keine weiteren Carousels geplant sind.

### 2.6 Formular-UX *(mittlere Priorität)*
Das Kontaktformular (Seite + Footer) hat Placeholder statt sichtbarer Labels, keine Inline-Validierung und keinen sichtbaren Fokus-Zustand. Placeholder-only-Labels sind ein bekanntes Accessibility- und Usability-Problem (Label verschwindet beim Tippen).

**Vorschlag:** Kleine, persistente Labels über den Feldern (CI-konform in 12–13px Helvetica Now), klarer `:focus-visible`-Rahmen in Dunkelgrün, Fehlermeldungen inline unter dem Feld. Erfolgs-/Fehlerzustand nach Absenden deutlich anzeigen.

### 2.7 Accessibility-Lücken *(mittlere Priorität, günstig zu beheben)*
- Hero-Videos laufen in Autoplay-Loop ohne Pausierungsmöglichkeit (WCAG 2.2.2). Vorschlag: dezenter Pause-Button (das Theme hatte `volume-on/off`-Icons — ein Pause-Toggle im selben Stil passt).
- `prefers-reduced-motion` wird nicht respektiert: Scroll-Reveals und Parallax sollten dann deaktiviert werden (eine Media-Query in `usePageEffects` + CSS).
- Burger-Button ohne `aria-label`/`aria-expanded`; Navigation ohne Skip-Link.
- Fokus-Reihenfolge und sichtbare Fokuszustände für Tastaturnutzer fehlen weitgehend.

### 2.8 Performance / Medien *(hohe Priorität bei Mobilnutzung)*
- `mixkit-particles-…-hd-ready.mp4` ist **14,2 MB** und wird auf allen sechs Leistungen-Unterseiten geladen. Ziel: < 2–3 MB (H.264 CRF 28–30 oder besser AV1/WebM, 720p reicht für die Hintergrundwirkung). Zusätzlich `preload="metadata"` + `poster`-Standbild statt `preload="auto"`.
- Alle Hero-Videos laden mit `preload="auto"` — auf Mobile unnötig teuer. `poster` + `preload="metadata"` spart Daten ohne sichtbaren Unterschied, da Autoplay das Laden ohnehin anstösst.
- Das CSS ist monolithisch (~960 KB, 77 KB gzip). Funktioniert, aber ein späterer Purge-Schritt (z. B. nur tatsächlich genutzte `id-*`-Blöcke) würde es etwa halbieren.

## 3. Kreative Vorschläge (CI-konform, optional)

Die CI bleibt unangetastet — das sind Verstärkungen der vorhandenen Designsprache:

1. **Kinetischer H1-Einstieg:** Die Startanimation zeilenweise statt als Block — jede H1-Zeile mit 80–120 ms Versatz von unten einblenden (existierendes `.below`/`.in-view`-System kann das bereits, nur Stagger pro Zeile statt pro Spalte).
2. **Linien als erzählendes Element:** Die vertikalen Haarlinien beim Scrollen sektionweise „zeichnen" lassen (CSS `scale-y` mit `scroll-timeline` / IntersectionObserver). Das macht das Raster zum Markenzeichen statt nur zur Struktur.
3. **Dunkelgrün als wiederkehrender Akkord:** Die dunkelgrüne Fläche existiert nur auf /referenzen. Als Schlusssektion („Warum Leantris?") auf der Startseite wiederholt, gibt sie der Site einen erkennbaren Rhythmus: weiss → mint → dunkelgrün.
4. **Hover-Reveal auf Referenzkarten:** Beim Hover über eine Referenzkarte das zugehörige Projektvideo/-bild dezent einblenden (Pattern, das das Lay-Theme mit `row-hoverimage` bereits kannte).
5. **Zahlen-Typografie:** Kennzahlen (45 Module, Anzahl Geräte, Jahre Erfahrung) in BwGradual-Grösse als eigenes Gestaltungselement — grosse Zahlen sind die natürlichste Erweiterung dieser Typo-CI.
6. **View Transitions API:** Statt des generischen Fade beim Routenwechsel die H1 der Zielseite morphen lassen (`view-transition-name` auf dem H1-Container). Progressive Enhancement, ein Nachmittag Aufwand.
7. **Grain auf Mint:** Ein sehr feines Noise-Overlay (2–3 % Opacity) auf den Mint-Flächen nimmt ihnen die digitale Glätte und passt zur partikelartigen Anmutung der Videos.

## 4. Priorisierung

| Prio | Massnahme | Aufwand |
|------|-----------|---------|
| 1 | Hero: H1 + Lead + CTA in den ersten Viewport | klein |
| 2 | Videos komprimieren, `poster` + `preload="metadata"` | klein |
| 3 | Formular-Labels, Fokus-Zustände, Validierung | mittel |
| 4 | Mobile-Header-Kontrast | klein |
| 5 | Accessibility (reduced-motion, aria, Video-Pause) | mittel |
| 6 | Sektions-Paddings straffen | klein |
| 7 | Referenzen anreichern (Zahlen, Zitate, Logos) | mittel (Inhalt nötig) |
| 8 | Kreative Verstärkungen (Abschnitt 3) | je klein–mittel |

## 5. Bereits behobene Design-Bugs (in diesem Repo)

- HSD-Partnerlogo im Footer war auf allen Seiten unsichtbar (`img.lay-gif` ohne `loaded`-Klasse) — behoben
- Hero-Video auf /loesungen lud nicht (404 auf Prod) — wird jetzt lokal ausgeliefert
- 13 fehlende Unterseiten ergänzt, CTA-Navigation repariert
