# Analyse académique — Semaine 1 (7 → 13 juillet 2026)

> **Objectif de ce fichier** : matière première pour rédiger les chapitres du TFE sur Word.
> Ici on **analyse** ce qu'on a fait (choix, justifications, réflexions), en style académique.
> Chaque semaine ajoute son propre fichier `semaine-XX.md` — à la fin, on redistribue ces analyses dans les chapitres finaux.
>
> **Pour chaque section** : le contenu est prêt à être copié/reformulé dans Word, avec du recul argumenté.

---

## 🎯 Périmètre de la semaine

Cette première semaine a été dédiée à deux objectifs simultanés :

1. **Poser les fondations techniques** du frontend interactif en remplaçant l'interface statique existante (un fond pointillé décoratif) par une carte cartographique réelle, exploitable par l'utilisateur final.
2. **Initier la démarche rédactionnelle** du TFE en établissant une structure documentaire (`recap.md`, `docs/redaction/`) permettant un suivi hebdomadaire des avancées et une capitalisation progressive du contenu académique.

Le principe directeur de l'ensemble du projet est d'avancer **en parallèle** sur le code et l'écrit, afin d'éviter le piège classique d'une rédaction reportée à la dernière semaine.

---

## 1. Choix de la solution cartographique — Google Maps

### Contexte
L'application vise à assister l'utilisateur dans la planification et l'optimisation de tournées multi-arrêts. Le composant cartographique constitue le **cœur visuel et fonctionnel** du produit : il doit être capable d'afficher une carte navigable, de localiser précisément l'utilisateur, d'accepter la saisie d'adresses avec autocomplétion (S2), et à terme d'afficher un itinéraire optimisé (S5).

### Alternatives considérées
Trois grandes familles de solutions étaient envisageables :

| Solution | Avantages | Inconvénients |
|---|---|---|
| **Google Maps Platform** | Autocomplétion d'adresses de qualité (Places API), matrice de distances réaliste (Routes API), rendu premium reconnu par les utilisateurs, écosystème mature | Nécessite une clé API + billing (gratuit jusqu'à 200 $/mois de crédits, très largement suffisant pour un TFE), dépendance à un fournisseur propriétaire |
| **Mapbox** | Rendu esthétique très personnalisable, tarification transparente, offre gratuite généreuse | Autocomplétion moins riche que Google Places, écosystème plus restreint pour l'optimisation de tournées |
| **OpenStreetMap + Leaflet + OSRM** | 100 % open-source, aucun coût, contrôle total | Autocomplétion à implémenter soi-même (via Nominatim, moins précis), matrice de distances plus complexe à obtenir, moins d'attractivité visuelle pour la démonstration |

### Décision
Le choix s'est porté sur **Google Maps Platform** pour trois raisons :

1. **Qualité de l'autocomplétion (Places API)** : la fluidité et la précision de la saisie d'adresses conditionnent directement l'expérience utilisateur. Google reste la référence dans ce domaine.
2. **Cohérence de la matrice de distances (Routes API)** : l'algorithme d'optimisation TSP (semaine 4) a besoin de temps de trajet réalistes tenant compte des conditions réelles de circulation. Google fournit ces données nativement.
3. **Reconnaissance visuelle par les utilisateurs finaux** : lors de la soutenance, une carte au rendu familier réduit la charge cognitive du jury et évite les questions parasites sur le rendu.

Le coût nul (grâce au crédit gratuit mensuel) neutralise l'argument budgétaire, à condition de restreindre correctement les clés API (voir plus loin).

---

## 2. Séparation des clés API — anticipation de la sécurité

Deux projets Google Cloud distincts ont été créés dès la mise en place :

- **`route-app-front-end`** : clé restreinte aux APIs consommées par le navigateur (Maps JavaScript API, Places API), avec une restriction par référant HTTP (`localhost:3000/*`).
- **`route-app-backend`** : clé restreinte aux APIs consommées par le serveur (Geocoding API, Routes API), destinée à être utilisée depuis le backend FastAPI qui sera introduit en semaine 3.

### Justification
Une **clé exposée dans le bundle JavaScript** du frontend est intrinsèquement publique. La seule protection est la restriction par référant HTTP, qui empêche l'exploitation depuis un autre domaine. À l'inverse, une clé backend n'est jamais exposée au client et peut être restreinte par IP en production. Mélanger les deux dans une clé unique reviendrait à donner au grand public l'accès à des APIs facturées à la requête (Routes API).

