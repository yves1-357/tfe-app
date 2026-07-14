# Analyse académique — Semaine 2 (14 → 20 juillet 2026)

> **Objectif de ce fichier** : matière première pour rédiger les chapitres du TFE sur Word.
> Ici on **analyse** ce qu'on a fait (choix, justifications, réflexions), en style académique.
> Chaque semaine ajoute son propre fichier `semaine-XX.md` — à la fin, on redistribue ces analyses dans les chapitres finaux.
>
> **Pour chaque section** : le contenu est prêt à être copié/reformulé dans Word, avec du recul argumenté.

---

## 🎯 Périmètre de la semaine

Cette deuxième semaine a été consacrée à la **Phase 2 du développement frontend** : l'intégration de l'autocomplétion d'adresses via Google Places API et l'affichage des points d'arrêt sur la carte. Ces deux fonctionnalités constituent l'interface de saisie principale de l'application — c'est le premier vrai point de contact entre l'utilisateur et la logique métier du planificateur de tournées.

Trois sous-objectifs ont guidé le travail :
1. **Remplacer le champ texte libre** par une autocomplétion connectée à la base de données géographique Google.
2. **Enrichir le modèle de données** du stop avec les coordonnées GPS et l'identifiant de lieu (`placeId`), nécessaires pour l'algorithme d'optimisation en semaine 4.
3. **Visualiser les stops sur la carte** avec des marqueurs numérotés reflétant leur ordre dans la tournée.

---

## 1. Refactoring architectural — déplacement de `APIProvider`

### Problème initial
La bibliothèque `@vis.gl/react-google-maps` fonctionne sur un modèle de **context React** : le composant `APIProvider` charge le SDK Google Maps et expose un contexte accessible à tous ses descendants via des hooks (`useMap`, `useMapsLibrary`, etc.). En semaine 1, cet `APIProvider` avait été placé dans `MapContainer.tsx`, ce qui était suffisant pour la carte seule.

Or, le nouveau composant `AddStopInput` doit appeler `useMapsLibrary('places')` pour accéder à la bibliothèque Places. Ce hook étant un consommateur du contexte `APIProvider`, il ne peut fonctionner que si un `APIProvider` est présent dans l'arbre de composants React au-dessus de lui — ce qui n'était pas le cas, `AddStopInput` étant un frère de `MapContainer`, non un enfant.

### Alternatives considérées

| Approche | Avantages | Inconvénients |
|---|---|---|
| **Remonter `APIProvider` dans `page.tsx`** | Solution propre, un seul provider pour toute la page, `AddStopInput` et `MapContainer` accèdent tous deux au contexte | Léger refactoring (retirer `APIProvider` de `MapContainer`) |
| **Déplacer `AddStopInput` à l'intérieur de `MapContainer`** | Minimal en termes de fichiers touchés | Brise la séparation des responsabilités : `MapContainer` ne devrait pas gérer la saisie des stops |
| **Créer un second `APIProvider` dans `AddStopInput`** | Aucun refactoring | Charge le SDK Google Maps deux fois — interdit par la documentation officielle |

### Décision
La première option a été retenue : `APIProvider` a été remonté dans `page.tsx` et enveloppe désormais l'ensemble de la page. Cette décision améliore également la structure générale de l'application — la clé API et l'initialisation du SDK sont gérées en un seul endroit, au niveau du composant racine, conformément au principe de **responsabilité unique**.

Cette architecture anticipera également les besoins futurs : tout composant ajouté à la page (ex: `RouteOverlay` en S5, `SaveRouteDialog` en S7) pourra utiliser les hooks Google Maps sans configuration supplémentaire.

---

## 2. Intégration de l'autocomplétion Places API

### Choix de l'approche d'implémentation
La bibliothèque `@vis.gl/react-google-maps` v1.9.0 ne propose pas de composant `<PlaceAutocomplete>` clé-en-main. Trois approches d'implémentation étaient envisageables :

