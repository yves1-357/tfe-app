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
- **`OptimizeRequest`** : liste de stops avec garde-fous : **min 2 stops, max 15 stops** (protège les crédits Google et les performances OR-Tools)
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
- Valide déjà les données entrantes via `OptimizeRequest` (si on envoie >15 stops → 422 Validation Error)

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
| `backend/schemas.py` | 🆕 | StopIn, OptimizeRequest (max 15), OptimizeResponse, UserCreate |
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

## 🗓️ Semaine 4 — 22 juillet 2026

**Thème** : OR-Tools + Routes API + endpoint /optimize fonctionnel

### Fait

#### Implémentation `services/google_maps.py` (22 juillet)
- **`get_duration_matrix(stops)`** : construit la matrice N×N en faisant N×(N-1) appels **parallèles** à `computeRoutes` via `asyncio.gather`, limités à 10 concurrents par `asyncio.Semaphore`
- **`get_route_polyline(stops)`** : appelle `computeRoutes` avec tous les stops dans l’ordre optimal, retourne `(polyline_encoded, total_duration_sec, total_distance_m)`
- `computeRouteMatrix` **abandonné** : retourne 404 (nécessite Routes API Advanced, non disponible en Basic) → approche parallèle équivalente
- `_parse_seconds("1234s")` : helper qui parse le format de durée Google API

#### Implémentation `services/optimizer.py` (22 juillet)
- Import corrigé : `pywrapcp` (pas `pywraprcp` — typo dans le nom du module OR-Tools 9.x)
- **`solve_tsp(distance_matrix)`** : OR-Tools Routing Library
  - `RoutingIndexManager(n, 1, 0)` : N nodes, 1 véhicule, dépôt au node 0
  - Stratégie : `PATH_CHEAPEST_ARC` (solution initiale greedy) + `GUIDED_LOCAL_SEARCH` (amélioration locale)
  - Time limit 2s : garantit une réponse rapide même pour N=15
  - Fallback : retourne l’ordre original si le solver échoue

#### Câblage `routers/optimize_router.py` (22 juillet)
- Flow complet : **matrice N×N** → **TSP OR-Tools** → **polyline**
- Erreurs remontées en HTTP 502 si l’API Google échoue
- Testé via Swagger UI avec 3 stops réels :
  - `optimal_order: [0, 2, 1]` (Grand-Place → Namur → Atomium)
  - `total_duration_sec: 7700` (~128 min)
  - `total_distance_m: 140040` (~140 km)
  - `polyline_encoded`: 3000+ caractères encodés 

#### Max stops réduit : 25 → **15** (22 juillet)
- N=15 : 210 appels API parallèles, ~5s — acceptable pour la démo
- N=25 : 600 appels, ~15s — trop lent
- Mis à jour dans `schemas.py` + `PLAN-TFE.md`

#### Configurations Google Cloud résolues (22 juillet)
- Clé backend avait une **restriction HTTP référant** (`localhost:8000/*`) qui bloquait tous les appels Python → remplacée par **None** (aucune restriction, acceptable en dev)
- Routes API activée dans le projet `route-app-backend` (nécessaire pour `computeRoutes`)
- En prod (S7) : restriction par **adresse IP** (IP fixe de Render) à ajouter

#### Fichiers d’environnement (22 juillet)
- `backend/.env` créé avec `GOOGLE_MAPS_API_KEY`
- `frontend/.env.local` enrichi avec `NEXT_PUBLIC_API_URL=http://localhost:8000` (utile dès S5)

### 🔧 Fichiers modifiés / créés

| Fichier | État | Description |
|---|---|---|
| `backend/services/google_maps.py` | ♻️ implémenté | Matrice parallèle + polyline via computeRoutes |
| `backend/services/optimizer.py` | ♻️ implémenté | TSP OR-Tools pywrapcp (PATH_CHEAPEST_ARC + GLS) |
| `backend/routers/optimize_router.py` | ♻️ implémenté | POST /optimize complet, 502 si API Google échoue |
| `backend/schemas.py` | ✒️ | max stops 25 → 15 |
| `backend/.env` | 🆕 | GOOGLE_MAPS_API_KEY (clé backend) |
| `frontend/.env.local` | ✒️ | +NEXT_PUBLIC_API_URL=http://localhost:8000 |
| `PLAN-TFE.md` | ✒️ | Références 25 stops → 15 stops |

