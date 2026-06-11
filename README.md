# leantris-web

Statische Vue-3-SPA für leantris.ch – 1:1-Nachbau der WordPress-Staging-Site
(Lay Theme), basierend auf dem Simply-Static-Export in `reference/`.

## Entwicklung

```bash
npm install
npm run dev        # Dev-Server auf http://localhost:5173
npm run build      # Produktions-Build nach dist/
npm run preview    # dist/ lokal testen (http://localhost:4173)
```

## Struktur

- `src/views/` – die 8 Seiten (Home, Leistungen, CAFM, Lösungen, Referenzen,
  Über Leantris, Kontakt, Impressum). Templates sind 1:1 aus dem Export
  generiert (`scripts/build-views.mjs`).
- `src/components/` – SiteHeader (Navbar inkl. Hide-on-Scroll, Burger-Menü),
  SiteFooter, ContactForm, IntroOverlay.
- `src/composables/usePageEffects.js` – Scroll-Einblendungen (below/in-view)
  und Parallax (`data-yvel`), repliziert das Verhalten des Lay-Themes.
- `src/styles/`
  - `lay-theme.css` – Theme-Basis (frontend.style.css aus dem Export)
  - `lay-frontend.css` – Customizer-CSS (Typografie, Scroll-Transitions)
  - `lay-site.css` – Fonts, Intro, vertikale Linien-Animation
  - `wp-custom.css` – Site-spezifisches Custom-CSS (Buttons, Panels)
  - `grids.css` – per Page-ID gescopte Grid-Layouts aller Seiten
  - `ninja-forms.css` + `site-extra.css` – Formular-Styling und Ergänzungen
- `public/wp-content/` – lokale Assets (Fonts, Logos, Bilder) unter den
  Original-URLs. Videos werden direkt von leantris.ch geladen.

## Kontaktformular (Formspree)

In `src/components/ContactForm.vue` die Konstante `FORMSPREE_ENDPOINT`
mit der eigenen Formular-ID ersetzen (Formular anlegen auf
https://formspree.io, z. B. `https://formspree.io/f/abcdwxyz`).

## Deployment (Novatrend)

1. `npm run build`
2. Inhalt von `dist/` per FTP nach `public_html/` hochladen
3. Hash-Routing (`/#/leistungen`) benötigt keine `.htaccess`-Anpassung

Die Ordner `reference/` (Export), `analysis/` (Extraktions-Zwischenstände)
und `scripts/` (Generator-/Test-Skripte) werden nicht deployt.