Cette séparation, généralement mise en place tardivement, a été anticipée dès la semaine 1 pour éviter une réécriture ultérieure. Elle sera documentée dans le chapitre 7.10 (Sécurité avancée) du TFE.

---

## 3. Choix de la bibliothèque React — `@vis.gl/react-google-maps`

Trois options s'offraient pour intégrer Google Maps dans une application React/Next.js :

- **`@vis.gl/react-google-maps`** : bibliothèque maintenue par l'équipe vis.gl en partenariat avec Google. Composants React modernes (hooks, contexts), support natif TypeScript, support des Places API New.
- **`@react-google-maps/api`** : bibliothèque historique de référence, mais dont la maintenance s'est ralentie. Ne supporte pas les nouvelles Places API.
- **Utilisation directe du SDK JavaScript `google.maps.*`** : maximum de contrôle mais nécessite une gestion manuelle du lifecycle et perd les bénéfices de React.

La première option a été retenue car elle combine l'endorsement officiel de Google, une API idiomatique React et le support des dernières APIs. Cette décision fera l'objet d'un ADR (Architecture Decision Record) dans `docs/decisions/`.

---

## 4. Fonctionnalité de géolocalisation utilisateur

### Écart par rapport au plan initial
Le plan initial prévoyait simplement de centrer la carte sur Bruxelles (lat 50.8503, lng 4.3517, zoom 12). En cours d'implémentation, un enrichissement fonctionnel a été décidé : **centrer la carte sur la position réelle de l'utilisateur** dès le premier chargement.

### Motivation
Une application de planification de tournées prend tout son sens **là où se trouve l'utilisateur**. Centrer arbitrairement sur Bruxelles est acceptable pour une démonstration académique, mais dégrade l'expérience réelle. La géolocalisation navigateur (API `navigator.geolocation`) est une solution simple, standard, et sans coût — il aurait été dommage de s'en priver.

### Modélisation en machine à états
La géolocalisation présente **cinq états possibles** qu'il faut gérer explicitement :

1. **`loading`** : la position est en cours d'acquisition (popup ouverte ou requête en cours).
2. **`granted`** : l'utilisateur a accepté, la position est disponible.
3. **`denied`** : l'utilisateur a explicitement refusé (le navigateur n'autorisera plus de nouvelle popup automatique).
4. **`unavailable`** : erreur non liée au refus (timeout, GPS coupé, réseau indisponible).
5. Un état initial côté **serveur** (SSR de Next.js) où `navigator` n'existe pas.

Cette modélisation en machine à états — plutôt qu'un simple booléen `hasLocation` — permet d'adapter l'interface à chaque cas : afficher un badge de chargement, un marker, un bouton de recentrage actif, un bouton en état d'erreur, ou un panneau d'aide selon la situation.

### Fallback : la carte reste toujours fonctionnelle
Même si l'utilisateur refuse la géolocalisation, la carte s'affiche immédiatement centrée sur Bruxelles au zoom 12. **L'application ne bloque jamais l'utilisateur derrière une permission** — elle propose une valeur ajoutée si la position est disponible, mais reste utilisable sans.

Cette approche respecte le principe d'**amélioration progressive** (progressive enhancement) : les fonctionnalités qui dépendent de permissions ou de capacités optionnelles ne doivent pas conditionner l'accès au produit de base.

---

## 5. Bouton de recentrage et gestion du refus persistant

### Problème identifié
Une contrainte souvent oubliée des navigateurs modernes : **une fois qu'un utilisateur refuse la géolocalisation, la popup native ne réapparaît plus jamais automatiquement**, y compris après rechargement de la page ou nouvel appel à `navigator.geolocation.getCurrentPosition()`. Il s'agit d'une protection anti-abus intentionnelle, cohérente entre Chrome, Edge, Firefox et Safari.

### Solution UX retenue
Un bouton d'action flottant (FAB — Floating Action Button) a été placé en bas à droite de la carte, avec un comportement adapté à l'état de la géolocalisation :

- **Position acquise** → clic = recentrage doux (`panTo`) sur la position, avec zoom rapproché (14).
- **Chargement** → bouton désactivé avec un spinner (interdit toute interaction inutile).
- **Refus / indisponible** → icône rouge + clic = ouverture d'un **panneau d'aide** qui explique à l'utilisateur, étape par étape, comment réactiver l'autorisation dans les paramètres de son navigateur (cadenas → autorisations → localisation → autoriser → recharger).

