# Svenska 300 – Progressive Web App

Mobiler Deutsch-Schwedisch-Vokabeltrainer mit 300 häufigen und lernrelevanten Grundwörtern.

## Funktionen

- Deutsch → Schwedisch und Schwedisch → Deutsch
- Filter: Gemischt, Nomen, Verben, Präpositionen, restliche Wörter
- Verben: Infinitiv + Präsens
- Nomen: en/ett + Singular + Plural
- Richtige Karten wandern ans Ende der Warteschlange
- Falsche Karten erscheinen nach 3–5 anderen Karten erneut
- Trefferquote, Serie und Rundenfortschritt
- Lernstand in `localStorage`
- Offlinefähig via Service Worker
- Installierbar als PWA
- Smartphone-first Layout inkl. Safe-Area-Unterstützung
- Relative Pfade: funktioniert in GitHub Pages auch in Projekt-Repositories

## GitHub Pages veröffentlichen

1. Den Inhalt dieses Ordners in ein GitHub-Repository hochladen.
2. In GitHub: **Settings → Pages**.
3. Unter **Build and deployment**: `Deploy from a branch` auswählen.
4. Branch `main`, Ordner `/ (root)` wählen und speichern.
5. Nach dem Deployment die von GitHub angezeigte Pages-URL öffnen.

Es sind keine Build-Schritte, npm-Pakete oder Serverkomponenten nötig.

## Wortbasis

Die Auswahl orientiert sich an der **Swedish Kelly List** von Språkbanken Text, Universität Göteborg, einer frei verfügbaren frequenzbasierten Lernwortliste für modernes Schwedisch. Für den Trainer wurde daraus eine lernorientierte Auswahl gebräuchlicher Grundwörter zusammengestellt und um deutsche Bedeutungen sowie benötigte Flexionsformen ergänzt.

Quelle: https://spraakbanken.gu.se/en/resources/kelly
Lizenz der Kelly-Daten: CC BY 4.0.

## Dateien

- `index.html` – Oberfläche
- `styles.css` – Smartphone-first Gestaltung
- `words.js` – 300 Wörter
- `app.js` – Lernlogik
- `manifest.webmanifest` – PWA-Metadaten
- `sw.js` – Offline-Cache
- `icons/` – App-Icons

## App-Icon

Die PWA verwendet ein Elch-Icon in den schwedischen Nationalfarben.
Enthalten sind 180×180, 192×192, 512×512 und 1024×1024 Pixel.