### 📝 Warnings / points d’attention

- **`computeRouteMatrix` non disponible** en Routes API Basic : l’approche parallèle `computeRoutes` est équivalente fonctionnellement mais plus coûteuse en appels (N×(N-1) vs 1). Pour N=15, c’est négligeable. À mentionner dans le chapitre 7.4.
- **Restriction clé backend en prod** : mettre une restriction par IP Render en S7 (pas None en prod).
- **OR-Tools optimise un circuit** (retour au dépôt) : la polyline affichée est le trajet one-way dans l’ordre optimal, pas le circuit complet. Comportement correct et attendu pour l’UX.

---

## 🗓️ Semaine 5 — 4 → 10 août 2026

**Thème** : Câblage UI ↔ backend + affichage polyline + trip mode

### Fait

#### Connexion frontend ↔ backend (`frontend/lib/api.ts`)
- Créé `optimizeRoute(stops)` avec appel `POST /optimize`
- Mapping propre frontend → backend (`placeId` vers `place_id`) avant envoi JSON
- Gestion d'erreur robuste : si l'API renvoie une erreur, remontée du `detail` backend côté UI

#### Intégration dans `page.tsx` : orchestration complète du flow optimise
- `handleOptimize` branché sur le backend réel (plus de flow purement local)
- Ajout d'un `loading` state (`isOptimizing`) + état d'erreur (`optimizeError`)
- Réordonnancement des stops selon `optimal_order` pour refléter visuellement la solution OR-Tools
- Support du départ GPS : si la géoloc est dispo, injection d'un noeud de départ temporaire puis retrait côté UI après optimisation
- Conservation des états de trip (`isTripMode`, `currentStopIndex`, `startedFromGPS`) pour un enchaînement UX fluide

#### Affichage du trajet optimisé sur la carte
- Polyline backend (`polyline_encoded`) affichée sur la carte via `MapContainer` + `RouteOverlay`
- Highlight visuel du stop courant en mode trajet
- Ajout de `MapAutoFit` pour ajuster automatiquement les bounds (position user + stops) et éviter les stops hors écran

#### `BottomPanel` enrichi avec résultats et actions
- Affichage des métriques réelles : durée totale + distance totale
- CTA `Start Route` connecté au mode trajet
- Message d'erreur utilisateur affiché en cas d'échec backend
- Deep-links Google Maps / Waze disponibles après optimisation

#### Trip mode (Phase 4bis) finalisé
- Composant `TripMode.tsx` opérationnel avec progression stop par stop
- Bouton `J'y suis` pour passer au prochain arrêt
- Bouton `Trajet terminé` pour clôturer proprement la session
- Deep-links point-a-point (origine → stop courant) pour une navigation plus précise

#### Corrections UX de fin de semaine
- Correction d'un bug d'input/autocomplete qui restait figé après fin de trajet
  - `BottomPanel` reste monté en permanence ; il est masqué visuellement pendant le trajet
- Ajustement des transitions entre modes pour éviter les reset inattendus
- Vérification lint/type sur les derniers ajustements (dépendances hooks incluses)

### 🔧 Fichiers modifiés / créés

| Fichier | État | Description |
|---|---|---|
| `frontend/lib/api.ts` | 🆕 | Appel backend `optimizeRoute` |
| `frontend/app/page.tsx` | ✏️ | Flow optimisation, états UI, trip mode, départ GPS |
| `frontend/components/RouteOverlay.tsx` | 🆕 | Décodage + rendu polyline Google |
| `frontend/components/BottomPanel.tsx` | ✏️ | Résultats (durée/distance), erreurs, CTA Start Route |
| `frontend/components/TripMode.tsx` | 🆕 | Navigation stop par stop + actions de progression |
| `frontend/components/MapContainer.tsx` | ✏️ | Highlights stop courant + auto-fit map |
| `frontend/lib/deep-links.ts` | 🆕 | URLs Google Maps/Waze (global + point-a-point) |