| Approche | Mécanisme | Évaluation |
|---|---|---|
| **Hook `useMapsLibrary` + widget natif** | Charge la lib `places`, crée une instance `google.maps.places.Autocomplete` attachée à un `<input>` via une ref | Recommandé par la documentation, robuste, accès à toutes les options |
| **`AutocompleteService` + UI custom** | Appelle `AutocompleteService.getPlacePredictions()` à chaque frappe, gère soi-même le dropdown | Contrôle total sur l'UI, mais nécessite une gestion manuelle du debounce, de la navigation clavier, de l'accessibilité |
| **Composant tiers (ex: `react-places-autocomplete`)** | Bibliothèque externe avec composant React prêt à l'emploi | Dépendance supplémentaire, maintenance incertaine, incompatible avec les nouvelles Places API |

La première approche — hook `useMapsLibrary` + widget natif — a été retenue. Elle conserve le bénéfice du dropdown Google (rendu, accessibilité, navigation clavier, "Powered by Google") tout en restant dans l'écosystème officiel. Le widget natif gère également automatiquement les **sessions de facturation Places API** (regroupement des frappes en une seule transaction de billing), ce qu'une implémentation manuelle devrait gérer explicitement.

### Pattern d'implémentation

La création du widget suit un pattern en deux phases distinctes :

**Phase 1 — Création de l'instance** (déclenchée quand la lib est chargée) :
```tsx
const ac = new places.Autocomplete(inputRef.current, {
  fields: ['formatted_address', 'geometry', 'place_id'],
  types: ['geocode', 'establishment'],
});
```

**Phase 2 — Écoute de l'événement** :
```tsx
ac.addListener('place_changed', () => {
  const place = ac.getPlace();
  // extraire address, lat, lng, placeId
});
```

Un soin particulier a été apporté à la **gestion des closures** : la callback `onAddStop` passée en prop peut changer à chaque rendu parent. Passer cette fonction directement dans le listener créerait une closure stale (référence obsolète). La solution retenue est d'utiliser un `useRef` comme "pont stable" :
```tsx
const onAddStopRef = useRef(onAddStop);
useEffect(() => { onAddStopRef.current = onAddStop; }, [onAddStop]);
// dans le listener : onAddStopRef.current({ ... })
```
Ce pattern évite de recréer l'instance `Autocomplete` à chaque changement de callback, ce qui serait coûteux et provoquerait des fuites mémoire sur les listeners précédents.

---

## 3. Biais géographique de l'autocomplétion

### Problème identifié
Sans configuration particulière, l'API Places Autocomplete classe ses résultats en fonction de la popularité globale des lieux. Ainsi, taper "Mcdo" retourne en premier les McDonald's les plus célèbres à l'échelle mondiale — typiquement des adresses parisiennes ou bruxelloises très fréquentées — plutôt que l'établissement le plus proche de l'utilisateur.

Pour une application de planification de tournées dont l'utilisateur cible est un livreur ou un professionnel itinérant, ou meme un particulier  ce comportement par défaut est contre-productif : l'utilisateur cherche des adresses dans sa zone de travail habituelle.

### Solution : biais par bounding box

L'API `Autocomplete` expose une méthode `setBounds(bounds: LatLngBounds)` qui définit une zone de préférence géographique. Les résultats **à l'intérieur** de la zone sont systématiquement prioritaires, mais les résultats extérieurs restent accessibles si l'utilisateur saisit un nom suffisamment précis.

Ce comportement — appelé **biais doux** (soft bias), par opposition à une **restriction stricte** (`strictBounds: true`) — est le compromis idéal pour notre cas d'usage :
- Recherche courte (`mcdo`) → résultats locaux
- Recherche explicite (`mcdo paris`) → Paris accessible malgré la distance

### Calibration du rayon

| Rayon testé | Observation |
|---|---|
| 50 km | Trop large : Bruxelles (~25 km) reste dans la zone de biais, ses adresses populaires priment encore |
| **10 km** | Optimal : Bruxelles est hors zone, les établissements du secteur immédiat sont prioritaires |
| 5 km | Acceptable mais trop restrictif pour des utilisateurs se déplaçant en province |

Le rayon de **10 km** a été retenu comme valeur par défaut. Il couvre le secteur de travail typique d'un livreur/particulier local sans exclure les communes voisines.

### Utilisation du cache GPS

La position de l'utilisateur est obtenue via `navigator.geolocation.getCurrentPosition` avec l'option `maximumAge: 300_000` (5 minutes). Cette valeur signifie que le navigateur retourne immédiatement la position mise en cache par le premier appel de `MapContainer` — aucune nouvelle requête GPS n'est émise. Le délai d'initialisation du biais est donc **nul en pratique**.

