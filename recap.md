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

## 🗓️ Semaine 2 — 14 → 20 juillet 2026

**Thème** : Autocomplete Places API + markers stops + polish UI dropdown

### ✅ Fait

#### Refactoring architectural — `APIProvider` remonté dans `page.tsx` (14 juillet)
- `APIProvider` déplacé de `MapContainer.tsx` vers `page.tsx` pour que `AddStopInput` puisse utiliser `useMapsLibrary` (hook qui nécessite un `APIProvider` ancêtre)
- Check `!apiKey` déplacé dans `page.tsx` → message d'erreur clair si `.env.local` manquant
- `MapContainer` n'est plus responsable de la clé API, reçoit uniquement les données à afficher

#### Extension du type `Stop` — `types/index.ts` (14 juillet)
Trois champs ajoutés (optionnels pour rétrocompatibilité) :
```ts
lat?: number;
lng?: number;
placeId?: string;
```

#### Réécriture complète `AddStopInput.tsx` — autocomplete Google Places (14 juillet)
Passage d'un simple `<input>` texte à un vrai autocomplete :
- **`useMapsLibrary('places')`** charge la lib Places à la demande (lazy, pas de surcharge initiale)
- **`new places.Autocomplete(inputRef.current, { fields: [...], types: [...] })`** attaché à l'input natif
- **Location bias 10 km** : `navigator.geolocation.getCurrentPosition` avec `maximumAge: 300_000` (utilise la position déjà en cache depuis `MapContainer`) → `ac.setBounds(circle.getBounds())` → résultats locaux prioritaires (ex : McDonald's de Corbais avant ceux de Bruxelles)
- **Fallback** : si géoloc refusée → bounding box Belgique entière (SW: 49.5/2.5 — NE: 51.5/6.4)
- **`onAddStopRef`** (useRef stable) : évite de recréer l'instance `Autocomplete` à chaque re-render quand le callback parent change
- **`/// <reference types="@types/google.maps" />`** en tête de fichier : résout le namespace global `google.maps` sous TypeScript strict + `moduleResolution: bundler`
- À la sélection : `onAddStop({ address, lat, lng, placeId })` + reset automatique de l'input
- Bouton "Add" supprimé — l'action est déclenchée par la sélection dans le dropdown uniquement

#### Refonte `handleAddStop` et `handleRemoveStop` — `page.tsx` (14 juillet)
- **`handleAddStop`** : reçoit maintenant `{ address, lat, lng, placeId }` (complet) au lieu d'une string
- **`handleRemoveStop`** : après filtre, les `order` sont réindexés via `.map((stop, i) => ({ ...stop, order: i + 1 }))` → numérotation toujours consécutive même après suppression d'un stop intermédiaire

#### Markers des stops sur la carte — `MapContainer.tsx` (14 juillet)
- Prop `stops?: Stop[]` ajoutée (défaut `[]`)
- Pour chaque stop ayant `lat` et `lng` définis → `<Marker>` avec `label={{ text: String(stop.order), color: 'white', fontWeight: 'bold' }}` et `title={stop.address}`
- Distinction visuelle avec le marker de position utilisateur (point bleu SVG)

#### Stylisation du dropdown Google Places — `globals.css` (14 juillet)
Google injecte `.pac-container` dans `<body>` après le chargement de notre CSS → `!important` requis sur les propriétés clés :
- **Container** : `background-color: var(--surface-1)`, `backdrop-filter: blur(20px)`, `border-radius: 16px`, shadow multicouche
- **Items** : hover `var(--hover)`, `border-top: none`, coins arrondis 10px, transition douce
- **Texte** : primaire `var(--text-1)`, secondaire `var(--text-2)` 12px, matched `#3b7dff` gras
- **Icône pin** : `filter: brightness(0) invert(1)` en dark mode → rendu blanc
- **"Powered by Google"** : conservé (obligations ToS Google) mais semi-transparent
- Suit automatiquement le dark/light mode via les CSS variables de `:root` → aucune duplication de règles

#### Installation `@types/google.maps` (14 juillet)
- Ajouté en `devDependency` pour résoudre les erreurs TypeScript sur le namespace `google.maps.*` utilisé directement dans `AddStopInput.tsx`

### 🔧 Fichiers modifiés / créés

| Fichier | État | Description |
|---|---|---|
| `frontend/types/index.ts` | ✏️ | `Stop` + `lat?`, `lng?`, `placeId?` |
| `frontend/app/page.tsx` | ✏️ | `APIProvider` remonté, `handleAddStop`/`handleRemoveStop` refactorisés, `stops` passé à `MapContainer` |
| `frontend/components/AddStopInput.tsx` | ♻️ refonte totale | Autocomplete Places + location bias 10km |
| `frontend/components/MapContainer.tsx` | ✏️ | `APIProvider` retiré, prop `stops`, markers numérotés |
| `frontend/app/globals.css` | ✏️ | Section `.pac-container` overrides dark/light |
| `frontend/package.json` | ✏️ | +1 devDep : `@types/google.maps` |

### 📝 Warnings / points d'attention

- **`setBounds` = biais doux** : le rayon de 10km priorise les résultats locaux mais ne les restreint pas. Taper "mcdo bruxelles" retourne Bruxelles normalement. Rayon réduit de 50km → 10km après tests (Brussels ~25km était encore visible avec 50km).
- **`google.maps.Marker` deprecated** (warning console, non bloquant) : migration vers `AdvancedMarkerElement` planifiée en S8.
- **`APIProvider` dans `page.tsx`** : breaking change architectural. Si un composant futur a besoin de Google Maps hors de `page.tsx` (ex: dans un layout), il faudra remonter encore plus haut ou dupliquer.

---

## 🗓️ Semaine 3 — 21 → 27 juillet 2026

**Thème** : Refactor backend — structure modulaire prête pour S4

### Fait

#### `config.py` — chargement centralisé du `.env` (22 juillet)
- Lit `GOOGLE_MAPS_API_KEY` et `FRONTEND_ORIGIN` depuis `backend/.env` via `python-dotenv`
- Valeurs par défaut : clé vide + `http://localhost:3000` (dev)
- Tous les autres modules font `from config import GOOGLE_MAPS_API_KEY` — un seul point de vérité

#### `database.py` — placeholder SQLAlchemy (22 juillet)
- Fichier vide pour l'instant, sera rempli en S6 avec la vraie connexion PostgreSQL
- Créé maintenant pour que l'architecture finale soit visible dès S3

#### `schemas.py` — validation Pydantic des données API (22 juillet)
Quatre modèles créés :
- **`StopIn`** : adresse + lat/lng avec validators (`-90≤lat≤90`, `-180≤lng≤180`) + `place_id` optionnel
- **`OptimizeRequest`** : liste de stops avec garde-fous : **min 2 stops, max 25 stops** (protège les crédits Google et les performances OR-Tools)
- **`OptimizeResponse`** : `optimal_order`, `total_duration_sec`, `total_distance_m`, `polyline_encoded` optionnel
- **`UserCreate`** : `EmailStr` (valide le format email via `email-validator`) + password ≥8 caractères avec au moins 1 chiffre (sera utilisé en S6)

#### `services/google_maps.py` — squelette Routes API (22 juillet)
- Fonctions `get_duration_matrix(stops)` et `get_route_polyline(stops)` définies mais lèvent `NotImplementedError`
- Signatures fixes dès maintenant → le router d'optimisation et les tests futurs peuvent les référencer

#### `services/optimizer.py` — squelette OR-Tools (22 juillet)
- Fonction `solve_tsp(distance_matrix)` définie mais lève `NotImplementedError`
- Sera implémentée en S4 avec le CP-SAT solver de Google

#### `routers/optimize_router.py` — endpoint `/optimize` (22 juillet)
- `POST /optimize` visible dans Swagger (`http://localhost:8000/docs`) et documenté
- Retourne **501 Not Implemented** pour l'instant — l'endpoint existe, la logique arrive en S4
- Valide déjà les données entrantes via `OptimizeRequest` (si on envoie >25 stops → 422 Validation Error)

#### `main.py` refactorisé (22 juillet)
- Réduit à 3 responsabilités : création de l'app FastAPI + middleware CORS + inclusion des routers
- CORS lit `FRONTEND_ORIGIN` depuis `config.py` (plus de string en dur)
- Endpoint `/` supprimé → remplacé par **`GET /health`** : `{"status": "ok", "version": "0.1.0"}`
  - Requis par Render pour les health checks
  - Sera appelé au mount de la home frontend pour le wake-up du cold start (S8)

#### Dépendances installées (22 juillet)
```
email-validator  → EmailStr dans Pydantic v2
httpx            → client HTTP async pour appels Routes API (S4)
ortools          → solveur TSP CP-SAT de Google (S4)
sqlalchemy       → ORM Python (S6)
psycopg2-binary  → driver PostgreSQL (S6)
alembic          → migrations DB (S6)
```

### 🔧 Fichiers modifiés / créés

| Fichier | État | Description |
|---|---|---|
| `backend/main.py` | ✏️ refactorisé | Réduit au strict : app + CORS + routers + /health |
| `backend/config.py` | 🆕 | Chargement `.env` centralisé |
| `backend/database.py` | 🆕 | Placeholder SQLAlchemy (S6) |
| `backend/schemas.py` | 🆕 | StopIn, OptimizeRequest (max 25), OptimizeResponse, UserCreate |
| `backend/services/__init__.py` | 🆕 | Package Python |
| `backend/services/google_maps.py` | 🆕 | Squelette Routes API (NotImplementedError → S4) |
| `backend/services/optimizer.py` | 🆕 | Squelette OR-Tools solve_tsp (NotImplementedError → S4) |
| `backend/routers/__init__.py` | 🆕 | Package Python |
| `backend/routers/optimize_router.py` | 🆕 | POST /optimize → 501 pour l'instant |
| `backend/requirements.txt` | ✏️ | +6 dépendances (voir ci-dessus) |

### 📝 Warnings / points d'attention

- **`EmailStr` dans Pydantic v2 requiert `email-validator`** : ne pas oublier en déploiement (Render) — déjà dans `requirements.txt`.
- **`ortools` = grande dépendance** (~24 MB wheel, mais installation rapide). En prod sur Render, le build prendra ~30s de plus.
- **`psycopg2-binary` vs `psycopg2`** : la version `-binary` est auto-suffisante (pas besoin de PostgreSQL installé localement). En prod, certains hébergeurs recommandent la version source — à noter pour S6.
- **`NotImplementedError` dans les services** : si uvicorn est lancé et qu'on appelle `/optimize`, le serveur renvoie proprement une `HTTPException 501`. Les logs n'explosent pas.

---

## 🗓️ Semaine 4 — 28 juillet → 3 août 2026 *(à venir)*

**Thème** : OR-Tools + matrice de distances + endpoint /optimize fonctionnel

### 🎯 Objectifs dev

- Implémenter `services/google_maps.py::get_duration_matrix(stops)` → appelle Routes API, renvoie matrice N×N
- Implémenter `services/optimizer.py::solve_tsp(distance_matrix)` → OR-Tools CP-SAT
- Implémenter `services/google_maps.py::get_route_polyline(stops)` → polyline encodée
- Compléter `routers/optimize_router.py::POST /optimize` → brancher les services
- Tester via Swagger UI avec 5-8 stops réels belges
- Mesurer le temps de réponse (cible : <2s pour 10 stops)

*(Sera rempli à la fin de la semaine 4.)*

---