### 📝 Warnings / points d'attention

- **Clés API front/back bien séparées** : la clé backend ne doit pas avoir de restriction HTTP referrer (runtime serveur).
- **Autocomplete Google** : styles `.pac-*` maintenus via `!important` (injection DOM externe).
- **Matrice Routes API** : approche `computeRoutes` pairwise conservée (pas de `computeRouteMatrix` en plan Basic).

### ▶️ Transition S6

- S5 dev est clôturée : optimisation E2E + trip mode prêts pour démo.
- Prochaine cible immédiate : auth + DB (JWT, SQLAlchemy, routes `/auth/*`, base PostgreSQL).

---

## 🗓️ Semaine 6 — 11 → 17 août 2026 *(avancée, commencée le 3 août)*

**Thème** : Auth + PostgreSQL + Saved Routes (backend + frontend complets)

### Fait

#### PostgreSQL local + SQLAlchemy (3 août)
- PostgreSQL installé nativement sur Windows, base `nextstop` créée, user `postgres` / password `dev` / port 5432
- `database.py` complet : `create_engine`, `SessionLocal`, `Base = declarative_base()`, dépendance FastAPI `get_db()`
- Pas d'Alembic pour l'instant → `Base.metadata.create_all(bind=engine)` au startup de FastAPI (migration Alembic planifiée en S7)

#### `models.py` — modèles ORM (3 août)
Deux tables créées avec SQLAlchemy 2.0 (style `Mapped`) :
- **`User`** : `id`, `name` (nullable), `email` (unique), `password_hash`, `created_at`
- **`SavedRoute`** : `id`, `user_id` (FK → users.id avec `ON DELETE CASCADE`), `name`, `stops_json` (JSON), `optimized_order_json` (JSON), `total_duration_sec`, `total_distance_m`, `created_at`
- Relation bidirectionnelle `user.saved_routes` avec `cascade="all, delete-orphan"` → droit à l'oubli RGPD automatique

#### `auth.py` — hashing + JWT (3 août)
- `CryptContext(schemes=["bcrypt"])` via **passlib 1.7.4** + **bcrypt pinned à 4.0.1**
  - bcrypt 5.x incompatible avec passlib 1.7.4 (C-level error sur le detect_wrap_bug interne) → downgrade à 4.0.1
  - `_to_72_bytes(password)` : troncature explicite UTF-8 à 72 bytes avant hachage (limite bcrypt)
- `create_access_token(user_id)` : JWT HS256, expiry 7 jours, payload `{ "sub": str(user_id), "exp": ... }`
- `get_current_user` : dépendance FastAPI `OAuth2PasswordBearer`, décode JWT, charge l'utilisateur depuis DB

#### `routers/auth_router.py` — endpoints auth (3 août)
- `POST /auth/register` : crée un User, hash le mot de passe, renvoie `UserRead` (201)
  - 409 si email déjà pris
- `POST /auth/login` : vérifie email + password, renvoie JWT
  - 401 si identifiants invalides
- `GET /auth/me` : renvoie l'utilisateur courant (token requis)
- `DELETE /auth/me` : supprime le compte + cascade sur `saved_routes` (RGPD) — renvoie 200

#### `routers/routes_router.py` — CRUD trajets sauvegardés (3 août)
- `POST /routes` (201) : sauvegarde un trajet pour l'utilisateur connecté (`user_id` issu du JWT)
- `GET /routes` : liste les trajets de l'utilisateur, triés par `created_at DESC`
- `DELETE /routes/{route_id}` (204) : supprime un trajet après vérification d'ownership (404 si pas owner)