En cas de refus de géolocalisation, un fallback est appliqué : la bounding box de l'ensemble du territoire belge (SW: 49.5°N/2.5°E — NE: 51.5°N/6.4°E), ce qui reste nettement plus pertinent qu'une recherche mondiale.

---

## 4. Enrichissement du modèle de données `Stop`

### Évolution du type
Le type `Stop` a été étendu avec trois champs optionnels :

```typescript
export interface Stop {
  id: string;
  address: string;
  order: number;
  lat?: number;       // latitude WGS84
  lng?: number;       // longitude WGS84
  placeId?: string;   // identifiant unique Google Places
}
```

L'optionnalité de ces champs est intentionnelle : elle préserve la rétrocompatibilité avec tout code existant qui crée des stops sans coordonnées (ex: tests unitaires futurs). En pratique, tout stop créé via l'autocomplétion aura toujours `lat`, `lng` et `placeId` définis.

### Rôle du `placeId`
Le `placeId` est l'identifiant unique d'un lieu dans la base de données Google Places. Il sera utilisé en semaine 4 pour deux usages :
1. Interroger la **Routes API** pour obtenir les durées de trajet réelles entre chaque paire de stops (matrice de distances).
2. Permettre à terme une **sauvegarde reproductible** des trajets : en stockant le `placeId` plutôt que les coordonnées brutes, on s'assure que le stop reste identifiable même si l'adresse est légèrement reformatée.

### Réindexation dynamique des ordres
La suppression d'un stop intermédiaire (ex: supprimer le stop #2 dans une liste de 5) créerait un "trou" dans la numérotation (1, 3, 4, 5). Ce comportement serait contre-intuitif pour l'utilisateur et incorrect pour l'affichage des markers sur la carte.

La fonction `handleRemoveStop` a donc été modifiée pour réindexer systématiquement les stops restants après suppression :
```tsx
setStops(prev =>
  prev.filter(stop => stop.id !== id)
      .map((stop, index) => ({ ...stop, order: index + 1 }))
);
```
Ce pattern — filtre + remap immutable — est une pratique idiomatique React : il crée un nouveau tableau sans muter l'état précédent, garantissant un comportement prédictible du renderer.

---

## 5. Visualisation des stops sur la carte

