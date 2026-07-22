# Plan détaillé TFE — Route App

**Date du jour** : 7 juillet 2026 (mardi)
**Date de rendu** : 1ᵉʳ septembre 2026 (mardi) — **inchangée**
**Temps disponible** : 56 jours / 8 semaines (réduit d'1 semaine à cause du retard initial)
**Soutenance** : à confirmer (généralement 2-3 semaines après le rendu)

> ⚠️ **Compression** : le calendrier initial faisait 9 semaines. Avec le décalage du 30 juin au 7 juillet, il ne reste que 8 semaines. La semaine finale (S8) fusionne l'ancienne "S8 polish" et l'ancienne "S9 relecture/soutenance". Elle sera crunchy — prévoir 7 jours pleins.

---

## 📌 Table des matières

1. [Vision et stratégie globale](#1-vision-et-stratégie-globale)
2. [Scope définitif — ce qui est dedans / dehors](#2-scope-définitif)
3. [Architecture cible finale](#3-architecture-cible-finale)
4. [Stack technique récapitulative](#4-stack-technique-récapitulative)
5. [Roadmap semaine par semaine](#5-roadmap-semaine-par-semaine)
6. [Détails techniques par phase de dev](#6-détails-techniques-par-phase-de-dev)
7. [Plan détaillé du document écrit](#7-plan-détaillé-du-document-écrit)
8. [Décisions clés à figer maintenant](#8-décisions-clés-à-figer-maintenant)
9. [Risques et plans B](#9-risques-et-plans-b)
10. [Checklist soutenance](#10-checklist-soutenance)
11. [Ressources et outils](#11-ressources-et-outils)

---

## 1. Vision et stratégie globale

### Méthode adoptée : **développement et rédaction en parallèle**
- L'écrit **ne se fait pas après** le code (piège classique → panique en fin de TFE)
- Chaque semaine = X jours de code + Y jours d'écrit, avec des livrables précis
- Les chapitres "contexte / état de l'art / besoins / choix techno" se rédigent **tôt** (peu/pas de code requis)
- Les chapitres "implémentation / tests / résultats" se rédigent **au fil de l'eau** pendant que le code avance

### Principe : **MVP solide + perspectives futures**
- Mieux vaut **5 features qui marchent parfaitement** que 10 bancales
- Tout ce qui n'est pas dans le scope final = mentionné dans le chapitre "Limites & perspectives" → valorisé par le jury

### Charge de travail estimée
| Volet | Estimation |
|---|---|
| Code (dev + tests + déploiement + a11y + RGPD) | ~34-40 jours de travail |
| Écrit (rédaction + diagrammes + relectures + slides) | ~22-28 jours de travail |
| **Total** | ~56-68 jours |

Sur 56 jours calendaires → **rythme très soutenu**, demande 6-7 jours/semaine. Marge quasi-nulle pour les imprévus → **le Plan B (section 9) peut devenir nécessaire**. Discipline écrit non-négociable : 1-2 jours d'écrit par semaine minimum.

---

## 2. Scope définitif

### ✅ Inclus dans le MVP (rendu 1ᵉʳ septembre)

| Feature | Pourquoi | Effort |
|---|---|---|
| **Carte Google Maps interactive** | Cœur visuel de l'app | 2 jours |
| **Autocomplete d'adresses (Places API)** | UX indispensable | 1-2 jours |
| **Backend FastAPI structuré** | Logique métier propre | 2 jours |
| **Optimisation TSP avec OR-Tools** | Cœur intellectuel du TFE | 3-4 jours |
| **Calcul de matrice de distances (Routes API)** | Données réelles pour l'algo | 1-2 jours |
| **Affichage polyline du trajet optimisé** | Démonstration visuelle | 2 jours |
| **Mode « trajet en cours »** (trip mode + deep-link Google Maps / Waze) | Suivi de tournée arrêt par arrêt, avec navigation externe au choix (analogie Uber/Bolt) | 1-1.5 jour |
| **Authentification (email/password)** | Sauvegarder les routes par utilisateur | 4-5 jours |
| **Base de données PostgreSQL** | Persistance des comptes + routes | 2 jours |
| **Sauvegarde / chargement de trajets** | Valeur réelle pour l'utilisateur | 2-3 jours |
| **Historique (Recents)** | Lien naturel avec le save | 1 jour |
| **PWA installable + manifest** | App utilisable comme appli native | 2 jours |
| **Service Worker (offline shell)** | Carte non-offline mais UI dispo | 1-2 jours |
| **Loading states + error handling** | Polish indispensable | 2-3 jours |
| **Dark/Light mode** ✅ déjà fait | — | — |
| **UI léchée (liquid glass)** ✅ déjà fait | — | — |
| **Déploiement en ligne (Vercel + Render + Supabase)** | **Critère obligatoire** : démo accessible via URL pendant la soutenance, à dérisquer tôt | 3-4 jours répartis sur S6 → S8 |
| **Conformité RGPD minimale** | App belge avec auth + emails + données GPS = obligation légale, attendu par le jury | 1 jour (UI + endpoint DELETE /me) |
| **Rate limiting + validation des inputs** | Protéger les crédits Google et le backend Render contre l'abus | 0.5 jour |
| **Health check + observabilité basique** | Endpoint `/health` requis par Render + logs structurés pour le debug en prod | 0.5 jour |
| **Accessibilité de base (WCAG AA)** | Navigation clavier, ARIA, contraste, focus visibles — critère de qualité jury | 1-2 jours |
| **Tests automatisés backend (pytest)** | Au moins 10 tests sur optimizer + auth + routes | 1-2 jours |

### ❌ Mis dans le "parking lot" → mention en perspectives futures

| Feature non-prioritaire | Justification dans l'écrit |
|---|---|
| Plusieurs stratégies (rapide / court / écologique) | "Extension naturelle : ajouter un paramètre `strategy` au endpoint" |
| Drag-to-reorder manuel | "Possibilité d'override utilisateur en cas de contraintes métier" |
| Export GPX / PDF | "Intégration avec des apps de navigation tierces" |
| OAuth (Google, Apple) | "Simplification du flow d'inscription" |
| Notifications push | "Alertes en temps réel sur les trajets" |
| Mode collaboratif | "Partage de trajets entre équipes" |
| Optimisation multi-véhicules (VRP) | "Passage du TSP au VRP pour flottes" |
| Suggestions de POI le long du trajet | "Intégration Places pour stations-service, restos" |
| Statistiques (CO₂, gain de temps) | "Tableau de bord analytique" |

**Règle d'or** : si pendant le dev tu es en avance, tu prends UNE feature du parking lot. Pas plus.

---

## 3. Architecture cible finale

```
tfe-route-app/
│
├── README.md                          # ✏️ refait propre (badges, captures, install, lien démo)
├── LICENSE                            # 🆕 MIT (code public sur GitHub)
├── .env.example                       # 🆕 documentation des variables d'env attendues
├── DEPLOY.md                          # 🆕 procédure de déploiement résumée (cf. Phase 5)
│
├── docs/                              # 🆕 tout l'écrit du TFE
│   ├── PLAN-TFE.md                    # ← ce fichier
│   ├── redaction/
│   │   ├── chap-01-introduction.md
│   │   ├── chap-02-contexte.md
│   │   ├── chap-03-etat-de-lart.md
│   │   ├── chap-04-analyse-besoins.md
│   │   ├── chap-05-choix-techno.md
│   │   ├── chap-06-architecture.md
│   │   ├── chap-07-implementation.md
│   │   ├── chap-08-tests-resultats.md
│   │   └── chap-09-conclusion.md
│   ├── decisions/                     # ADR (Architecture Decision Records)
│   │   ├── 001-google-maps.md
│   │   ├── 002-fastapi.md
│   │   ├── 003-ortools.md
│   │   └── ...
│   └── final/
│       └── TFE-final.pdf              # version compilée pour rendu
│
├── diagrams/                          # ✅ existe déjà
│   ├── class.puml
│   ├── sequence-optimize.puml         # 🆕 à dessiner
│   ├── erd.puml                       # 🆕 schéma de la base
│   └── architecture.puml              # 🆕 vue globale
│
├── frontend/                          # Next.js 16
│   ├── .env.local                     # 🆕 clé Google Maps publique + URL backend
│   ├── public/
│   │   ├── manifest.webmanifest       # 🆕 PWA manifest
│   │   ├── icon-192.png               # 🆕 icônes PWA
│   │   ├── icon-512.png
│   │   └── sw.js                      # 🆕 service worker (si pas généré par Next)
│   ├── app/
│   │   ├── layout.tsx                 # ✏️ ajout du manifest
│   │   ├── page.tsx                   # ✏️ appel API backend
│   │   ├── login/page.tsx             # 🆕 page de connexion
│   │   ├── register/page.tsx          # 🆕 page d'inscription
│   │   ├── saved/page.tsx             # 🆕 liste des trajets sauvegardés
│   │   └── privacy/page.tsx           # 🆕 politique de confidentialité (RGPD)
│   ├── components/                    # ✅ existants : SideMenu, BottomPanel, etc.
│   │   ├── MapContainer.tsx           # ✏️ Google Maps à la place du pointillé
│   │   ├── AddStopInput.tsx           # ✏️ autocomplete Places
│   │   ├── RouteOverlay.tsx           # 🆕 polyline + markers
│   │   ├── TripMode.tsx               # 🆕 mode « trajet en cours » (suivi arrêt par arrêt + boutons deep-link)
│   │   ├── SaveRouteDialog.tsx        # 🆕 dialogue pour nommer un trajet
│   │   ├── AuthForm.tsx               # 🆕 formulaire login/register
│   │   └── InstallPrompt.tsx          # 🆕 bouton "Installer l'app"
│   ├── lib/
│   │   ├── api.ts                     # 🆕 fonctions fetch vers backend
│   │   ├── auth.ts                    # 🆕 gestion du token JWT
│   │   ├── google-maps.ts             # 🆕 helpers Google Maps
│   │   └── deep-links.ts              # 🆕 constructeurs d'URL Google Maps / Waze (trip mode)
│   ├── hooks/
│   │   ├── useAuth.ts                 # 🆕 hook user courant
│   │   └── useInstallPrompt.ts        # 🆕 hook beforeinstallprompt
│   ├── types/index.ts                 # ✏️ Stop avec lat/lng, User, Route
│   └── next.config.ts                 # ✅ déjà configuré
│
└── backend/                           # FastAPI
    ├── .env                           # 🆕 clé Google, secret JWT, DB URL
    ├── main.py                        # ✏️ refactor : juste les routes
    ├── config.py                      # 🆕 chargement settings
    ├── database.py                    # 🆕 connexion SQLAlchemy
    ├── models.py                      # 🆕 modèles ORM (User, Route)
    ├── schemas.py                     # 🆕 schémas Pydantic API
    ├── auth.py                        # 🆕 JWT, hashing, dépendances
    ├── routers/
    │   ├── __init__.py
    │   ├── auth_router.py             # 🆕 /register, /login, GET /me, DELETE /me (RGPD)
    │   ├── routes_router.py           # 🆕 /routes (CRUD trajets sauvés)
    │   ├── optimize_router.py         # 🆕 /optimize (rate-limited, max 15 stops)
    │   └── health_router.py           # 🆕 /health (status pour Render + wake-up frontend)
    ├── services/
    │   ├── google_maps.py             # 🆕 wrapper Routes API
    │   └── optimizer.py               # 🆕 TSP avec OR-Tools
    ├── tests/                         # 🆕 pytest
    │   ├── conftest.py                # 🆕 fixtures (test client, mock Google)
    │   ├── test_optimizer.py          # 🆕 tests OR-Tools
    │   ├── test_auth.py               # 🆕 tests register/login/me
    │   ├── test_routes.py             # 🆕 tests CRUD trajets
    │   └── test_optimize_endpoint.py  # 🆕 tests endpoint + rate limit + max stops
    ├── alembic/                       # 🆕 migrations DB
    │   └── versions/
    ├── alembic.ini                    # 🆕
    └── requirements.txt               # ✏️ + ortools, httpx, sqlalchemy,
                                       #     psycopg2, alembic, passlib,
                                       #     python-jose, python-dotenv,
                                       #     slowapi, pytest, pytest-asyncio, respx
```

### Légende
- ✅ **déjà existant et OK** : ne pas toucher
- ✏️ **à modifier** : déjà présent mais sera modifié
- 🆕 **à créer** : nouveau fichier

---

## 4. Stack technique récapitulative

### Frontend
| Outil | Version | Rôle |
|---|---|---|
| Next.js | 16.2.1 | Framework React, SSR, App Router |
| React | 19.2.4 | UI déclarative |
| TypeScript | 5 | Typage statique |
| Tailwind CSS | 4 | Styles utilitaires |
| `@vis.gl/react-google-maps` | latest | Composants Google Maps officiels |
| Service Worker (Next.js PWA) | — | Cache offline du shell |

### Backend
| Outil | Version | Rôle |
|---|---|---|
| Python | 3.11+ | Langage |
| FastAPI | latest | Framework web async |
| Uvicorn | latest | Serveur ASGI |
| SQLAlchemy | 2.x | ORM Python |
| Alembic | latest | Migrations DB |
| Pydantic | 2.x | Validation des données |
| `passlib[bcrypt]` | latest | Hashing des mots de passe |
| `python-jose[cryptography]` | latest | JWT |
| OR-Tools | latest | Solveur d'optimisation (Google) |
| `httpx` | latest | Client HTTP async pour Google APIs |
| `python-dotenv` | latest | Chargement `.env` |
| `slowapi` | latest | Rate limiting (anti-abus crédits Google) |
| `pytest` + `pytest-asyncio` + `respx` | latest | Tests backend (unitaires + intégration, mock httpx) |
| `logging` (stdlib) | — | Logs structurés en prod (visibles dans Render dashboard) |

### Base de données
- **PostgreSQL 16+** en local (Docker recommandé pour simplicité)
- Schéma à créer dans `models.py` :
  - `users` : id, email, password_hash, created_at
  - `routes` : id, user_id, name, stops_json, optimized_order_json, created_at

### APIs externes (Google Cloud)
| API | Usage |
|---|---|
| Maps JavaScript API | Afficher la carte |
| Places API (New) | Autocomplete d'adresses |
| Geocoding API | Backup texte → coordonnées si besoin |
| Routes API | Matrice de distances + polylines |

### Déploiement (à choisir en S7-S8)
| Composant | Hébergeur recommandé | Coût |
|---|---|---|
| Frontend | **Vercel** (gratuit pour Next.js) | 0 € |
| Backend | **Render** ou **Railway** (free tier) | 0 € |
| PostgreSQL | **Supabase** ou **Neon** (gratuit) | 0 € |

---

## 5. Roadmap semaine par semaine

> Chaque semaine : objectifs, livrables, checkboxes.

---

### 🔥 SEMAINE 1 — 7 → 13 juillet 2026
**Thème : Fondations écrit + intégration carte**

#### Écrit
- [ ] Créer la structure de dossiers `docs/redaction/` et `docs/decisions/`
- [ ] Définir le **plan détaillé** du document (table des matières précise, ce fichier l'a déjà)
- [ ] Rédiger **Chapitre 1 — Introduction** (~3-4 pages)
  - Présentation perso, motivation, sujet, structure du document
- [ ] Démarrer **Chapitre 2 — Contexte & problématique** (~5 pages)
  - Problème : pourquoi optimiser une tournée multi-stops est crucial
  - Cible : livreurs, commerciaux, ambulanciers, particuliers
  - Stats : chercher données sur le temps perdu en tournées non-optimisées

#### Dev
- [ ] Créer le compte Google Cloud + projet
- [ ] Activer Maps JavaScript API + Places API
- [ ] Générer une clé API, la restreindre à `http://localhost:3000/*`
- [ ] Mettre alerte de budget à 5 €
- [ ] Mettre quota dur (par ex. 500 chargements/jour pendant le dev)
- [ ] Créer `frontend/.env.local` avec `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...`
- [ ] Installer `@vis.gl/react-google-maps` dans le frontend
- [ ] **Phase 1** : remplacer le fond pointillé par Google Maps dans `MapContainer.tsx`
- [ ] Centrer la carte sur Bruxelles, zoom 12, contrôles minimaux

#### Livrable fin S1
- ✅ Document : 8-10 pages écrites (Intro + début Contexte)
- ✅ App : vraie carte Google Maps en fond, app fonctionnelle

---

### 🔥 SEMAINE 2 — 14 → 20 juillet 2026
**Thème : Autocomplete + état de l'art**

#### Écrit
- [ ] Terminer **Chapitre 2 — Contexte & problématique**
- [ ] Rédiger **Chapitre 3 — État de l'art** (~7-8 pages)
  - Analyse de 4-5 concurrents : **Circuit**, **Routific**, **Google Maps multi-stops**, **Waze**, **RoadWarrior**
  - Tableau comparatif (fonctionnalités, prix, public cible)
  - Identifier le gap que ton app comble
http://127.0.0.1:3000/*
http://localhost:3000/*
#### Dev
- [ ] **Phase 2** : autocomplete dans `AddStopInput.tsx`
  - Utiliser le composant `<PlaceAutocomplete>` de la lib
  - Au select : récupérer `address`, `lat`, `lng`, `placeId`
- [ ] Modifier `types/index.ts` : `Stop` gagne `lat`, `lng`, `placeId`
- [ ] Modifier `handleAddStop` dans `page.tsx`
- [ ] Afficher des **markers** sur la carte pour chaque stop ajouté
- [ ] Tester avec 5 vraies adresses bruxelloises

#### Livrable fin S2
- ✅ Document : ~20 pages écrites
- ✅ App : autocomplete fonctionnel, markers sur la carte

---

### 🔥 SEMAINE 3 — 21 → 27 juillet 2026
**Thème : Refactor backend + analyse des besoins**

#### Écrit
- [ ] Rédiger **Chapitre 4 — Analyse des besoins** (~6 pages)
  - **Personas** : créer 3 personas détaillés
    - Persona 1 : Marc, livreur indépendant
    - Persona 2 : Sophie, commerciale terrain
    - Persona 3 : Étudiant, livreur Deliveroo
  - **User stories** : 10-15 stories au format "En tant que X, je veux Y, afin de Z"
  - **Cas d'usage** principaux (avec diagramme use case PlantUML)
  - **Fonctionnalités MVP vs Nice-to-have** (le scope que tu as défini)

#### Dev
- [ ] **Phase 3a** : refactor backend (toujours 1 endpoint, juste mieux organisé)
  - Créer `config.py` (chargement `.env`)
  - Créer `database.py` (placeholder, vraie DB en S4)
  - Créer `schemas.py` (Pydantic : `StopIn` avec validation lat/lng, `OptimizeRequest` avec `max_items=15` sur la liste de stops, `OptimizeResponse`, `UserCreate` avec `EmailStr` + password min 8 caractères)
  - Créer `services/google_maps.py` (squelette)
  - Créer `services/optimizer.py` (squelette)
  - Créer `routers/optimize_router.py`
  - Vider `main.py` → ne contient plus que `FastAPI()`, CORS, et inclusion des routers
- [ ] Installer dépendances : `ortools`, `httpx`, `python-dotenv`, `sqlalchemy`, `psycopg2-binary`, `alembic`
- [ ] Mettre à jour `requirements.txt`
- [ ] Tester que le backend démarre toujours

#### Livrable fin S3
- ✅ Document : ~26-28 pages écrites
- ✅ App : backend restructuré proprement, prêt à recevoir la logique métier

---

### 🔥 SEMAINE 4 — 28 juillet → 3 août 2026
**Thème : OR-Tools + choix technologiques écrits**

#### Écrit
- [ ] Rédiger **Chapitre 5 — Choix technologiques** (~8-10 pages)
  - Pour chaque choix majeur : tableau "alternatives considérées / critères / décision finale / pourquoi"
    - Framework frontend : Next.js vs Remix vs SvelteKit
    - Framework backend : FastAPI vs Express vs Django
    - Base de données : PostgreSQL vs MongoDB vs SQLite
    - Provider de cartes : Google Maps vs Mapbox vs OSM/Leaflet
    - Algo d'optimisation : OR-Tools vs algos maison (Christofides, 2-opt, génétique)
    - Auth : JWT vs sessions
    - PWA : Workbox vs manuel
  - Inclure des screenshots / extraits de doc

#### Dev
- [ ] **Phase 3b** : algorithme d'optimisation
  - Implémenter `services/google_maps.py::get_distance_matrix(stops)` qui appelle Routes API et renvoie une matrice N×N de durées en secondes
  - Implémenter `services/optimizer.py::solve_tsp(distance_matrix)` avec OR-Tools
    - Retourne l'ordre optimal des indices
  - Implémenter `routers/optimize_router.py::POST /optimize`
    - Reçoit `{ stops: [{lat, lng, address}] }`
    - Renvoie `{ optimal_order, total_duration_sec, total_distance_m, polyline_encoded }`
- [ ] Tester via **Swagger UI** (`http://localhost:8000/docs`) avec 5-8 stops
- [ ] Mesurer le temps de réponse (devrait être <2s pour 10 stops)

#### Livrable fin S4
- ✅ Document : ~36-38 pages écrites
- ✅ App : endpoint `/optimize` fonctionne, retourne du JSON correct

---

### 🔥 SEMAINE 5 — 4 → 10 août 2026
**Thème : Câblage UI ↔ backend + diagrammes**

#### Écrit
- [ ] Rédiger **Chapitre 6 — Architecture logicielle** (~10 pages)
  - Diagramme **architecture globale** (frontend ↔ backend ↔ APIs ↔ DB) — PlantUML
  - Diagramme **de classes** (User, Route, Stop) — PlantUML
  - Diagramme **ERD** (entity-relationship) de la base — PlantUML
  - Diagramme **de séquence** pour le flow `optimize` (frontend → backend → Google → solver → réponse)
  - Expliquer les choix : pourquoi REST et pas GraphQL, pourquoi monolithe et pas microservices, etc.
- [ ] Mettre les diagrammes dans `diagrams/` + intégrer dans le doc

#### Dev
- [ ] **Phase 4** : connexion frontend ↔ backend
  - Créer `frontend/lib/api.ts` avec `optimizeRoute(stops)`
  - Modifier `handleOptimize` dans `page.tsx` → appel API + loading state
  - Créer `RouteOverlay.tsx` : décode la polyline encodée et la dessine avec `<Polyline>` Google Maps
  - Réordonner visuellement la liste `StopList` selon `optimal_order`
  - Afficher temps total / distance totale dans `BottomPanel`
  - Gérer les erreurs (toast / message)
- [ ] **Phase 4bis** : mode « trajet en cours » (analogie Uber/Bolt)
  - Créer `frontend/lib/deep-links.ts` avec `buildGoogleMapsUrl(stops)` et `buildWazeUrl(nextStop)`
  - Créer `TripMode.tsx` : vue de suivi avec arrêt courant surligné, distance/temps jusqu'au prochain, boutons « J'y suis » (progresser) et « Ouvrir dans Google Maps / Waze » (deep-link)
  - State `currentStopIndex` dans `page.tsx`
  - Highlight visuel du marker courant sur la carte + zoom auto
  - **Ce qui est explicitement exclu** : GPS live du user, instructions vocales, recalcul dynamique → délégué aux apps tierces via deep-link

#### Livrable fin S5
- ✅ Document : ~46-48 pages écrites + diagrammes
- ✅ App : démo complète possible (entrer stops → optimiser → voir le résultat → lancer le trip mode → basculer vers Google Maps / Waze au besoin)

---

### 🔥 SEMAINE 6 — 11 → 17 août 2026
**Thème : Auth + base de données + début implémentation écrit**

#### Écrit
- [ ] Démarrer **Chapitre 7 — Implémentation** (~18 pages au total, étalées sur S6-S8)
  - Sous-chapitre 7.1 : Organisation du code frontend (Next.js, structure, conventions)
  - Sous-chapitre 7.2 : Organisation du code backend (FastAPI, routers/services)
  - Sous-chapitre 7.5 : Authentification (JWT, bcrypt, dépendance FastAPI) — puisque le code se fait cette semaine
  - Inclure des extraits de code commentés (pas tout, juste les bouts intéressants)

#### Dev
- [ ] Mettre en place **PostgreSQL local** :
  - Option A : installer PostgreSQL natif sur Windows
  - Option B (recommandé) : Docker `docker run --name pg-tfe -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16`
- [ ] Backend : créer `models.py` (User, SavedRoute) avec SQLAlchemy
- [ ] Configurer Alembic + créer la première migration
- [ ] Créer `auth.py` : hashing bcrypt, génération JWT, dépendance `get_current_user`
- [ ] Créer `routers/auth_router.py` :
  - `POST /register` (email + password → user créé, validation EmailStr + password ≥8 caractères avec au moins 1 chiffre)
  - `POST /login` (email + password → JWT token, durée 7 jours)
  - `GET /me` (token → infos user)
  - `DELETE /me` (suppression du compte + cascade sur les routes → **droit à l'oubli RGPD**)
- [ ] Frontend : créer pages `login/` et `register/`
- [ ] Frontend : créer `lib/auth.ts` (storage token dans localStorage, header Authorization auto, gestion du **401 → redirect vers /login**)
- [ ] Frontend : créer hook `useAuth()` pour exposer user courant
- [ ] Protéger les routes `/saved` côté frontend (redirect si pas connecté)
- [ ] Ajouter dans la page `/me` (ou un écran paramètres) un **bouton "Supprimer mon compte"** qui appelle `DELETE /me` après confirmation (RGPD)

#### 🚀 Dérisquer le déploiement (à faire en S6, pas attendre la fin)
- [ ] Créer le repo GitHub `tfe-route-app` (si pas déjà fait)
- [ ] Push tout le code actuel
- [ ] Créer un compte **Vercel** (login via GitHub)
- [ ] Connecter le repo, configurer le project root sur `frontend/`
- [ ] **Premier déploiement frontend** (sans variables d'env encore) → vérifier que le build passe
- [ ] Noter l'URL générée par Vercel (ex: `tfe-route-app.vercel.app`)

> Objectif de cette mini-tâche : **prouver que le déploiement frontend marche dès maintenant**, pas découvrir un bug de build le 28 août.

#### Livrable fin S6
- ✅ Document : ~54 pages écrites
- ✅ App : on peut s'inscrire, se connecter, voir son profil

---

### 🔥 SEMAINE 7 — 18 → 24 août 2026
**Thème : Save routes + PWA + suite implémentation**

#### Écrit
- [ ] Continuer **Chapitre 7 — Implémentation**
  - Sous-chapitre 7.3 : Intégration Google Maps (carte + autocomplete + polyline)
  - Sous-chapitre 7.4 : Algorithme d'optimisation (le morceau "thésard")
    - Modélisation TSP, formulation mathématique
    - Pourquoi OR-Tools (CP-SAT solver)
    - Code commenté de `solve_tsp()`
    - Complexité, limites, métriques de performance
  - Sous-chapitre 7.6 : Persistance (SQLAlchemy, Alembic, migrations)
  - Sous-chapitre 7.7 : PWA (manifest, service worker, install)

#### Dev
- [ ] Backend : `routers/routes_router.py` (CRUD trajets)
  - `POST /routes` (sauvegarder un trajet)
  - `GET /routes` (lister mes trajets)
  - `GET /routes/{id}` (charger un trajet)
  - `DELETE /routes/{id}` (supprimer)
- [ ] Frontend : composant `SaveRouteDialog.tsx` (modal pour nommer)
- [ ] Frontend : page `app/saved/page.tsx` (liste des trajets sauvegardés)
- [ ] Câbler le SideMenu : "Saved routes" → ouvrir la page
- [ ] Câbler "Recents" : afficher les 5 derniers trajets dans le SideMenu
- [ ] **PWA** :
  - Créer `public/manifest.webmanifest` avec icônes, couleurs, name
  - Configurer Next.js pour PWA (next-pwa ou plugin officiel)
  - Tester l'installation (Chrome → "Installer l'app")
  - Créer composant `InstallPrompt.tsx` (gère `beforeinstallprompt`)
  - Câbler le bouton "Get the app" du SideMenu pour déclencher l'install

#### 🚀 Dérisquer le déploiement backend + DB
- [ ] Créer un compte **Supabase** (ou **Neon**) → projet PostgreSQL gratuit
- [ ] Récupérer la `DATABASE_URL` de prod
- [ ] Lancer les migrations Alembic sur la DB de prod (depuis ton poste : `alembic upgrade head` avec la `DATABASE_URL` de prod)
- [ ] Créer un compte **Render** (ou **Railway**) → connecter au repo GitHub
- [ ] Configurer le service backend : root `backend/`, build `pip install -r requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Variables d'env Render : `DATABASE_URL`, `GOOGLE_MAPS_API_KEY`, `JWT_SECRET`, `FRONTEND_ORIGIN`
- [ ] **Premier déploiement backend** → tester `https://...onrender.com/docs` (Swagger doit être accessible)
- [ ] Mettre à jour la **CORS** de FastAPI pour autoriser l'URL Vercel
- [ ] Mettre à jour `NEXT_PUBLIC_API_URL` sur Vercel pour pointer vers Render
- [ ] Tester le flow `register` → `login` → `optimize` en prod

> Objectif : **toute la stack tourne en prod en S7**. Il reste juste à polish en S8, pas à déployer pour la première fois sous stress.

#### Livrable fin S7
- ✅ Document : ~64 pages écrites
- ✅ App : feature-complete (auth + save + PWA + tout le reste)

---

### 🔥 SEMAINE 8 — 25 août → 1ᵉʳ septembre 2026 (SPRINT FINAL)
**Thème : Tests, polish, finalisation écrit, soutenance, RENDU**

> ⚠️ Cette semaine fusionne l'ancienne S8 (tests/polish/déploiement) et l'ancienne S9 (relecture/rendu/soutenance) puisque le calendrier est compressé d'1 semaine. **7 jours pleins + rendu le mardi 1er septembre.** Suivre le plan **jour par jour** ci-dessous. Interdiction de rajouter des features à ce stade — **gel des nouvelles fonctionnalités**.

#### 📅 Découpage jour par jour

**Mardi 25 août — Fin du code (dev-only)**
- [ ] **Tests automatisés backend** (`backend/tests/`) : écrire les 13 tests
  - `test_optimizer.py` : 3-4 tests OR-Tools (5 stops ordre correct, 1 stop, matrice asymétrique, perf <2s à 15 stops)
  - `test_auth.py` : 4 tests (register OK, email pris, login OK, /me sans token = 401)
  - `test_routes.py` : 3 tests CRUD (create, list, delete, isolation entre users)
  - `test_optimize_endpoint.py` : 3 tests (max 15 stops, rate limit, format de réponse)
  - Mock Google avec `respx` — jamais d'appel réel
- [ ] **Astuce cold start Render** : `fetch('/health')` au mount de la home
- [ ] Lancer `pytest` en local, tous verts

**Mercredi 26 août — Polish UX + a11y + tests utilisateurs**
- [ ] **Polish UX** : loading skeletons, toasts (sonner), empty states, offline shell, responsive mobile
- [ ] **Accessibilité (a11y)** — audit + corrections :
  - Navigation clavier complète (Tab, Enter, Esc)
  - `aria-label` sur boutons icon-only (SideMenu, BottomPanel)
  - Contraste Lighthouse ≥90 (AA)
  - Focus rings visibles (`focus-visible:ring-2`)
  - Test rapide avec NVDA
- [ ] **Tests utilisateurs + Score SUS** : faire tester par 3 personnes, questionnaire SUS 10 questions, noter les résultats

**Jeudi 27 août — RGPD + Chapitre 8 (Tests & Résultats)**
- [ ] **Conformité RGPD** :
  - Vérifier `DELETE /me` fonctionne + cascade routes
  - Créer page `app/privacy/page.tsx` (1 page : données stockées, droits, contact)
  - Lien "Politique de confidentialité" dans le footer SideMenu
  - Revue des logs → aucune donnée sensible ne fuite
- [ ] Rédiger **Chapitre 8 — Tests & Résultats** (~8 pages)
  - Méthodologie, tests manuels + pytest, graphique performance (5/8/10/12/15 stops)
  - Score SUS + interprétation
  - Retours qualitatifs des 3 testeurs

**Vendredi 28 août — Finalisation déploiement + Chapitre 9 (Conclusion)**
- [ ] **Finalisation du déploiement** :
  - Restreindre clé Google prod au domaine Vercel (`https://tfe-route-app.vercel.app/*`)
  - Vérifier variables d'env Vercel + Render à jour
  - HTTPS OK, logs Render clean
  - Test flow complet en **navigation privée** + sur **mobile 4G**
  - PWA installable depuis l'URL de prod
  - Créer **compte démo** avec 2-3 trajets pré-chargés
  - Enregistrer **screencast backup** (1-2 min)
- [ ] Rédiger **Chapitre 9 — Conclusion** (~5 pages) : bilan objectifs, limites, perspectives (parking lot), bilan personnel
- [ ] Rédiger les 6 sous-chapitres restants du **Chapitre 7** (7.8 → 7.13) si pas déjà fait en S7

**Samedi 29 août — Relecture doc + biblio + hygiène repo**
- [ ] **Relecture doc** — 1ʳᵉ passe (fond : cohérence, arguments, transitions)
- [ ] Rédiger la **bibliographie** (≥15 sources : Google Maps doc, OR-Tools tuto, Next.js doc, FastAPI doc, papers TSP, etc.)
- [ ] Rédiger **abstract FR + EN** (~1 page chacun)
- [ ] Créer **README.md** propre à la racine (badges, captures, install, live demo)
- [ ] Créer **LICENSE** MIT
- [ ] Créer **.env.example** dans `frontend/` et `backend/`
- [ ] Créer **DEPLOY.md** (résumé procédure)
- [ ] Push GitHub avec commit `docs: prep for TFE submission`

**Dimanche 30 août — Slides + captures + glossaire**
- [ ] **Slides** (~15-20 slides) : titre, problème, solution, démo live (5-7 min), archi, algo TSP, résultats, limites+perspectives, conclusion
- [ ] Préparer **4-5 captures pro** (Cleanshot / shots.so / mockup device frames)
- [ ] Intégrer les captures dans le doc + slides
- [ ] Rédiger le **Glossaire** en annexe (TSP, VRP, PWA, JWT, CP-SAT, polyline, ORM, Alembic, CORS…)
- [ ] Ajouter la **table des matières**, liste des figures, liste des tableaux
- [ ] Vérifier numérotation des figures et références croisées

**Lundi 31 août — Relecture finale + répétition + PDF**
- [ ] **Relecture doc** — 2ᵉ passe (forme : orthographe, typo, mise en page)
- [ ] **Faire relire par quelqu'un** (parent, ami, prof) → corrections
- [ ] **Relecture doc** — 3ᵉ passe (finale, sur PDF imprimé si possible)
- [ ] Mise en forme finale (police, marges, en-têtes, pagination)
- [ ] Générer le **PDF final**
- [ ] **Répétition soutenance à blanc** : 2 fois chronométrées (15 min pile, parle lentement)
- [ ] Préparer les réponses écrites aux **10 questions Q&A** de la section 10
- [ ] Sauvegarde du PDF : Google Drive + clé USB + email à toi-même

**Mardi 1ᵉʳ septembre — RENDU** 🎯
- [ ] Vérifier une dernière fois : PDF, lien démo actif, compte démo fonctionnel
- [ ] **Wake-up backend** : ouvrir `/health` pour sortir Render du sleep
- [ ] **Soumettre le PDF** via la plateforme de l'école
- [ ] Push final du code + tag `git tag v1.0.0-tfe && git push --tags`
- [ ] Confirmation de réception du rendu ✅
- [ ] 🍾 Souffler.

#### Livrable fin S8 / Rendu
- ✅ **PDF du TFE rendu le 1ᵉʳ septembre**
- ✅ Code sur GitHub avec tag `v1.0.0-tfe`
- ✅ App en ligne, démo accessible, compte démo prêt
- ✅ Slides prêts, répétitions faites, Q&A anticipées

---

## 6. Détails techniques par phase de dev

### 📍 Phase 1 — Carte Google Maps
**Concepts à comprendre** :
- Composant `<APIProvider>` qui injecte la clé partout
- Composant `<Map>` qui affiche le canvas Google
- Différence map type (roadmap, satellite, hybrid)
- Style de carte custom (optionnel : Snazzy Maps pour un thème dark)

**Code clé** (`MapContainer.tsx`) :
```tsx
<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
  <Map
    defaultCenter={{ lat: 50.8503, lng: 4.3517 }}  // Bruxelles
    defaultZoom={12}
    mapId="..." // pour les styles avancés
    disableDefaultUI
    gestureHandling="greedy"
  />
</APIProvider>
```

---

### 📍 Phase 2 — Autocomplete Places
**Concepts à comprendre** :
- Sessions de billing Places (regrouper les keystrokes en 1 session)
- Différence Place ID vs adresse formatée
- Bias géographique (limiter aux résultats proches de Bruxelles)

---

### 📍 Phase 3 — Backend OR-Tools

**Concepts à comprendre** :
- TSP (Traveling Salesman Problem) : NP-hard, mais OR-Tools le résout très vite jusqu'à ~100 stops
- Matrice de distances asymétrique (A→B ≠ B→A à cause des sens uniques)
- CP-SAT solver de OR-Tools : approche par programmation par contraintes

**Architecture d'appel** :
```python
@router.post("/optimize")
async def optimize(req: OptimizeRequest):
    # 1. Récupère matrice de durées via Google Routes API
    matrix = await google_maps.get_duration_matrix(req.stops)

    # 2. Résout le TSP
    optimal_order = optimizer.solve_tsp(matrix)

    # 3. Récupère la polyline pour le tracé exact
    polyline = await google_maps.get_route_polyline(
        [req.stops[i] for i in optimal_order]
    )

    # 4. Retourne tout
    return OptimizeResponse(
        optimal_order=optimal_order,
        total_duration_sec=...,
        total_distance_m=...,
        polyline_encoded=polyline
    )
```

---

### 📍 Phase 4 — Câblage frontend

**Pattern de loading + erreur** :
```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [route, setRoute] = useState<OptimizeResponse | null>(null);

async function handleOptimize() {
  setLoading(true);
  setError(null);
  try {
    const res = await api.optimizeRoute(stops);
    setRoute(res);
  } catch (e) {
    setError("Erreur lors de l'optimisation. Réessaie.");
  } finally {
    setLoading(false);
  }
}
```

**Deep-links vers apps tierces** (`lib/deep-links.ts`, pour le trip mode) :
```ts
// Google Maps : supporte origin + destination + waypoints
export function buildGoogleMapsUrl(stops: Stop[]): string {
  const [origin, ...rest] = stops;
  const destination = rest.pop()!;
  const waypoints = rest.map(s => `${s.lat},${s.lng}`).join("|");
  const params = new URLSearchParams({
    api: "1",
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: "driving",
  });
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${params}`;
}

// Waze : un seul destination à la fois → on envoie le PROCHAIN arrêt
export function buildWazeUrl(nextStop: Stop): string {
  return `https://waze.com/ul?ll=${nextStop.lat},${nextStop.lng}&navigate=yes`;
}
```

---

### 📍 Auth + PostgreSQL

**Schéma DB minimal** :
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE saved_routes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  stops JSONB NOT NULL,         -- liste des stops avec lat/lng
  optimized_order INTEGER[] NOT NULL,
  total_duration_sec INTEGER,
  total_distance_m INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Flow JWT** :
1. User register → password hashé via bcrypt → stocké en DB
2. User login → vérif password → JWT signé avec secret
3. Frontend stocke JWT en localStorage
4. Chaque requête API ajoute `Authorization: Bearer <token>`
5. Backend décode JWT → récupère user_id → autorise/refuse

---

### 📍 PWA

**Fichiers à créer / configurer** :
- `public/manifest.webmanifest` : nom, icônes, theme_color, display="standalone"
- `next.config.ts` : ajouter PWA via `@ducanh2912/next-pwa` ou config manuelle
- Service Worker généré automatiquement par le plugin
- Composant `InstallPrompt.tsx` qui écoute `beforeinstallprompt` et expose un bouton

**Limite assumée dans l'écrit** : "L'app reste fonctionnelle offline pour le shell UI, mais l'optimisation requiert une connexion (API Google + backend)."

---

### 📍 Phase 5 — Déploiement en production

**Pourquoi le déploiement est critique pour ton TFE** :
- Le jury veut **voir l'app en ligne** (URL cliquable dans le doc et pendant la soutenance)
- Le déploiement est un **chapitre technique** du document (architecture prod, CI/CD, sécurité)
- C'est aussi le moment où tu découvres des bugs cachés (env vars, CORS, paths absolus, etc.)

**Architecture cible en production** :
```
                    https://tfe-route-app.vercel.app
                              (Next.js)
                                  │
                                  │ HTTPS + JWT
                                  ▼
                  https://tfe-route-app-api.onrender.com
                              (FastAPI)
                                  │
                ┌─────────────────┼─────────────────┐
                ▼                 ▼                 ▼
         PostgreSQL          Google APIs        OR-Tools
         (Supabase)        (Maps/Routes)        (in-memory)
```

**Plateformes choisies et pourquoi** :

| Composant | Plateforme | Tier gratuit | Pourquoi |
|---|---|---|---|
| Frontend Next.js | **Vercel** | Illimité pour les hobby projects | Créateurs de Next.js, déploiement parfait en 1 clic, HTTPS auto, preview deploys par branche |
| Backend FastAPI | **Render** (alt: Railway, Fly.io) | 750h/mois gratuit, se met en veille après 15 min d'inactivité | Simple, support natif Python, logs accessibles |
| Base PostgreSQL | **Supabase** (alt: Neon) | 500 MB + 2 GB de transfert/mois | Gratuit, dashboard SQL, backups, peut servir d'auth aussi |

**Points d'attention spécifiques au déploiement** :

1. **CORS sur le backend** : FastAPI doit autoriser ton domaine Vercel
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **Variables d'env, jamais en dur** :
   - Frontend (Vercel) : `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_API_URL`
   - Backend (Render) : `DATABASE_URL`, `GOOGLE_MAPS_API_KEY`, `JWT_SECRET`, `FRONTEND_ORIGIN`

3. **Clé Google Maps frontend** : restreindre à 2 referrers
   - `http://localhost:3000/*` (dev)
   - `https://tfe-route-app.vercel.app/*` (prod)

4. **Clé Google Maps backend** : créer une **2ᵉ clé séparée**, restreindre par IP au serveur Render (ou laisser sans restriction si Render n'a pas d'IP fixe → moins sécurisé mais OK pour TFE)

5. **Cold start Render** : le free tier s'endort après 15 min d'inactivité. **Le premier appel après inactivité prend ~30 secondes.**
   → **Solution** : juste avant la soutenance, faire un appel à l'API pour la réveiller. Documenter cette limite dans le chapitre Tests/Résultats.

6. **Migrations DB en prod** : avant le premier déploiement backend, lancer `alembic upgrade head` depuis ton poste avec la `DATABASE_URL` de prod. Documenter dans un fichier `DEPLOY.md`.

7. **Logging / observabilité** :
   - Backend : utiliser le `logging` standard Python aux points clés (login OK/KO, optimize lancé avec N stops, appels Google API, erreurs)
   - Format : `%(asctime)s [%(levelname)s] %(name)s: %(message)s` — lisible dans le dashboard Render
   - **Ne JAMAIS logger** : mots de passe, JWT tokens, contenu complet des requêtes utilisateur (RGPD)
   - Pour aller plus loin : **Sentry** (gratuit jusqu'à 5k events/mois) → à mentionner en perspective future dans l'écrit

8. **Conformité RGPD en prod** :
   - La page `/privacy` doit être accessible publiquement (pas derrière le login)
   - Le bouton "Supprimer mon compte" doit fonctionner end-to-end en prod (test obligatoire avec un compte jetable)
   - Documenter dans le doc TFE : quelles données sont stockées, où, combien de temps, qui y a accès

**Procédure de déploiement (à exécuter en S6-S7)** :

#### Étape A — Préparer le repo (S6, 30 min)
```bash
# 1. Vérifier que tout est commit
git status
git add . && git commit -m "chore: prep for deployment"

# 2. Push sur GitHub
git push origin main
```

#### Étape B — Frontend sur Vercel (S6, 20 min)
1. https://vercel.com → login GitHub
2. "Add New Project" → sélectionner le repo `tfe-route-app`
3. **Root Directory** : `frontend/`
4. Framework : Next.js (auto-détecté)
5. Variables d'env :
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = ta clé
   - `NEXT_PUBLIC_API_URL` = `https://tfe-route-app-api.onrender.com` (à ajouter quand le backend est up)
6. Deploy → noter l'URL

#### Étape C — DB sur Supabase (S7, 15 min)
1. https://supabase.com → New project
2. Name : `tfe-route-app` / region : Frankfurt
3. Mot de passe DB : générer un fort et le garder
4. Récupérer la **Connection string** (Settings → Database → Connection string → URI)
5. La garder sous le coude (sera ton `DATABASE_URL`)

#### Étape D — Lancer les migrations (S7, 5 min)
```powershell
# Depuis ton poste, vers la DB de prod
cd backend
$env:DATABASE_URL = "postgresql://...supabase..."
alembic upgrade head
```

#### Étape E — Backend sur Render (S7, 30 min)
1. https://render.com → login GitHub
2. "New Web Service" → sélectionner le repo
3. **Root Directory** : `backend/`
4. Build command : `pip install -r requirements.txt`
5. Start command : `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Variables d'env :
   - `DATABASE_URL` = string Supabase
   - `GOOGLE_MAPS_API_KEY` = ta clé backend (ou même que frontend)
   - `JWT_SECRET` = générer une longue string aléatoire (`openssl rand -hex 32`)
   - `FRONTEND_ORIGIN` = `https://tfe-route-app.vercel.app`
7. Deploy → noter l'URL
8. Tester `https://...onrender.com/docs` → Swagger doit s'ouvrir

#### Étape F — Boucler le câblage (S7, 10 min)
1. Retourner sur Vercel → mettre à jour `NEXT_PUBLIC_API_URL` avec l'URL Render
2. Redeploy frontend
3. Tester end-to-end : register → login → ajouter stops → optimize

#### Étape G — CI/CD léger (S8, optionnel mais valorisable)
- Vercel : auto-deploy à chaque push sur `main` ✅ (déjà inclus)
- Render : idem ✅ (déjà inclus)
- Ajouter un GitHub Action minimal qui lance `pytest` sur chaque push (montre que tu maîtrises le CI)

**À documenter dans le chapitre Implémentation (section 7.8 - Déploiement)** :
- Choix des plateformes + justification
- Diagramme d'architecture de prod (cf. plus haut)
- Procédure de déploiement (résumé)
- Limites du free tier (cold start, quotas)
- Coût mensuel estimé (0 € pour le MVP)

---

## 7. Plan détaillé du document écrit

### Cible : **70-80 pages utiles** (hors annexes, ToC, bibliographie)

| Chapitre | Pages | Quand rédiger |
|---|---|---|
| **0. Pages liminaires** (titre, abstract FR/EN, remerciements, ToC, listes) | ~6 | S8 |
| **1. Introduction** | 3-4 | S1 |
| **2. Contexte & problématique** | 5-6 | S1-S2 |
| **3. État de l'art** | 7-8 | S2 |
| **4. Analyse des besoins** | 5-6 | S3 |
| **5. Choix technologiques** | 8-10 | S4 |
| **6. Architecture logicielle** | 8-10 | S5 |
| **7. Implémentation** | 18-22 | S6-S8 |
| **8. Tests & Résultats** | 6-8 | S8 |
| **9. Conclusion & perspectives** | 4-5 | S8 |
| **Bibliographie** | 2-3 | S8 |
| **Annexes** (extraits de code, captures supplémentaires, **glossaire**, **questionnaire SUS**, politique de confidentialité) | 7-12 | S8 |
| **Total** | **77-100 pages** | |

### Détail du contenu, chapitre par chapitre

#### Chapitre 1 — Introduction
- 1.1 Présentation du projet
- 1.2 Motivation personnelle
- 1.3 Objectifs du TFE
- 1.4 Structure du document

#### Chapitre 2 — Contexte & problématique
- 2.1 Le problème de l'optimisation de tournées
- 2.2 Public cible (livreurs, commerciaux, particuliers)
- 2.3 Impact économique (chiffres, sources)
- 2.4 Question de recherche / problématique formulée

#### Chapitre 3 — État de l'art
- 3.1 Apps grand public (Google Maps multi-stops, Waze)
- 3.2 Solutions B2B (Circuit, Routific, RoadWarrior)
- 3.3 Approches académiques (papers TSP/VRP)
- 3.4 Tableau comparatif
- 3.5 Positionnement de notre solution (le gap)

#### Chapitre 4 — Analyse des besoins
- 4.1 Personas (3 personas détaillés)
- 4.2 User stories (15 stories)
- 4.3 Diagramme de cas d'usage (PlantUML)
- 4.4 Spécifications fonctionnelles (MVP vs futur)
- 4.5 Spécifications non-fonctionnelles
  - Performance (temps d'optimisation cibles, temps de chargement)
  - Sécurité (JWT, hashing bcrypt, HTTPS, rate limiting)
  - Accessibilité (cible WCAG 2.1 niveau AA : navigation clavier, ARIA, contraste, focus visibles)
  - **Conformité RGPD** (consentement implicite à la création de compte, droit à l'oubli via DELETE /me, minimisation des données, politique de confidentialité publiée)

#### Chapitre 5 — Choix technologiques
- 5.1 Méthodologie de choix (critères communs)
- 5.2 Frontend : Next.js vs alternatives
- 5.3 Backend : FastAPI vs alternatives
- 5.4 Base de données : PostgreSQL vs alternatives
- 5.5 Provider de cartes : Google Maps vs alternatives
- 5.6 Algorithme d'optimisation : OR-Tools vs maison
- 5.7 Authentification : JWT vs sessions
- 5.8 Hébergement (Vercel + Render + Supabase)
- 5.9 Tableau récapitulatif

#### Chapitre 6 — Architecture logicielle
- 6.1 Vue d'ensemble (diagramme global)
- 6.2 Architecture frontend (App Router, components)
- 6.3 Architecture backend (routers, services, models)
- 6.4 Modèle de données (ERD)
- 6.5 Diagramme de classes
- 6.6 Diagramme de séquence : flow d'optimisation
- 6.7 Diagramme de séquence : flow d'authentification
- 6.8 Communication frontend ↔ backend (REST, formats)
- 6.9 Sécurité (JWT, hashing, CORS, restriction clé API)

#### Chapitre 7 — Implémentation
- 7.1 Organisation du code frontend
- 7.2 Organisation du code backend
- 7.3 Intégration Google Maps (carte + autocomplete)
- 7.4 Algorithme d'optimisation (la vraie partie thésard)
  - Modélisation mathématique
  - Implémentation OR-Tools
  - Complexité et limites
- 7.5 Authentification (JWT, bcrypt, dépendance FastAPI)
- 7.6 Persistance (SQLAlchemy, Alembic, migrations)
- 7.7 PWA (manifest, service worker)
- 7.8 Déploiement (Vercel + Render + Supabase, CORS, variables d'env, limites free tier)
- 7.9 UI/UX (theming, liquid glass, responsive)
- 7.10 Sécurité avancée (rate limiting slowapi, validation Pydantic, restriction max stops, sanitization des inputs)
- 7.11 **Conformité RGPD** (politique de confidentialité, endpoint DELETE /me, droit à l'oubli, données minimisées, mention claire dans l'UI)
- 7.12 Accessibilité (audit Lighthouse, navigation clavier, ARIA roles, contraste AA, focus visibles)
- 7.13 Observabilité (logging structuré, lecture des logs Render, perspectives Sentry)

#### Chapitre 8 — Tests & Résultats
- 8.1 Méthodologie de tests (manuels + automatisés)
- 8.2 Tests fonctionnels manuels (scénarios documentés, captures)
- 8.3 Tests automatisés (pytest : structure, couverture, mocks via respx)
- 8.4 Performance (graphique : durée d'optimisation vs nombre de stops, 5/10/15/20/25)
- 8.5 **Score SUS** (System Usability Scale) : 3 testeurs, questionnaire standard, score moyen + interprétation
- 8.6 Retours qualitatifs des testeurs (bugs trouvés, suggestions)
- 8.7 Discussion des résultats

#### Chapitre 9 — Conclusion & perspectives
- 9.1 Bilan des objectifs
- 9.2 Limites de la solution actuelle
- 9.3 Perspectives futures (le parking lot)
- 9.4 Bilan personnel

---

## 8. Décisions clés à figer maintenant

À documenter dans `docs/decisions/00X-titre.md` (format ADR léger).

| # | Décision | Justification courte |
|---|---|---|
| 001 | **Google Maps** (pas OSM/Leaflet) | UX premium, autocomplete robuste, crédits gratuits couvrent le dev |
| 002 | **FastAPI** (pas Express/Django) | Async, doc auto, Pydantic, écosystème Python pour OR-Tools |
| 003 | **PostgreSQL** (pas MongoDB/SQLite) | Relationnel, JSON support, prod-ready, free tier partout |
| 004 | **OR-Tools** (pas algo maison) | Solveur état de l'art, doc Google, gain de temps énorme |
| 005 | **JWT** (pas sessions) | Stateless, mobile-friendly, simple à implémenter |
| 006 | **Vercel + Render + Supabase** | Tous gratuits, intégrations propres |
| 007 | **PWA avec next-pwa** | Standard, intégré, manifest auto |
| 008 | **TypeScript strict** (pas JS) | Sécurité, refactoring, jury apprécie |
| 009 | **Navigation légère intégrée + deep-link tiers** (pas turn-by-turn native) | Trip mode visuel maison + basculement Google Maps / Waze au choix (analogie Uber/Bolt). Turn-by-turn véritable (voix, recalcul dynamique, alertes trafic) laissé aux perspectives futures : coût de dev disproportionné, aucune valeur différenciante vs solutions existantes. |

---

## 9. Risques et plans B

### Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Crédits Google épuisés | Faible | Élevé | Quotas durs, monitoring, fallback OSM possible |
| Bug bloquant en S6-S7 | Moyenne | Élevé | Faire des commits Git fréquents, ne jamais bosser sur une feature >2 jours sans commit |
| Retard sur l'écrit | Forte | Élevé | Discipline : 1-2 jours d'écrit par semaine, NON-NÉGOCIABLE |
| Soutenance imprévue tôt | Faible | Moyen | Slides préparés dès le dimanche 30 août (S8) |
| Déploiement qui foire | Moyenne | Moyen | Tester le déploiement dès S6 (pas attendre S8) |
| OR-Tools incompréhensible | Faible | Élevé | Suivre tuto officiel Google sur TSP avant d'écrire le code custom |
| **Cold start Render** le jour de la soutenance | Moyenne | Moyen | Appel `fetch('/health')` au mount + screencast de backup |
| **Quota Google épuisé** par attaque ou bug | Faible mais réelle | Élevé | Rate limit slowapi + budget alert 5€ + quota dur 500/jour + 2 clés séparées (front/back) |
| **RGPD oublié** dans le doc ou l'app | Forte si non-traité | Élevé | Chap 7.11 dédié + page /privacy + DELETE /me + RGPD dans specs non-fonctionnelles |
| Données perso fuitées dans les logs | Moyenne | Moyen | Règle : ne jamais logger password, token, contenu sensible. Revue des `logger.info` avant prod |

### Plan B si retard énorme en S5
Si fin S5 tu n'as pas fini le câblage UI ↔ backend :
1. **Couper l'auth + PostgreSQL** → app sans login, juste démo locale, save dans localStorage
2. **Couper la PWA** → mentionner en perspectives
3. **Tout miser sur** : carte + autocomplete + optimisation + tracé sur carte

Ce MVP-MVP est démo-able en 5 minutes et suffit largement pour avoir un bon TFE.

---

## 10. Checklist soutenance

À préparer en fin de S8 (dimanche 30 + lundi 31 août) ou juste après le rendu.

- [ ] **Slides** (~15-20 slides) : présentation 15-20 min
  - Slide titre
  - Le problème (2 slides)
  - La solution (1 slide)
  - Démo live (5-7 min, 0 slide, juste l'app)
  - Architecture technique (3-4 slides)
  - Focus algo TSP (2-3 slides)
  - Résultats et perf (1-2 slides)
  - Limites + perspectives (1 slide)
  - Conclusion / questions (1 slide)
- [ ] **Démo préparée** : un script précis (5 stops à l'avance, déroulé fluide)
- [ ] **Backup démo** : screencast en cas de panne réseau
- [ ] **Répétition à blanc** : 2 fois minimum, chronométrée, devant quelqu'un si possible
- [ ] **Wake-up backend** : juste avant d'entrer dans la salle, ouvrir l'URL `/health` du backend pour le sortir du sleep
- [ ] **Compte démo** : email + password prêts à montrer au jury, avec trajets pré-chargés
- [ ] **Questions probables anticipées** :
  - Pourquoi pas du machine learning ?
  - Comment ça scale à 1000 stops ?
  - Sécurité des mots de passe ?
  - Comment monétiser ?
  - Différenciation vs Circuit/Routific ?
  - **Comment vous gérez le RGPD ?** (avoir la réponse prête : DELETE /me, page /privacy, données minimisées)
  - **Combien de temps pour 50 stops ? 100 stops ?** (avoir le tableau de mesures sous la main)
  - **Pourquoi pas Mapbox ou OpenStreetMap ?** (cf. ADR 001 et chap 5)

---

## 11. Ressources et outils

### Outils à installer / utiliser
- **VS Code** (déjà) + extensions : PlantUML, ESLint, Prettier, Python, Pylance, Tailwind CSS IntelliSense
- **Git + GitHub** : commit chaque jour, push chaque soir
- **Docker Desktop** : pour PostgreSQL local
- **Postman** ou **Insomnia** : tester l'API backend sans frontend
- **PlantUML** : diagrammes (`.puml` versionnés dans Git)
- **Excalidraw** : croquis rapides d'archi (export PNG)
- **Notion** ou **Obsidian** : prise de notes pendant la lecture de docs
- **Zotero** : gestion de la bibliographie
- **Lighthouse** (Chrome DevTools) : audit a11y + perf + PWA
- **NVDA** (gratuit) : screen reader pour tester l'accessibilité

### Workflow Git recommandé
- Branche `main` : **toujours déployable** (push = redeploy auto Vercel + Render)
- Branches features : `feat/auth`, `feat/optimize`, `feat/pwa`, etc.
- Commits **Conventional Commits** (valorisé par le jury) : `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`
- **Tag de version** au moment du rendu : `git tag v1.0.0-tfe && git push --tags`
- Rétro-hebdo le vendredi : checkbox livrables cochées, ajuster la semaine suivante si glissement

### Lectures recommandées avant chaque phase

**Avant Phase 1 (carte)** :
- Doc officielle `@vis.gl/react-google-maps` (30 min)

**Avant Phase 3 (OR-Tools)** :
- Tuto officiel Google : https://developers.google.com/optimization/routing/tsp (1h, ESSENTIEL)
- Papier court sur le TSP (Wikipedia suffit pour l'introduction)

**Avant Auth** :
- Tutoriel FastAPI Security : https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/ (1h30)

**Avant PWA** :
- Doc MDN sur PWA + manifest + service worker (1h)
- `@ducanh2912/next-pwa` README (15 min)

---

## ✅ Validation finale

À cocher quand le rendu est fait :
- [ ] PDF final compilé et relu 3 fois
- [ ] Tous les chapitres présents et numérotés
- [ ] Bibliographie complète (>15 sources)
- [ ] Tous les diagrammes intégrés (use case, classes, séquence, ERD, archi)
- [ ] Lien GitHub dans le doc
- [ ] Lien démo en ligne dans le doc
- [ ] Captures d'écran de l'app finale
- [ ] Abstract FR + EN
- [ ] Page de garde aux normes de ton école
- [ ] Sauvegarde du PDF dans Google Drive + clé USB
- [ ] Confirmation de réception du rendu officiel

---

**🚀 GO. La semaine 1 commence aujourd'hui — mardi 7 juillet 2026. Rendu dans 8 semaines. Bon courage.**