Cette approche transforme un cas d'erreur silencieux en un parcours utilisateur guidé et récupérable, ce qui est essentiel pour l'accessibilité et la satisfaction. Elle sera mentionnée dans le chapitre 7.12 (Accessibilité) et illustrée par une capture d'écran dans le chapitre 8 (Tests & Résultats).

---

## 6. Contraintes techniques rencontrées

### 6.1 Warnings React 19 sur les effets
React 19 signale désormais comme problématique tout appel à `setState()` synchrone à l'intérieur du corps d'un `useEffect`, considérant que cela déclenche des rendus en cascade nuisibles à la performance. Ce comportement a été rencontré à deux reprises dans le composant `MapContainer` :

- Une première fois avec l'initialisation de l'état de géolocalisation. **Solution** : utilisation d'un `useState` avec initialiseur paresseux (`useState(() => ...)`) qui calcule l'état de départ une seule fois, sans passer par un effet.
- Une seconde fois avec le suivi d'un recentrage automatique unique. **Solution** : utilisation d'un `useRef` (mutable, ne déclenche pas de re-render) plutôt qu'un `useState` (immuable, déclenche un re-render).

Ces patterns constituent une bonne pratique idiomatique React qui sera documentée dans le chapitre 7.1 (Organisation du code frontend).

### 6.2 Blocage des tuiles par les ad-blockers
Certaines extensions de blocage de publicité (uBlock Origin, Brave Shields, etc.) filtrent par défaut les requêtes vers les domaines Google, ce qui empêche le chargement des tuiles cartographiques. L'erreur console (`net::ERR_BLOCKED_BY_CLIENT`) est peu explicite pour un développeur non averti. Cette contrainte devra être mentionnée dans le README du projet et dans la documentation de déploiement (S8).

### 6.3 Dépréciation de `google.maps.Marker`
Depuis février 2024, Google recommande la nouvelle API `AdvancedMarkerElement` en remplacement du composant historique `Marker`. Le composant `Marker` reste supporté et fonctionnel (préavis minimum de 12 mois avant retrait), mais la migration future nécessitera la configuration d'un **Map ID** dans Google Cloud Console. Cette migration est planifiée pour la semaine 8 (finalisation), en même temps qu'un éventuel travail de personnalisation avancée du style de la carte.

---

## 7. Choix de synchronisation avec le thème sombre

Le composant `ThemeProvider` existant expose un état booléen `isDark` et applique une classe CSS (`theme-dark` ou `theme-light`) sur l'élément racine `<html>`. Pour synchroniser la carte avec ce thème, deux options étaient possibles :

1. **Utiliser la prop `styles` de `<Map>`** avec un JSON de styles personnalisé — approche historique désormais dépréciée par Google en faveur des styles Cloud-based.
2. **Utiliser la nouvelle prop `colorScheme`** introduite dans Google Maps SDK v3.55 (2024), qui accepte les valeurs `"LIGHT"`, `"DARK"` ou `"FOLLOW_SYSTEM"` et applique automatiquement le thème sombre officiel de Google.

La seconde option a été retenue pour sa simplicité, sa maintenabilité (aucun JSON de style à gérer), et son alignement avec la direction actuelle de la plateforme Google Maps.

La synchronisation se fait par un simple `colorScheme={isDark ? 'DARK' : 'LIGHT'}` dans le rendu du `<Map>`, ce qui garantit une propagation instantanée du changement de thème sans rechargement.

---

## 8. Bilan de la semaine

**Positif**
- Objectifs code de la semaine 1 dépassés (le plan prévoyait seulement une carte centrée sur Bruxelles, on a livré : carte + géoloc + dark mode + point bleu + bouton recentrage + panneau d'aide).
- Séparation des clés API anticipée (initialement prévue en S6/S7).
- Aucune erreur TypeScript, aucun warning React 19 restant après refactorisation.

**Points d'attention pour la suite**
- La rédaction du chapitre 1 (Introduction) reste à faire dans Word.
- Le chapitre 2 (Contexte & problématique) doit être démarré.
- La dette d'écrit ne doit pas s'accumuler : à surveiller dès la fin de semaine 1.

**Enseignements**
- Le pattern "state machine explicite + fallback silencieux + panneau d'aide contextuel" est un motif réutilisable pour toute permission navigateur (notifications, caméra, etc. — à garder en tête pour la PWA en S7).
- Les nouveautés récentes de Google Maps SDK (`colorScheme`, `mapId`, `AdvancedMarker`) et de React 19 (règles strictes sur les effets) demandent une lecture attentive de la documentation avant d'implémenter, sous peine de retomber dans des patterns obsolètes ou déconseillés.