#### `schemas.py` — extensions Pydantic (3 août)
Nouveaux modèles ajoutés :
- **`UserCreate`** : `name` (min 2 chars), `EmailStr`, `password` (≥8 chars, ≥1 chiffre, ≤72 chars bcrypt)
- **`UserLogin`**, **`UserRead`** (avec `name`), **`AuthToken`**
- **`StopForSave`** : `address`, `order`, `lat?`, `lng?`
- **`SavedRouteCreate`** : `name`, `stops: list[StopForSave]`, `optimized_order`, `total_duration_sec?`, `total_distance_m?`
- **`SavedRouteRead`** : `id`, `name`, `created_at`, durée, distance, `stops_json`

#### Frontend — `lib/auth.ts` (3 août)
Gestion du token JWT côté client :
- `getAuthToken()` / `setAuthToken()` / `clearAuthToken()` / `hasAuthToken()` → localStorage
- `registerUser(name, email, password)` → `POST /auth/register`
- `loginUser(email, password)` → `POST /auth/login` + `setAuthToken()`
- `getCurrentUser()` → `GET /auth/me` + clear token automatique si 401
- `deleteCurrentUser()` → `DELETE /auth/me` + `clearAuthToken()`
- `parseErrorDetail()` : gère les deux formats d'erreur Pydantic (`string` detail ET tableau `[{msg, loc}]` 422)

#### Frontend — `lib/api.ts` — extensions (3 août)
- `saveRoute(payload)` → `POST /routes` avec Bearer token
- `getSavedRoutes()` → `GET /routes` avec Bearer token
- `deleteSavedRoute(id)` → `DELETE /routes/{id}` avec Bearer token

#### Frontend — `AuthModal.tsx` (3 août)
Modal Login/Register intégrée dans le SideMenu (pas de page dédiée — meilleure UX modale) :
- Bascule Login ↔ Register, reset des champs à l'ouverture
- Affiche les erreurs Pydantic précises (validation email, force du mot de passe, etc.)
- Stylisée avec `.auth-modal-shell` (dark + light mode via Tailwind + CSS vars)

#### Frontend — `DeleteAccountModal.tsx` (3 août)
Modal de suppression de compte RGPD :
- L'utilisateur doit **taper** `DELETETHISACCOUNT` exactement (pas de coller — `onPaste` bloqué)
- Bouton "Supprimer" activé uniquement si la correspondance est exacte
- Style `.auth-modal-shell` cohérent avec les autres modales

