# Analyse de la Semaine 1 — 7 → 13 juillet 2026

> Synthèse comparative entre ce qui était **planifié** dans [PLAN-TFE.md](PLAN-TFE.md) et ce qui a été **réalisé** (consigné dans [recap.md](recap.md) et [docs/redaction/semaine-01.md](docs/redaction/semaine-01.md)).
> Ce fichier fait le point à mi/fin de chaque semaine pour identifier écarts, dépassements et ajustements à prévoir.

---

## 1. Ce qui était planifié en S1

Source : PLAN-TFE.md, section « SEMAINE 1 — 7 → 13 juillet 2026 »
**Thème** : Fondations écrit + intégration carte

### Écrit
- Créer la structure de dossiers `docs/redaction/` et `docs/decisions/`
- Définir le plan détaillé du document (déjà couvert par PLAN-TFE.md)
- Rédiger le **Chapitre 1 — Introduction** (~3-4 pages)
- Démarrer le **Chapitre 2 — Contexte & problématique** (~5 pages)

### Dev
- Créer un compte Google Cloud + projet
- Activer Maps JavaScript API + Places API
- Générer une clé API restreinte à `http://localhost:3000/*`
- Configurer une alerte de budget à 5 €
- Configurer un quota dur (500 chargements/jour en dev)
- Créer `frontend/.env.local` avec `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Installer `@vis.gl/react-google-maps`
- **Phase 1** : remplacer le fond pointillé par Google Maps dans `MapContainer.tsx`
- Centrer sur Bruxelles, zoom 12, contrôles minimaux

### Livrable attendu fin S1
- 8-10 pages écrites (Intro + début Contexte)
- App avec vraie carte Google Maps en fond, fonctionnelle

---

## 2. Ce qui a été réalisé (au 7 juillet)

### Dev — au-delà des attentes ✅

| Prévu au plan | Réalisé | Bonus non planifiés |
|---|---|---|
| Compte + projet Google Cloud | ✅ Fait | **2 projets séparés** (front + back) au lieu d'un seul → anticipation de la sécurité prévue en S6/S7 |
| Activer Maps JS + Places | ✅ Fait | + activation anticipée de **Geocoding + Routes API** côté backend |
| Clé restreinte HTTP referrers | ✅ Fait | — |
| Alerte budget 5 € | ✅ Fait | — |
| Quota dur 500/jour | ✅ Fait | — |
| `.env.local` + `NEXT_PUBLIC_*` | ✅ Fait | `.gitignore` vérifié |
| Installer `@vis.gl/react-google-maps` | ✅ Fait | — |
| Carte centrée sur Bruxelles zoom 12 | ✅ Fait (comme fallback) | Centrage **sur la position réelle** de l'utilisateur (géolocalisation navigateur) |
| Contrôles minimaux | ✅ Fait (`disableDefaultUI`) | — |
| — | — | **Marker "you are here"** style Google (point bleu + bordure blanche) |
| — | — | **Dark mode synchronisé** avec `ThemeProvider` via prop `colorScheme` |
| — | — | **Bouton FAB de recentrage** (glass, WCAG AA touch target, 3 états visuels) |
| — | — | **Panneau d'aide contextuel** pour l'utilisateur qui a refusé la géoloc |
| — | — | **Machine à états explicite** (`loading` / `granted` / `denied` / `unavailable`) au lieu d'un simple booléen |
| — | — | Pattern React 19 idiomatique (lazy `useState` + `useRef`) pour éviter les warnings "cascading renders" |

Le composant `MapContainer.tsx` est passé de **19 lignes** (placeholder pointillé) à **~180 lignes** avec 8 fonctionnalités livrées, alors que le plan n'en demandait qu'**une seule** (carte centrée sur Bruxelles).

### Écrit — en retard ⚠️

| Prévu au plan | Réalisé |
|---|---|
| Créer `docs/redaction/` et `docs/decisions/` | ✅ Créés (`docs/decisions/` reste vide pour l'instant) |
| Créer les 9 fichiers `chap-XX-*.md` | ❌ Abandonné (choix de méthode) → remplacé par une approche par **analyses hebdomadaires** dans `docs/redaction/semaine-XX.md` |
| Rédiger le Chapitre 1 — Introduction (~3-4 pages) | ❌ Pas commencé sur Word |
| Démarrer le Chapitre 2 — Contexte (~5 pages) | ❌ Pas commencé sur Word |
| Livrable : 8-10 pages écrites | ❌ 0 page dans Word |

**Nuance importante** : bien qu'aucune page n'ait été rédigée dans Word, le fichier `docs/redaction/semaine-01.md` constitue déjà une **matière première conséquente** (8 sections argumentées, ~5 pages une fois reformatées). Elle sera directement reformulable dans le Chapitre 5 (choix technologiques), le Chapitre 4 (besoins non-fonctionnels) et le Chapitre 7 (implémentation).

---

## 3. Analyse

### Points forts
1. **Dépassement significatif du scope dev** : la carte livrée est bien plus riche que ce qui était demandé, avec une UX complète (géoloc, dark mode, recentrage, aide). Ce dépassement est **capitalisable** dans le TFE écrit (illustre la rigueur du travail, la maîtrise des APIs récentes, l'attention à l'accessibilité).
2. **Anticipation d'une bonne pratique de sécurité** : la séparation des clés API front/back, initialement prévue en S6/S7, a été faite dès le premier jour. Cela évite un refactoring ultérieur et fournit du contenu directement utilisable pour le chapitre 7.10 (Sécurité avancée).
3. **Discipline sur les warnings React 19** : deux occurrences du warning "cascading renders" ont été détectées et corrigées proprement (lazy `useState`, `useRef`), démontrant une compréhension idiomatique du framework.
4. **Choix de méthode structurant** : le format `recap.md` (chronologique) + `docs/redaction/semaine-XX.md` (analytique) est une décomposition claire qui découplera efficacement le suivi technique de la matière rédactionnelle.

### Points d'attention
1. **Zéro page rédigée dans Word** au 7 juillet. Le risque de dette d'écrit est **réel** et doit être adressé dès cette semaine. Recommandation : consacrer 1-2 jours entiers à Word (mercredi + jeudi par exemple) pour :
   - Produire le Chapitre 1 — Introduction (3-4 pages)
   - Démarrer le Chapitre 2 — Contexte
   - Reformuler dans Word tout ou partie du contenu de `docs/redaction/semaine-01.md` (le placer dans les chapitres appropriés)
2. **Le dossier `docs/decisions/`** (ADR) n'a pas encore été peuplé. Deux ADR peuvent être rédigés cette semaine avec ce qui a déjà été décidé :
   - `001-google-maps.md` : justification du choix de Google Maps vs Mapbox/OSM
   - `002-clefs-api-separees.md` : justification de la séparation front/back
3. **Warning `google.maps.Marker` deprecated** noté pour la S8. Ne pas oublier de créer un Map ID Google Cloud à ce moment-là.
4. **Compression du calendrier** : rappel que le plan a été comprimé d'1 semaine (56 jours au lieu de 63). Chaque retard côté écrit se paie double en fin de parcours.

### Écarts par rapport au plan
| Écart | Type | Sens | Impact |
|---|---|---|---|
| Dev livré très au-dessus du minimum planifié | Positif | Dépassement | Renforce la qualité de la démo et la matière académique |
| Aucune page Word rédigée | Négatif | Sous-livraison | À rattraper impérativement d'ici la fin de S1 |
| Séparation des clés API dès la S1 | Positif | Anticipation | Économise du refactoring futur en S6/S7 |
| Abandon des `chap-XX-*.md` stubs | Neutre | Changement de méthode | La méthode `semaine-XX.md` est plus adaptée à un rythme itératif |

---

## 4. Actions correctrices pour la fin de S1

- [ ] **D'ici dimanche 12 juillet** : produire le Chapitre 1 (Introduction) dans Word — 3 à 4 pages
- [ ] **D'ici dimanche 12 juillet** : rédiger au minimum 2 pages du Chapitre 2 (Contexte & problématique)
- [ ] **En parallèle** : créer les ADR `001-google-maps.md` et `002-clefs-api-separees.md` dans `docs/decisions/` (30 min chacun)
- [ ] **Alimenter** `docs/redaction/semaine-01.md` à chaque nouveau bout de code livré (déjà à jour au 7 juillet)

---

## 5. Cadence à adopter à partir de la S2

Sur la base de l'expérience S1 :

- **Alterner dev et écrit dans la journée**, pas les répartir « dev en journée, écrit le soir » (fatigue → écrit bâclé)
- **Écrit d'abord le matin** quand l'énergie mentale est fraîche (rédiger 1-2h) — dev l'après-midi
- **Recap et analyse chaque vendredi soir** pour clore proprement la semaine et préparer la suivante
- **Ne pas céder à la tentation** de continuer à enrichir la carte en S2 : la S2 c'est autocomplete + Chapitre 3. La carte est terminée.

---

*Ce fichier sera dupliqué et adapté chaque semaine (`analyse-s2.md`, etc.) pour tracer les écarts en continu.*