### Distinction visuelle des markers
Deux types de markers coexistent sur la carte :
- **Marker utilisateur** : cercle bleu SVG (#4285F4) — repère la position GPS de l'utilisateur
- **Markers stops** : pins Google Maps standards avec label numérique blanc — repèrent les adresses de la tournée

Cette distinction visuelle est intentionnelle : l'utilisateur doit identifier immédiatement sa position parmi les destinations de livraison. Le label numérique sur les pins de stops correspond au champ `order` du modèle, permettant une correspondance visuelle directe avec la liste affichée dans le panneau latéral.

### Mise à jour réactive
Les markers de stops sont rendus directement dans le JSX du composant `MapContainer` via un `.map()` sur la prop `stops` :
```tsx
{stops.map((stop) =>
  stop.lat !== undefined && stop.lng !== undefined ? (
    <Marker key={stop.id} position={{ lat: stop.lat, lng: stop.lng }}
      label={{ text: String(stop.order), ... }} />
  ) : null
)}
```
La vérification `lat !== undefined` garantit qu'aucun marker n'est rendu pour un stop sans coordonnées. La mise à jour est **réactive par nature** : React re-rend `MapContainer` à chaque modification de `stops` dans `page.tsx`, et les markers se repositionnent et se renumérotent instantanément.

---

## 6. Stylisation du dropdown d'autocomplétion

### Problème technique
Le dropdown de l'autocomplétion Google Places est rendu par le composant natif `google.maps.places.Autocomplete` qui injecte un élément `.pac-container` directement dans le `<body>` du document HTML — **en dehors de l'arbre React**. Ce comportement est intentionnel côté Google (permettre au dropdown de dépasser les limites de son conteneur parent sans contrainte de `overflow: hidden`).

La conséquence directe est que les styles Tailwind appliqués aux composants React n'ont aucun effet sur ce dropdown. De plus, Google charge sa propre feuille CSS de manière dynamique (via JavaScript) **après** le chargement de notre `globals.css`, ce qui implique que ses règles l'emportent sur les nôtres en l'absence de `!important`.

### Solution : overrides globaux avec `!important`

La stratégie retenue est d'ajouter des règles CSS globales ciblant les classes `.pac-*` dans `globals.css`, avec `!important` sur les propriétés que Google définit explicitement (notamment `background-color`, `border-top`, `font-family`).

L'utilisation de variables CSS (`var(--surface-1)`, `var(--text-1)`, etc.) permet à ces overrides de s'adapter **automatiquement** au thème clair/sombre sans duplication de règles — les variables sont définies sur `:root` et cascadent vers tous les éléments du document, y compris le `.pac-container` injecté dynamiquement.

Cette approche illustre un principe important de l'architecture CSS : les **CSS custom properties** (variables) cascadent à travers tout l'arbre DOM, y compris les éléments injectés dynamiquement par des bibliothèques tierces, à condition qu'ils soient des descendants de l'élément où les variables sont définies (ici `:root` = `<html>`).

### Conformité aux Conditions d'Utilisation Google
Le footer "Powered by Google" (`::after` de `.pac-logo`) est **obligatoire** selon les Terms of Service de la Google Maps Platform. Il a été conservé dans les overrides CSS, simplement rendu semi-transparent pour s'intégrer à l'esthétique de l'application, sans être masqué.

---

## 7. Gestion des types TypeScript — `google.maps` namespace

### Problème
Le composant `AddStopInput` référence directement le namespace global `google.maps` (pour typer `autocompleteRef` et appeler `google.maps.event.removeListener`). Sous TypeScript strict avec `moduleResolution: "bundler"`, les types globaux issus de packages `@types/*` ne sont pas automatiquement disponibles dans les modules qui ne les importent pas explicitement.

### Solution : directive de référence
L'ajout d'une directive triple-slash en tête de fichier résout le problème proprement :
```typescript
/// <reference types="@types/google.maps" />
```
Cette directive indique au compilateur TypeScript d'inclure les déclarations de types du package `@types/google.maps` pour ce fichier spécifique, sans impacter le reste du projet.

Il aurait été possible d'ajouter `"types": ["google.maps"]` dans `tsconfig.json` pour une inclusion globale, mais cela aurait impacté tous les fichiers du projet — une portée excessive pour un besoin localisé à un seul composant.

---

## 8. Bilan de la semaine

**Positif**
- Phase 2 complétée dans les délais : autocomplétion fonctionnelle, markers numérotés sur la carte, UX fluide (sélection → ajout instantané → input réinitialisé).
- Biais géographique opérationnel : l'utilisateur obtient des suggestions locales dès les premières lettres saisies.
- Architecture améliorée : `APIProvider` au bon niveau, séparation des responsabilités respectée.
- Aucune erreur TypeScript, aucun warning React dans la console après implémentation.

**Points d'attention pour la suite**
- Le bouton "Optimize Route" est encore un simple `alert()`. Le câblage vers le backend (S5) doit rester une priorité.
- Les markers utilisent toujours `google.maps.Marker` (deprecated) — migration vers `AdvancedMarkerElement` planifiée en S8.
- La gestion de l'état des stops reste dans `page.tsx` avec un `useState` local. Quand l'authentification sera introduite en S6, il faudra évaluer si un state manager plus robuste (Context API ou Zustand) devient nécessaire pour partager les stops entre composants.

**Enseignements**
- Le **biais géographique doux** (`setBounds` sans `strictBounds`) est un excellent compromis UX pour des applications localisées : il guide sans contraindre. Ce concept mérite d'être explicité dans le chapitre 7.3 (Intégration Google Maps) du TFE.
- La technique du **`useRef` stable pour les callbacks** (`onAddStopRef`) est un pattern React avancé à documenter dans le chapitre 7.1 — il illustre la différence fondamentale entre `useState` (déclenche un re-render) et `useRef` (mutation silencieuse).
- Le problème de la **cascade CSS avec les éléments injectés par des tiers** (`!important` sur `.pac-container`) est un cas d'école sur les limites du CSS-in-JS et des scoped styles — pertinent pour le chapitre 7.9 (UI/UX).
