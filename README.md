# Vokabeltrainer Deutsch ↔ Schwedisch

Progressive Web App (PWA) zum Lernen der **300 häufigsten schwedischen Wörter**.

## Features

- **Sprachrichtung wechseln**: Deutsch → Schwedisch oder Schwedisch → Deutsch
- **Kategorien**: Gemischt · Nomen · Verben · Präpositionen · Restliche Wörter
- **Verben**: Bei richtiger Antwort werden Infinitiv + Präsens angezeigt
- **Nomen**: Bei richtiger Antwort werden Artikel (en/ett), Singular und Plural angezeigt
- **Spaced-Repetition-ähnlich**: Richtige Wörter wandern ans Ende der Warteschlange, falsche kommen bald wieder
- **Smartphone-optimiert**: Große Touch-Buttons, sicherer Bereich, Installationsbanner
- **PWA**: Zum Home-Bildschirm hinzufügen – funktioniert offline

## GitHub Pages Deployment

1. Erstelle ein neues Repository auf GitHub (z. B. `vokabeltrainer-se`)
2. Lade **alle Dateien** aus diesem Ordner in das Repository hoch (Root oder `docs/`-Ordner)
3. Gehe zu **Settings → Pages**
4. Als Source wähle **Deploy from a branch** → Branch `main` → Folder `/ (root)` oder `/docs`
5. Nach 1–2 Minuten ist die App unter  
   `https://DEIN-USERNAME.github.io/vokabeltrainer-se/` erreichbar

### Tipp für eigenes Subverzeichnis
Falls die App in einem Unterordner liegt, passe in `manifest.json` und `sw.js` die Pfade an (relativ lassen ist meist am einfachsten).

## Installation auf dem Handy

1. Öffne die URL im **Safari** (iOS) oder **Chrome** (Android)
2. iOS: Teilen-Button → „Zum Home-Bildschirm“
3. Android: Menü → „App installieren“ / „Zum Startbildschirm hinzufügen“

Das App-Icon zeigt die schwedische Flagge.

## Dateien

| Datei            | Beschreibung                          |
|------------------|---------------------------------------|
| `index.html`     | Hauptseite + CSS                      |
| `app.js`         | Logik (Queue, Kategorien, PWA)        |
| `vocab.js`       | 300 Vokabeln mit Metadaten            |
| `manifest.json`  | PWA-Manifest                          |
| `sw.js`          | Service Worker (Offline-Cache)        |
| `icon-192.png`   | Icon 192×192                          |
| `icon-512.png`   | Icon 512×512                          |

Viel Erfolg beim Schwedischlernen! 🇸🇪
