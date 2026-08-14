# NeedIt

Marktplatz für akute Bedürfnisse: Nutzer beschreiben, was sie gerade brauchen ("Ich brauche heute jemanden, der mir beim Umzug hilft"), andere Nutzer bieten Hilfe an.

**Zielgruppe:** 🇩🇪 Deutschland · 🇦🇹 Österreich · 🇨🇭 Schweiz (Architektur ist offen für weitere Länder)

## Tech-Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, Storage, Realtime)
- **Hosting:** Vercel
- **Mobile:** Web zuerst (mobile-first, PWA-fähig), spätere Erweiterung um React Native (Expo) möglich, da die Supabase-Logik wiederverwendbar ist

## Status

🚧 In Entwicklung — MVP-Aufbau läuft in Phasen.

## MVP-Roadmap

- [x] Phase 1 — Projekt erstellen & Entwicklungsumgebung einrichten
- [x] Phase 2 — Homepage & Design
- [x] Phase 3 — Supabase einrichten
- [x] Phase 4 — Registrierung & Login
- [x] Phase 5 — Anfragen erstellen
- [x] Phase 6 — Anfragen anzeigen & filtern
- [x] Phase 7 — "Ich kann helfen"
- [x] Phase 8 — Messaging
- [x] Phase 9 — Profile & Bewertungen
- [x] Phase 10 — Benachrichtigungen
- [x] Phase 11 — Moderation & Sicherheit
- [ ] Phase 12 — Mobile Optimierung

## Lokale Entwicklung

1. `npm install`
2. `.env.example` nach `.env.local` kopieren und mit den eigenen Supabase-Zugangsdaten (Project Settings → API) befüllen
3. SQL-Migrationen aus `supabase/migrations/` der Reihe nach im Supabase SQL Editor ausführen
4. `npm run dev` und `http://localhost:3000` öffnen