#### Frontend — `SaveRouteDialog.tsx` (3 août)
Dialog post-trajet (affiché après "Trajet terminé" si l'utilisateur est connecté) :
- Résumé de la route : nombre de stops, durée, distance
- Champ nom pré-rempli avec la date du jour (format fr-BE : `JJ/MM/AAAA`)
- Boutons "Sauvegarder" (bleu) / "Non merci" (gris), Escape ferme
- Appelle `saveRoute()` → `POST /routes` → feedback immédiat

#### Frontend — `SideMenu.tsx` — panneau Saved Routes (3 août)
Panneau accordéon (comme Profile) dans la section Library :
- Si non connecté : message + boutons Login/Register
- Si connecté : liste des routes sauvegardées depuis `GET /routes`
- Chaque carte affiche :
  - **Nom** + **date de création** (format DD/MM/YYYY fr-BE)
  - **Liste ordonnée des adresses** avec numéros cerclés bleus (ordre optimisé)
  - **Durée** (`1h 23min`) et **distance** (`12.3 km`) avec icônes
  - **Bouton poubelle** → `DELETE /routes/{id}` + suppression optimistic du state
- Helpers de formatage ajoutés : `formatDuration()`, `formatDistance()`, `formatDate()`

#### Frontend — `globals.css` — `.auth-modal-shell` (3 août)
Classe CSS partagée par toutes les modales auth :
- Dark : fond translucide avec `backdrop-filter: blur`
- Light : fond blanc 84% opacité, bordure sombre, ombre douce

#### `page.tsx` — câblage SaveRouteDialog (3 août)
- `handleStopTrip` : si `hasAuthToken()` → affiche `<SaveRouteDialog>`, sinon `resetAfterTrip()`
- `handleSaveRoute(name)` : appelle `saveRoute()` puis `resetAfterTrip()`
- `resetAfterTrip()` : nettoie stops + optimizeResult + showSaveDialog

#### Problèmes résolus en cours de session
| Problème | Cause | Fix |
|---|---|---|
| bcrypt 5.x + passlib 1.7.4 | `detect_wrap_bug()` interne lève C-level error | Pinned `bcrypt==4.0.1` dans `requirements.txt` |
| CORS manquant sur les 500 | `ServerErrorMiddleware` enveloppe l'app entière, hors CORS | Fix DB schema → plus de 500 |
| DB schema mismatch (`name` missing) | Table créée sans la colonne `name` | Drop + create_all via script Python |
| Pydantic 422 non parsé | `parseErrorDetail` gérait uniquement `string`, pas `array` | Ajout du cas array avec strip `"Value error, "` |
| Backend stale (routes_router absent) | `--reload` ne détecte pas les nouveaux fichiers si créés après démarrage | Kill complet des processus Python/uvicorn + restart propre |
| Port 8000 déjà occupé au restart | Terminal async précédent encore actif | `kill_terminal` + `Stop-Process` explicite |

### 🔧 Fichiers modifiés / créés

| Fichier | État | Description |
|---|---|---|
| `backend/database.py` | ♻️ implémenté | SQLAlchemy engine + SessionLocal + get_db |
| `backend/models.py` | 🆕 | ORM User + SavedRoute (cascade RGPD) |
| `backend/auth.py` | 🆕 | bcrypt (4.0.1), JWT HS256, get_current_user |
| `backend/schemas.py` | ✏️ | +UserCreate/Login/Read, AuthToken, SavedRouteCreate/Read |
| `backend/routers/auth_router.py` | 🆕 | /register, /login, /me, DELETE /me |
| `backend/routers/routes_router.py` | 🆕 | POST/GET/DELETE /routes (avec ownership) |
| `backend/main.py` | ✏️ | +auth_router, +routes_router, +create_all startup |
| `backend/requirements.txt` | ✏️ | +passlib, +python-jose, +bcrypt==4.0.1 (pin) |
| `backend/.env` | ✏️ | +JWT_SECRET, +DATABASE_URL |
| `frontend/lib/auth.ts` | 🆕 | Token JWT localStorage + appels auth API |
| `frontend/lib/api.ts` | ✏️ | +saveRoute, +getSavedRoutes, +deleteSavedRoute |
| `frontend/types/index.ts` | ✏️ | +AuthUser, +AuthTokenResponse, +SavedRouteStop, +SavedRouteItem |
| `frontend/components/AuthModal.tsx` | 🆕 | Modal Login/Register dark+light |
| `frontend/components/DeleteAccountModal.tsx` | 🆕 | Confirmation typée RGPD |
| `frontend/components/SaveRouteDialog.tsx` | 🆕 | Dialog post-trajet avec résumé route |
| `frontend/components/SideMenu.tsx` | ✏️ | +panneau Saved Routes (adresses + métriques + delete) |
| `frontend/app/page.tsx` | ✏️ | +handleStopTrip avec auth check + handleSaveRoute |
| `frontend/app/globals.css` | ✏️ | +.auth-modal-shell dark/light |

### 📝 Décisions / écarts par rapport au plan S6

- **Pas de pages `/login` + `/register` séparées** → remplacées par `AuthModal` intégrée dans le SideMenu (meilleure UX, flux contextuel)
- **Pas de hook `useAuth()`** → état auth géré directement dans `SideMenu` et `page.tsx` (complexité non justifiée à ce stade)
- **`routes_router.py` fait en S6** (prévu S7) → avance sur le planning
- **Pas de page `/saved` dédiée** → panneau dans le SideMenu drawer (UX cohérente, évite une navigation supplémentaire)
- **Alembic reporté à S7** → `create_all()` suffisant pour le dev local

### ▶️ Transition S7

- S6 dev clôturée : auth E2E + saved routes complets, backend `/routes` vérifié en production locale.
- Prochaine cible : Alembic migrations, déploiement Vercel + Render + Supabase, PWA manifest.

---
