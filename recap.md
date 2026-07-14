# 📓 Récapitulatif dev — TFE Route App

> Journal technique cumulatif : ce qui a été réalisé côté code / infra / setup, semaine par semaine.
> Complémentaire à [PLAN-TFE.md](PLAN-TFE.md) (planification) et à [docs/redaction/](docs/redaction/) (analyse académique pour le TFE écrit).
>
> **Mise à jour** : à chaque fin de tâche dev significative.

---

## 🗓️ Semaine 1 — 7 → 13 juillet 2026

**Thème** : Fondations écrit + intégration Google Maps

### ✅ Fait

#### Setup Google Cloud (7 juillet)
- Compte Google Cloud + projet créé
- Deux projets séparés créés (**bonne pratique sécurité** — anticipe le split front/back de S6/S7) :
  - `route-app-front-end` → clé restreinte à **Maps JavaScript API** + **Places API**, référants HTTP `localhost:3000/*`
  - `route-app-backend` → clé restreinte à **Geocoding API** + **Routes API** (sera utilisée en S3/S4)
- Alerte budget 5 €/mois + quota dur 500 chargements/jour

#### Config frontend (7 juillet)
- Créé `frontend/.env.local` avec `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Vérifié `.gitignore` : `.env*` déjà couvert, aucun risque de commit
- Installé `@vis.gl/react-google-maps` (lib officielle maintenue par Google via vis.gl)

#### Refonte `MapContainer.tsx` (7 juillet)
Fichier passé de **19 lignes (placeholder pointillé)** à **~180 lignes** avec les fonctionnalités suivantes :

- **Carte Google Maps interactive** en fond via `<APIProvider>` + `<Map>`
- **Dark mode synchronisé** avec le `ThemeProvider` via la prop `colorScheme="DARK"|"LIGHT"` (nouvelle API Google Maps v3.55+)
- **Géolocalisation navigateur** via hook custom `useUserLocation()` avec :
  - Machine à états explicite : `loading` / `granted` / `denied` / `unavailable`
  - Fallback silencieux sur Bruxelles (lat 50.8503, lng 4.3517, zoom 12) si refus/erreur
  - Lazy initializer `useState` pour éviter le warning React 19 "cascading renders"
  - Fonction `retry()` exposée pour re-tenter la géoloc à la demande
- **Marker "you are here"** style Google (cercle bleu `#4285F4` + bordure blanche 3px, SVG data-URL)
- **Recentrage automatique unique** sur la position de l'utilisateur (via `useRef` pour tracker sans re-render)
- **Bouton FAB de recentrage** en bas-droite (`glass-soft`, 48×48px, WCAG AA touch target) :
  - État `loading` : spinner + disabled
  - État `granted` : icône crosshair active + hover scale-up + recentre au clic
  - État `denied` : icône rouge + ouvre un **panneau d'aide** au clic
- **Panneau d'aide "Réactiver la géolocalisation"** avec instructions pas-à-pas (cadenas → autorisations → recharger), `role="dialog"` pour l'accessibilité

### ⏳ En cours / à faire cette semaine
- [ ] Écrit : rédiger la synthèse de S1 dans `docs/redaction/semaine-01.md` (fait, à enrichir au fil de la semaine)
- [ ] Écrit : rédiger le Chapitre 1 — Introduction dans Word (~3-4 pages)
- [ ] Écrit : démarrer le Chapitre 2 — Contexte & problématique

### 🔧 Fichiers modifiés / créés

| Fichier | État | Description |
|---|---|---|
| `frontend/.env.local` | 🆕 | Clé Google Maps publique |
| `frontend/package.json` | ✏️ | +1 dep : `@vis.gl/react-google-maps` |
| `frontend/components/MapContainer.tsx` | ♻️ refonte totale | Carte + géoloc + dark mode + FAB + aide |
| `recap.md` | 🆕 | Ce fichier |
| `docs/redaction/semaine-01.md` | 🆕 | Analyse académique S1 |

### 📝 Warnings / points d'attention

- **`google.maps.Marker` deprecated** (warning console non-bloquant). Migration vers `AdvancedMarkerElement` prévue en **S8**, nécessite un Map ID configuré dans Google Cloud Console (à faire en même temps que le custom styling éventuel de la carte).
- **`net::ERR_BLOCKED_BY_CLIENT`** : ad-blocker peut bloquer les tuiles Google Maps → whitelist `localhost:3000` obligatoire pour dev.
- **Popup de permission ne réapparaît pas après un "Bloquer"** : comportement voulu par tous les navigateurs. Notre panneau d'aide guide l'utilisateur vers les settings navigateur.

---

## 🗓️ Semaine 2 — 14 → 20 juillet 2026 *(à venir)*

- Autocomplete d'adresses via Places API dans `AddStopInput.tsx`
- Type `Stop` étendu avec `lat`, `lng`, `placeId`
- Markers sur la carte pour chaque stop ajouté

*(Sera rempli à la fin de la semaine 2.)*

---
