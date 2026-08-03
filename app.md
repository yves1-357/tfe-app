# IFOSUPA 

## 9 NextStop 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

#### **Remerciements** 

Avant tout, je tiens à remercier mes encadrants, Bruno Martin et Michel Bernair, pour nos échanges enrichissants tout au long de l'élaboration de ce projet ainsi que pour leurs commentaires avisés sur les corrections à apporter. 

Enfin, je souhaite remercier les différents professeurs de l'IFOSUP Wavre qui m'ont permis d'acquérir les compétences nécessaires à la réalisation de ce travail. 

###### **Jean Yves Iradukunda** 

_Wavre 2026_ 

IFOSUP Wavre                                                                                                                                                                        2 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

###### **Synthèse** 

Ce projet NextStop consiste en le développement d'une application web destinée à la planification et à l'optimisation d'itinéraires comportant plusieurs arrêts. Elle permet à un utilisateur d'ajouter plusieurs adresses, de visualiser ces arrêts sur une carte interactive, puis d'obtenir automatiquement l'ordre de passage optimal grâce à un moteur de résolution combinatoire. 

Contrairement aux solutions grand public existantes, limitées en nombre d'arrêts et dépourvues d'optimisation automatique, ainsi qu'aux solutions professionnelles, coûteuses et orientées entreprise, NextStop se positionne comme une alternative gratuite et accessible sans inscription. L'application répond aussi bien aux besoins d'un particulier organisant un road-trip qu'à ceux d'un professionnel indépendant. 

L'application repose sur une architecture découplée associant un frontend Next.js et un backend FastAPI. Ce dernier orchestre l'intégration de Google Maps Platform pour le géocodage et le calcul de distances, ainsi que la bibliothèque Google OR-Tools pour la résolution du problème d'optimisation de tournée. Une authentification par jetons JWT ainsi qu'une base de données PostgreSQL assure respectivement la sécurité des accès et la persistance des trajets sauvegardés. 

La suite du présent rapport détaille l'analyse des besoins, les choix technologiques opérés, l'architecture retenue, ainsi que les résultats obtenus lors des phases de test, incluant une évaluation de l'utilisabilité auprès d'un échantillon d'utilisateurs. 

IFOSUP Wavre                                                                                                                                                                        3 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

#### **1 Chapitre I : Introduction** 

##### **1.1 Présentation** 



_“Si votre entreprise n’est pas sur Internet, alors votre entreprise fera faillite”_ 

— Bill Gates, Fondateur de Microsoft. 



L’Application NextStop, développée dans le cadre du présent Travail de Fin d’Etudes, est une application web permettant de planifier et d’optimiser des trajets multi-étapes. Concrètement, l’utilisateur ajoute plusieurs arrêts à un itinéraire, les visualise sur une carte interactive, puis obtient automatiquement le meilleur ordre de passage entre ces arrêts. 

Ce document constitue le cahier des charges de référence du projet : il définit précisément ce que l’application doit faire, pour qui, et selon quelles contraintes techniques. Toute décision prise durant le développement se justifie par rapport aux éléments décrits dans les chapitres suivants. 

##### **1.2 Contexte et problématique** 

Cette problématique, je l'ai vécue moi-même avant de la théoriser. Que ce soit en planifiant mes vacances ou en enchaînant des courses en tant que chauffeur Uber, je me suis souvent retrouvé avec une liste d'adresses à visiter et aucune idée du meilleur ordre pour les enchaîner. Google Maps restait mon réflexe, parce qu'il permet au moins d'ajouter plusieurs adresses et de voir le temps de trajet estimé. Le problème, c'est qu'il s'arrête là : il ne me dit jamais dans quel ordre passer par ces arrêts pour rouler le moins possible. En conséquence, je perdais régulièrement du temps et du carburant à cause d'un trajet mal pensé, simplement parce que l'outil ne réalisait pas ce travail à ma place. 

IFOSUP Wavre                                                                                                                                                                        4 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

Cette expérience personnelle illustre une problématique plus large. Organiser un trajet multiétape est une situation courante, que ce soit pour un usage professionnel (une tournée de livraison) ou dans un cadre personnel (les étapes d’un road-trip en famille). Or, les outils disponibles aujourd'hui se répartissent en deux catégories extrêmes, sans réelle solution intermédiaire. 

D'un côté, les applications grand public comme Google Maps ou Waze sont simples et gratuites, mais limitées : dix arrêts maximum sur Google Maps, et aucune optimisation automatique de l'ordre de passage. De l'autre, les solutions professionnelles comme Routific, Circuit ou OptimoRoute offrent une véritable optimisation, mais à un tarif élevé et avec une complexité pensée pour des entreprises, pas pour un particulier ou un indépendant. 

Cette absence de solution intermédiaire se retrouve même chez les grands acteurs de la logistique. bpost utilise en interne le logiciel GeoRoute pour organiser les tournées de ses livreurs, et FedEx a récemment renforcé son système d'optimisation de tournées via l'acquisition de RouteSmart Technologies. Ces outils, bien qu'efficaces, restent réservés à de grandes structures et totalement inaccessibles à un particulier ou à un indépendant, confirmant ainsi le constat tiré de ma propre expérience.<sup>1</sup> 

##### **1.3 Objectifs généraux** 

Ce projet répond à ce vide en développant une application web gratuite, accessible sans inscription, capable d'optimiser automatiquement l'ordre des arrêts d'un trajet multi-étapes qu'il s'agisse d'une tournée professionnelle (livraison, commercial, technicien) ou d'un itinéraire de loisir (road-trip, sortie familiale, visite touristique). Cette double vocation, généralement absente des solutions concurrentes qui se spécialisent soit sur le professionnel (Circuit, Routific), soit sur le loisir (Roadtrippers, Furkot), constitue l'un des axes différenciants du projet. En parallèle, le développement démontre une maîtrise technique complète d'une chaîne full-stack moderne (Next.js, FastAPI, PostgreSQL, algorithmes d'optimisation combinatoire). 

Les objectifs du projet sont les suivants. 

> 1 <u>fedex.com/newsroom Bpost-georoute-software</u> 

IFOSUP Wavre                                                                                                                                                                        5 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

- Concevoir une application web responsive, utilisable aussi bien sur ordinateur que sur mobile. 

- Permettre une utilisation sans compte pour toutes les fonctionnalités principales, afin d'éliminer toute friction d'accès. 

- Intégrer une optimisation automatique de l'ordre des arrêts grâce à une API cartographique et un solveur mathématique. 

- Démontrer, à travers ce projet, une maîtrise des technologies full-stack modernes et d'une architecture sécurisée. 

##### **1.4 Structure du document** 

Ce document s'articule en dix-neuf chapitres : 

- Le chapitre 2 analyse les solutions existantes, du grand public aux logiciels professionnels de logistique. 

- Le chapitre 3 présente la méthodologie itérative adoptée. 

- Les chapitres 4 à 7 définissent le périmètre du projet, ses utilisateurs, et ses exigences fonctionnelles et non fonctionnelles. 

- Les chapitres 8 à 12 abordent les choix technologiques, l'architecture retenue et la modélisation des données. 

- Le chapitre 13 détaille la réalisation technique, notamment l'algorithme d'optimisation. 

- Les chapitres 14 à 18 traitent des contraintes, de la validation, du RGPD, des tests et du déploiement. 

- Le chapitre 19 dresse le bilan du projet. 

- Les annexes rassemblent la documentation complémentaire (glossaire, questionnaire SUS, checklist de sécurité, structure du dépôt Git). 

#### **2 Chapitre II : Analyse de l’existant** 

IFOSUP Wavre                                                                                                                                                                        6 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

##### **2.1 Vue d’ensemble** 

Avant de se lancer dans la conception d'une nouvelle application, il est indispensable de regarder ce qui existe déjà sur le marché. Ce chapitre passe en revue les principales solutions de planification d'itinéraires disponibles aujourd'hui, en séparant clairement celles destinées au grand public de celles pensées pour un usage professionnel. L'objectif n'est pas seulement de lister des concurrents, mais de comprendre précisément pourquoi aucun d'eux ne couvre le besoin identifié dans le chapitre précédent, et donc de justifier la place que NextStop vient occuper 

##### **2.2 Solutions grand public / loisir** 

Google Maps reste, sans surprise, l'outil que la plupart des gens utilisent en premier réflexe. Il bénéficie d'une base cartographique extrêmement complète et de données de trafic en temps réel, ce qui en fait une référence difficile à égaler sur la précision des trajets. Le problème, c'est que sa fonction multi-destinations plafonne à dix arrêts, et surtout qu'elle ne propose aucune optimisation automatique : c'est l'utilisateur qui doit définir lui-même dans quel ordre visiter ses arrêts, exactement la limite que j'ai personnellement rencontrée. Waze souffre du même défaut, son moteur ayant été pensé pour un trajet point à point plutôt que pour gérer plusieurs étapes à la fois. 

Roadtrippers et Furkot se positionnent différemment au sein de cette même catégorie grand public : ces applications s'adressent spécifiquement aux personnes qui préparent un roadtrip, avec des suggestions d'étapes touristiques et une organisation du voyage jour par jour. Elles sont agréables à utiliser pour construire un itinéraire de vacances, mais elles partagent la même faiblesse que Google Maps : aucun moteur ne calcule pour vous le meilleur ordre de passage entre les arrêts. L'utilisateur reste seul responsable de cette organisation, ce qui peut vite devenir fastidieux dès qu'on dépasse quatre ou cinq étapes 

##### **2.3 Solutions professionnelles / livraison** 

IFOSUP Wavre                                                                                                                                                                        7 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

De l'autre côté du marché, on trouve des outils beaucoup plus puissants, mais clairement pensés pour les entreprises. RouteXL propose une optimisation gratuite jusqu'à vingt arrêts et payante au-delà, tandis qu'OptimoRoute est facturé à partir de 39 € par mois et par utilisateur, un tarif qui n'a évidemment aucun sens pour un particulier ou même un indépendant isolé. Routific, RoadWarrior et Onfleet complètent ce paysage avec des fonctionnalités orientées gestion de flotte, intégration CRM et suivi en temps réel des livreurs, des besoins qui dépassent largement le cadre d'un simple road-trip familial. 

Un exemple particulièrement révélateur est Spoke, anciennement connu sous le nom de Circuit avant son changement de nom. Spoke est justement pensé pour le cas d'usage qui a motivé ce projet : c'est une application de planification de tournées destinée aux livreurs, qui permet d'ajouter des arrêts par la voix, la recherche ou le scan, puis d'obtenir automatiquement l'itinéraire le plus rapide et le plus efficace. Sa version gratuite plafonne toutefois à plusieurs arrêts par tournée, et l'optimisation illimitée ainsi que la navigation intégrée deviennent payantes au-delà. Spoke illustre bien la limite structurelle des solutions professionnelles existantes : même quand l'outil est efficace et accessible aux indépendants, la gratuité s'arrête rapidement dès qu’on atteint un certain nombre d'arrêts, ce qui rejoint exactement la frustration vécue avec Google Maps, mais du côté professionnel cette fois.<sup>2</sup> 

Ce qui est intéressant, c'est de voir que même les très grandes entreprises de logistique ont investi massivement dans ce type d'outils, mais toujours en interne. bpost, par exemple, utilise depuis 1999 le logiciel GeoRoute, développé par GIRO et mis à jour en 2015, pour organiser automatiquement les tournées quotidiennes de ses livreurs. FedEx va encore plus loin : son système interne de Dynamic Route Optimization a été renforcé en 2025 par le rachat de RouteSmart Technologies, une entreprise spécialisée dans l'optimisation de tournées depuis plus de quarante ans. Ces exemples confirment une chose importante : l'optimisation de tournées fonctionne très bien techniquement, mais elle reste soit enfermée dans des solutions internes propriétaires, soit limitée par des plafonds gratuits restrictifs comme chez Spoke, laissant un vide réel pour un utilisateur individuel voulant un outil complet et sans limite artificielle. 

##### **2.4 Tableau comparatif** 

_Tableau 1 – Comparaison des solutions existantes de planification d’itinéraires_ 

> 2 <u>Spoke-optmiseur-de-trajets</u> - <u>Spoke.com/route planner</u> 

IFOSUP Wavre                                                                                                                                                                        8 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

|Critère|Google<br>Maps|Spoke|OptimoRoute|GeoRoute(bpo<br>st)|NextStop|
|---|---|---|---|---|---|
|Cible|Grand<br>public|Livreurs<br>indépendants|Entreprises|Interne bpost|Grand<br>Public +<br>tournées<br>légères|
|Gratuit|Oui|Freemium<br>(max 10<br>arrêts)|Payant|Interne|Oui|
|Multi-arrêts optimisées|Non<br>(max<br>10)|Oui (illimités<br>en payant)|Oui|Oui|Oui (max 25<br>arrêts)|
|Sans inscription|Oui|Non|Non|Non|Oui|
|Suivi de<br>tournée/itinéraire|Oui|Oui|Oui|Oui|Oui|
|Interface moderne|Oui|Oui|Moyenne|Non(héritée)|Oui|



Ce tableau met en évidence un positionnement réaliste plutôt qu'un argument marketing exagéré. NextStop ne se présente pas comme une solution sans limite, mais comme une application gratuite et sans inscription capable d'optimiser jusqu'à vingt-cinq arrêts par trajet, un seuil largement suffisant pour couvrir aussi bien un road-trip familial qu'une tournée de livraison de taille modeste, sans pour autant nécessiter l'infrastructure ou le budget d'une solution d'entreprise. Cette limite de vingt-cinq arrêts, fixée au niveau de l'API d'optimisation, permet de garantir un temps de calcul raisonnable tout en couvrant la quasi-totalité des cas d'usage réels d'un particulier ou d'un indépendant, contrairement au plafond de dix arrêts imposés gratuitement par Google Maps ou par Spoke. 

##### **2.5 Vers une analyse structurée des besoins** 

IFOSUP Wavre                                                                                                                                                                        9 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 



Cette analyse comparative permet de confirmer qu'un besoin réel existe, mais elle ne suffit pas à concevoir l'application. Pour passer de ce constat à une solution concrète et rigoureuse, les chapitres suivants procèdent par étapes successives, chacune consolidant la précédente. 

Le chapitre 4 délimite d'abord le périmètre fonctionnel exact du projet, en distinguant ce qui est inclus dans le MVP de ce qui est volontairement mis de côté. Le chapitre 5 identifie ensuite les profils d'utilisateurs visés et les scénarios d'usage associés. Les chapitres 6 et 7 formalisent les exigences fonctionnelles et non fonctionnelles qui en découlent. Les choix technologiques (chapitre 8), l'architecture logicielle (chapitre 9) et la modélisation des données (chapitres 10 à 12) sont ensuite justifiés à la lumière de ces besoins, avant que le chapitre 13 ne détaille la réalisation technique proprement dite. 

Cette démarche progressive garantit que chaque décision technique repose sur une compréhension claire et validée des besoins réels des utilisateurs, plutôt que sur une préférence subjective ou une envie technologique ponctuelle. 

### **3   Chapitre III : Méthodologie de développement** 

IFOSUP Wavre                                                                                                                                                                        10 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

##### **3.1 Approche choisie : modèle itératif** 

Dès la phase de conception, il m'a semblé évident qu'un modèle en cascade classique, où l'on rédige d'abord l'intégralité de l'analyse avant d'écrire la moindre ligne de code, ne convenait pas à ce projet. J'ai donc opté pour une approche itérative, où chaque semaine de travail combine à la fois une avancée concrète sur l'application et une progression sur la rédaction du présent rapport. 

Cette décision découle d'un constat assez répandu chez les étudiants réalisant un travail de fin d’études : repousser toute la rédaction à la fin du développement mène presque systématiquement à une phase de panique dans les dernières semaines, où l'on tente de documenter dans l'urgence des choix techniques pris plusieurs mois auparavant, avec le risque d'en perdre la justification exacte. En écrivant au fil de l'eau, chaque chapitre du rapport a pu être rédigé alors que les décisions qu'il décrit étaient encore fraîches, ce qui a permis d'en conserver la logique et les arbitrages réels plutôt qu'une reconstruction a posteriori. 

Le modèle itératif a également structuré ma gestion du périmètre fonctionnel. Plutôt que de vouloir développer l'ensemble des fonctionnalités imaginées au départ, j'ai privilégié un socle MVP restreint mais pleinement fonctionnel, en repoussant délibérément les fonctionnalités secondaires dans une liste de perspectives futures, développée au chapitre 19. Le principe directeur a été simple à formuler mais exigeant à respecter : mieux vaut un nombre restreint de fonctionnalités qui fonctionnent parfaitement qu'une liste large de fonctionnalités inachevées ou instables. Chaque itération a ainsi consisté à consolider une brique fonctionnelle avant de passer à la suivante, plutôt que d'ouvrir plusieurs chantiers en parallèle. 

Enfin, cette approche m'a offert la flexibilité nécessaire pour absorber les imprévus inévitables sur un projet de cette ampleur. Lorsque le calendrier a dû être resserré en cours de route, il m'a suffi de fusionner certaines étapes de fin de parcours plutôt que de revoir l'ensemble de la planification, ce qui aurait été beaucoup plus délicat avec un modèle séquentiel rigide. 

##### **3.2 Planning détaillé** 

IFOSUP Wavre                                                                                                                                                                        11 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

Le développement s'est organisé en huit itérations successives, chacune associée à un thème directeur précis et à un double livrable : une avancée mesurable côté application, et un nombre de pages rédigées côté rapport. Cette structure permet de retracer la logique de construction du projet, de l'intégration des premières briques techniques jusqu'à la finalisation complète de l'application et du document. 

_Le tableau suivant synthétise cette progression._ 

|Itératio|Thème|Avancée technique|Avancée|
|---|---|---|---|
|n|||rédactionnelle|
|S1|Fondations et intégration<br>de la carte|Intégration de Google Maps<br>comme fond cartographique<br>de l’application|Rédaction de<br>l’introduction et<br>amorce du<br>contexte|
|S2|Autocomplétion et<br>analyse de l’existant|Mise en place de<br>l’autocomplétion d’adresses<br>et affichage des arrêts sur la<br>carte|Finalisation du<br>contexte et<br>rédaction de<br>l’analyse de<br>l’existant|
|S3|Restructuration du<br>backend|Réorganisation du backend<br>en modules distincts<br>(configuration, schémas,<br>routes)|Rédaction de<br>l’analyse des<br>besoins|
|S4|Moteur d’optimisation|Implémentation du solveur<br>d’optimisation et de l’endpoint<br>associé|Rédaction des<br>choix<br>technologiques|
|S5|Intégration complète et<br>diagramme|Connexion du frontend au<br>backend, premier parcours<br>complet fonctionnel|Rédaction de<br>l’architecture et<br>réalisation des<br>diagrammes<br>UML|
|S6|Authentification et<br>persistance|Mise en place des comptes<br>utilisateurs et de la base de|Début du<br>chapitre de|



IFOSUP Wavre                                                                                                                                                                        12 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

|||données, premier essai de<br>mise en ligne|réalisation<br>technique|
|---|---|---|---|
|S7|Sauvegarde et application<br>installable|Ajout de la sauvegarde des<br>trajets et transformation en<br>application (PWA)|Poursuite du<br>chapitre de<br>réalisation<br>technique|
|S8|Consolidation finale|Tests automatisées, mise en<br>conformité RGPD, finalisation<br>du déploiement|Relecture,<br>finalisation du<br>rapport et<br>préparation de<br>la soutenance|



Cette progression illustre une logique volontairement construite : les fondations visuelles et fonctionnelles ont été posées avant l’introduction de la complexité algorithmique, elle-même consolidée avant l’ajout de la couche utilisateur (authentification, sauvegarde), pour ne finir que par la robustesse (tests, conformité, déploiement). 

Cette montée en complexité progressive reflète directement la philosophie du modèle itératif décrite en 3.1 : chaque brique repose sur celle qui la précède, et aucune itération n'a été entamée avant que la précédente ne soit stabilisée. 

#### **4    Chapitre IV : Périmètre du projet** 

IFOSUP Wavre                                                                                                                                                                        13 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

Après avoir identifié, dans le chapitre précédent, le vide laissé par les solutions existantes, ce chapitre vise à délimiter précisément **ce que NextStop fera et ne fera pas** dans le cadre du présent Travail de Fin d'Études. Cette délimitation est indispensable pour deux raisons : elle protège le projet d'une dérive fonctionnelle en cours de développement (le classique *feature creep*), et elle donne au jury une grille de lecture claire pour évaluer la conformité entre les objectifs annoncés et les livrables réels. 

Le périmètre présenté ici a été figé en début de projet, en cohérence avec la contrainte de temps (huit semaines de développement en parallèle de la rédaction) et avec la volonté d'obtenir un produit **fonctionnellement complet plutôt qu'étendu mais fragile**. 

##### **4.1 Fonctionnalités attendues (synthétique)** 

De manière très synthétique, NextStop doit permettre à un utilisateur, en quelques clics et sans obligation de créer un compte, d'effectuer le cycle complet suivant : 

1. **Saisir plusieurs adresses** via un champ d'autocomplétion connecté à Google Places, sans avoir à connaître les coordonnées géographiques exactes. 
2. **Visualiser ces adresses sur une carte interactive**, avec des marqueurs numérotés et un centrage automatique. 
3. **Lancer une optimisation automatique** de l'ordre de passage entre ces arrêts, avec un temps de réponse compatible avec un usage en mobilité (inférieur à deux secondes pour dix arrêts). 
4. **Consulter le résultat** sous forme d'un tracé cartographique (polyline), d'une liste réordonnée des arrêts, et d'indicateurs agrégés (durée totale, distance totale). 
5. Optionnellement, **créer un compte** pour sauvegarder ses trajets, les recharger ultérieurement, et gérer son historique. 

Ce cycle constitue le cœur fonctionnel de l'application. Les sections suivantes détaillent ce qui est inclus dans ce périmètre, ce qui en est explicitement exclu, et la philosophie qui guide ces choix. 

IFOSUP Wavre                                                                                                                                                                        14 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

##### **4.2 Fonctionnalités incluses** 

Le périmètre fonctionnel du MVP est organisé en trois familles : les fonctionnalités accessibles sans compte, celles nécessitant une authentification, et les fonctionnalités transverses qui touchent l'ensemble de l'application. 

**a) Fonctionnalités accessibles sans compte** 

Ces fonctionnalités constituent le cœur d'usage et sont volontairement placées hors du mur d'inscription, afin de garantir une accessibilité immédiate. 

- **Saisie d'arrêts par autocomplétion** : intégration du composant Places de Google Maps Platform, qui restitue à la fois l'adresse formatée, les coordonnées GPS et l'identifiant unique du lieu (Place ID). 
- **Visualisation cartographique** : affichage d'une carte Google Maps interactive centrée dynamiquement sur les arrêts saisis, avec marqueurs numérotés reflétant l'ordre courant. 
- **Optimisation d'itinéraire** : appel à un endpoint backend qui calcule la matrice des durées entre arrêts (Routes API), puis résout le problème du voyageur de commerce (TSP) à l'aide de la bibliothèque Google OR-Tools. Le résultat comprend l'ordre optimal, la durée totale estimée, la distance totale et la polyline encodée du trajet. 
- **Réordonnancement visuel** des arrêts dans la liste selon la solution retournée. 
- **Affichage des indicateurs agrégés** (temps total, distance totale) dans un panneau dédié. 
- **Mode « trajet en cours »** (*trip mode*) : une fois l'optimisation lancée, l'utilisateur peut basculer dans une vue de suivi de tournée qui met en évidence l'arrêt courant sur la carte et dans la liste, affiche la distance et le temps estimés jusqu'à celui-ci, et propose deux actions parallèles pour chaque arrêt : « J'y suis » pour passer manuellement au suivant, ou « Ouvrir dans Google Maps / Waze » pour déléguer la navigation temps réel à l'application de son choix. Ce mode reprend le principe éprouvé des applications de VTC (Uber, Bolt), où le conducteur dispose d'une vue de suivi lisible intégrée à l'application, tout en restant libre de basculer vers son outil de navigation habituel à tout moment. 
- **Lancement de la navigation via une application tierce** : à partir du trajet optimisé ou depuis le mode « trajet en cours », l'utilisateur peut déclencher la navigation dans l'application de son choix (Google Maps ou Waze) via un lien profond (*deep-link*), avec l'ensemble des étapes pré-remplies dans l'ordre calculé par le solveur. Cette approche évite de réinventer une couche de navigation temps réel tout en offrant à l'utilisateur une expérience fluide avec l'outil qu'il utilise déjà au quotidien. 
- **Mode clair / mode sombre** avec préférence système détectée automatiquement. 
- **Interface responsive** utilisable indifféremment sur ordinateur, tablette et smartphone. 

**b) Fonctionnalités nécessitant un compte** 

Ces fonctionnalités concernent la persistance et la personnalisation de l'expérience. Elles n'entravent jamais l'usage de base : un utilisateur peut créer un trajet sans compte, et se voir proposer la création d'un compte uniquement s'il souhaite le sauvegarder. 

- **Inscription et connexion** par couple courriel + mot de passe, avec validation d'unicité et exigence d'un mot de passe d'au moins huit caractères comportant au moins un chiffre. 
- **Persistance d'un trajet** sous un nom donné (adresses, ordre optimisé, durée et distance totales, date de sauvegarde). 
- **Consultation de l'historique** des trajets sauvegardés, avec possibilité de les recharger dans l'interface principale en un clic. 

IFOSUP Wavre                                                                                                                                                                        15 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

- **Suppression d'un trajet individuel** depuis la liste des trajets sauvegardés. 
- **Suppression complète du compte** (droit à l'oubli au sens du RGPD), avec effacement en cascade de tous les trajets associés. 

**c) Fonctionnalités transverses** 

Ces fonctionnalités s'appliquent à l'ensemble de l'application et concernent la qualité technique, la sécurité et la conformité. 

- **Progressive Web App (PWA) installable** : présence d'un manifest, d'icônes aux formats requis, et d'un service worker permettant l'installation de l'application comme une application native depuis le navigateur. 
- **Shell offline** : l'interface reste chargée et navigable sans connexion, même si les appels au backend ou aux API Google échouent tant que la connectivité n'est pas rétablie. 
- **Accessibilité de base au niveau WCAG 2.1 AA** : navigation clavier complète, attributs ARIA sur les composants icon-only, contraste vérifié, indicateurs de focus visibles. 
- **Sécurité applicative** : HTTPS obligatoire en production, hachage des mots de passe avec `bcrypt`, authentification par jetons JWT, restriction des clés d'API par référent, validation Pydantic stricte des entrées côté backend. 
- **Limitation du débit (*rate limiting*)** sur les endpoints coûteux (optimisation notamment), à la fois pour protéger les crédits Google et pour prévenir les abus. 
- **Endpoint de santé** (`/health`) pour la supervision par la plateforme d'hébergement et le pré-réveil du service depuis le frontend. 
- **Journalisation structurée** des événements clés (inscription, connexion, optimisation, erreurs) sans jamais consigner de donnée sensible. 
- **Politique de confidentialité** publiquement accessible, distincte du mur d'authentification (conformité RGPD, cf. chapitre 16). 

##### **4.3 Ce qui est exclu du projet** 

Les fonctionnalités listées ci-dessous ont été volontairement écartées du périmètre du MVP. Ce choix n'est pas un aveu d'insuffisance mais une décision de conception : chacune de ces fonctionnalités aurait requis un effort de développement significatif sans être indispensable à la démonstration de la valeur ajoutée de NextStop. Elles sont documentées ici pour être reprises telles quelles dans le chapitre "Perspectives futures" (chapitre 19). 

IFOSUP Wavre                                                                                                                                                                        16 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

- **Optimisation multi-véhicules (VRP)** : NextStop se limite à un problème du voyageur de commerce (TSP) à un seul véhicule. La généralisation au *Vehicle Routing Problem* multi-véhicules avec capacités et fenêtres de temps sortirait du cadre d'un MVP. 
- **Stratégies d'optimisation multiples** (trajet le plus rapide, le plus court, le plus économe en carburant) : le MVP privilégie systématiquement la durée. L'ajout d'un paramètre de stratégie est identifié comme extension naturelle. 
- **Réordonnancement manuel par glisser-déposer** : l'utilisateur reçoit l'ordre calculé par le solveur, sans possibilité d'*override* manuel en cas de contrainte métier non modélisée. 
- **Export des trajets** aux formats GPX, KML ou PDF : envisageable pour permettre l'intégration avec des applications de navigation tierces, mais hors périmètre du MVP. 
- **Authentification via des fournisseurs tiers** (OAuth avec Google, Apple ou Facebook) : simplifierait l'inscription mais ajoute des dépendances externes non essentielles à la démonstration technique. 
- **Notifications push** en cas de changement de trajet, d'alerte de trafic ou de rappel : nécessiterait la gestion d'un canal *push* et une infrastructure additionnelle. 
- **Mode collaboratif** : partage d'un trajet entre plusieurs utilisateurs, tournées d'équipe. Hors périmètre. 
- **Suggestions de points d'intérêt le long du trajet** (stations-service, restaurants, aires de repos) : intégration Places supplémentaire, non essentielle. 
- **Tableau de bord analytique** : statistiques d'usage, économies de temps et de carburant, empreinte carbone estimée. Fonctionnalité de valeur mais non indispensable au MVP. 
- **Instructions de navigation temps réel pas-à-pas** : NextStop propose un mode « trajet en cours » (cf. 4.2.a) qui affiche visuellement la progression et l'arrêt courant, mais ne développe pas de couche de navigation temps réel comprenant instructions vocales pas-à-pas (« Dans 200 mètres, tournez à droite »), recalcul dynamique en cas de déviation d'itinéraire, ou alertes trafic. Cette dimension est intentionnellement déléguée aux applications spécialisées (Google Maps, Waze), accessibles en un clic depuis le mode « trajet en cours » via un lien profond. Réimplémenter cette couche représenterait un projet à part entière et n'apporterait aucune valeur différenciante par rapport aux solutions existantes qui la maîtrisent depuis plus de vingt ans. 

##### **4.4 Philosophie de l’application** 

Le périmètre défini plus haut découle directement de quatre principes structurants, énoncés ici pour servir de grille de lecture au reste du document. 

**Principe 1 — Un MVP restreint mais complet plutôt qu'une liste étendue mais fragile.** 
Le choix a été fait très tôt de privilégier un socle fonctionnel réduit, mais entièrement fonctionnel de bout en bout, plutôt qu'une liste ambitieuse de fonctionnalités partiellement implémentées. Cette approche, revendiquée dans la méthodologie itérative du chapitre 3, garantit un livrable démontrable et défendable en soutenance, sans zones d'ombre ni fonctionnalités "boîte noire". 

IFOSUP Wavre                                                                                                                                                                        17 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

**Principe 2 — Zéro friction à l'entrée.** 
Aucune fonctionnalité de base ne doit être conditionnée à la création d'un compte. Cette décision, atypique par rapport aux solutions concurrentes qui imposent quasi-systématiquement une inscription, s'appuie sur un constat : les utilisateurs cherchant à optimiser un trajet ponctuel abandonnent massivement les applications qui exigent une authentification préalable. NextStop conserve donc l'inscription comme une valeur ajoutée (persistance, historique) et non comme une barrière. 

**Principe 3 — Gratuité pour l'utilisateur final.** 
NextStop est distribué gratuitement, sans limitation artificielle du nombre de trajets ni murs payants sur les fonctionnalités essentielles. La seule limite technique est le nombre maximal de vingt-cinq arrêts par trajet, imposé pour garantir un temps de calcul raisonnable et pour respecter les quotas des API Google Cloud utilisées. Ce plafond est documenté et justifié, non pas contourné par un abonnement. 

**Principe 4 — Sécurité et respect de la vie privée par défaut.** 
Toutes les décisions techniques sensibles ont été prises en tenant compte du RGPD et des bonnes pratiques de sécurité applicative dès la conception (*privacy by design*, *security by design*). Les mots de passe sont hachés avec `bcrypt`, les jetons JWT sont signés avec un secret rotable, les entrées sont validées côté serveur, les journaux ne contiennent aucune donnée sensible, et l'utilisateur peut exercer son droit à l'oubli en un clic. Ces mécanismes sont détaillés dans les chapitres 7 (exigences non fonctionnelles) et 16 (RGPD). 

Ces quatre principes constituent la boussole du projet. Toute décision technique ou fonctionnelle prise dans les chapitres suivants est cohérente avec eux, ou justifie explicitement pourquoi une exception est acceptée. 

IFOSUP Wavre                                                                                                                                                                        18 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

#### **5   Chapitre V : Public cible et utilisateurs** 

Le chapitre précédent a défini **ce que fait** NextStop. Ce chapitre s'attache à décrire **pour qui** l'application est conçue. Deux profils d'utilisateurs génériques sont d'abord distingués selon leur relation avec le système (authentifié ou non), puis quatre personas illustrent concrètement la diversité des cas d'usage. Le chapitre se termine par un tableau des cas d'utilisation qui croise les acteurs et les fonctionnalités, servant de base à la modélisation UML du chapitre 12. 

L'existence de deux profils distincts (anonyme et authentifié) est une conséquence directe du principe de zéro friction énoncé en 4.4 : elle traduit, dans le modèle d'acteurs, l'engagement de rendre l'application immédiatement utilisable sans inscription. 

##### **5.1 Profil 1 — Utilisateur anonyme (non connecté)** 

L'utilisateur anonyme représente **le cas d'usage par défaut** de NextStop. Il accède à l'application sans s'authentifier, sans avoir laissé aucune donnée personnelle, et peut néanmoins bénéficier de la totalité des fonctionnalités de planification et d'optimisation. 

**Portée fonctionnelle.** L'utilisateur anonyme peut : 

- consulter la carte interactive et naviguer sur celle-ci ; 
- ajouter, modifier et supprimer des arrêts via l'autocomplétion d'adresses ; 
- lancer une optimisation d'itinéraire jusqu'à vingt-cinq arrêts par requête ; 
- visualiser le trajet optimisé (polyline, marqueurs, ordre) ainsi que les indicateurs agrégés (durée, distance) ; 
- basculer dans le mode « trajet en cours » pour suivre la progression arrêt par arrêt, avec la possibilité à tout moment de basculer vers Google Maps ou Waze pour la navigation temps réel ; 
- basculer entre mode clair et mode sombre ; 
- installer l'application en tant que PWA sur son appareil. 

**Limites.** En revanche, il ne peut pas : 

- sauvegarder un trajet sur le serveur ; 
- retrouver un trajet précédemment calculé une fois la session close ; 

IFOSUP Wavre                                                                                                                                                                        19 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

- accéder à un historique. 

**Données conservées.** Aucune. Aucun cookie de suivi, aucun stockage serveur associé, aucun profil implicite. Les seules données côté client (préférence de thème, éventuelle liste de travail en cours) restent dans le navigateur de l'utilisateur et ne sont jamais transmises. 

Ce profil est celui qui garantit à NextStop la conformité avec son principe de zéro friction et rend l'application immédiatement démontrable devant un jury sans étape préalable d'inscription. 

##### **5.2 Profil 2 — Utilisateur connecté** 

L'utilisateur connecté est un utilisateur anonyme qui a choisi de créer un compte pour bénéficier de fonctionnalités de persistance. Cette bascule est **entièrement optionnelle** et proposée seulement au moment où elle a du sens (par exemple lors d'une tentative de sauvegarde). 

**Portée fonctionnelle supplémentaire.** En plus des capacités du profil anonyme, il peut : 

- sauvegarder un trajet sous un nom personnalisé ; 
- consulter et recharger la liste de ses trajets précédemment sauvegardés ; 
- supprimer un trajet individuel ou l'intégralité de son compte ; 
- consulter et modifier les informations de son compte. 

**Données conservées côté serveur.** 
- Adresse courriel (identifiant de connexion). 
- Empreinte du mot de passe (hachée avec `bcrypt`, jamais stockée en clair). 
- Date de création du compte. 
- Liste des trajets sauvegardés, chacun contenant les arrêts, l'ordre optimisé, les indicateurs agrégés et la date de sauvegarde. 

**Droits.** L'utilisateur connecté peut, à tout moment et sans justification, demander la suppression complète et définitive de son compte via un bouton dédié dans les paramètres. Cette action déclenche une suppression en cascade de tous ses trajets, sans conservation d'archive. Ce mécanisme matérialise le droit à l'oubli garanti par le RGPD. 

IFOSUP Wavre                                                                                                                                                                        20 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

##### **5.3 Persona 1 — Famille en road trip / vacances (logique plaisir vs performance)** 

**Identité.** Sarah, 38 ans, ingénieure, mariée, mère de deux enfants âgés de 6 et 9 ans. Habite à Bruxelles. 

**Contexte d'usage.** À l'approche des vacances d'été, Sarah prépare un road-trip d'une journée dans les Ardennes belges avec sa famille. Elle a repéré une dizaine d'étapes potentielles (un point de vue, un château, un restaurant familial recommandé, un lac pour se baigner, une chocolaterie, quelques villages classés) et souhaite les enchaîner sans perdre de temps sur la route, pour maximiser le temps réellement passé sur place avec les enfants. 

**Besoins clés.** 
- Ajouter rapidement des adresses trouvées dans des blogs ou des cartes touristiques. 
- Visualiser l'ensemble des étapes sur une carte pour avoir une vue d'ensemble avant de partir. 
- Obtenir un ordre optimisé qui limite les trajets en voiture, donc les crises de nerfs à l'arrière. 
- Pouvoir sauvegarder cette planification pour la retrouver le jour du départ. 

**Frustrations avec les outils existants.** 
- Google Maps plafonne à dix arrêts et n'optimise pas leur ordre, ce qui l'oblige à recommencer plusieurs itinéraires manuellement pour comparer. 
- Les applications spécialisées road-trip (Roadtrippers, Furkot) proposent une organisation par jour mais n'offrent pas d'optimisation véritablement automatique et sont partiellement payantes. 
- Elle refuse par principe de créer un compte pour un outil qu'elle n'utilise qu'occasionnellement. 

**Ce que NextStop lui apporte.** 
Sarah peut, en quelques minutes, saisir ses dix étapes, obtenir un ordre optimisé, visualiser le résultat, et lancer la navigation vers le premier arrêt via un simple lien vers Google Maps. Elle utilise l'application sans compte pour cette planification ponctuelle. Si le trajet lui plaît, elle peut créer un compte pour le sauvegarder et le retrouver l'été suivant. 

Ce persona illustre la **logique plaisir** : l'utilisateur ne cherche pas à maximiser un chiffre d'affaires ni à respecter des contraintes horaires strictes, mais à optimiser son confort et son temps de qualité. 

IFOSUP Wavre                                                                                                                                                                        21 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

##### **5.4 Persona 2 — Marc, livreur indépendant** 

**Identité.** Marc, 42 ans, ancien salarié reconverti en livreur indépendant depuis trois ans. Travaille en région liégeoise pour le compte de plusieurs petites PME (fleuriste, épicerie fine, artisans) qui lui confient chaque matin une liste de livraisons à effectuer dans la journée. 

**Contexte d'usage.** Chaque matin, Marc reçoit par courriel ou par WhatsApp une liste de dix à vingt adresses à livrer. Il doit organiser sa tournée le plus efficacement possible pour rentrer chez lui avant seize heures, limiter sa consommation de carburant et respecter d'éventuelles fenêtres horaires (certaines boutiques ferment entre midi et quatorze heures). 

**Besoins clés.** 
- Saisir rapidement les adresses reçues, idéalement en collant les listes brutes. 
- Obtenir un ordre de tournée optimisé pour minimiser le temps total. 
- Sauvegarder les tournées récurrentes (certains clients sont livrés plusieurs fois par semaine, aux mêmes adresses). 
- Pouvoir utiliser l'application depuis son smartphone dans le camion, sans avoir à ouvrir un ordinateur. 

**Frustrations avec les outils existants.** 
- Google Maps ne permet pas plus de dix arrêts et n'optimise pas leur ordre. 
- Circuit (Spoke), qui répondrait exactement à son besoin, devient payant au-delà d'un certain nombre d'arrêts par tournée, ce qui grève sa marge d'indépendant. 
- Les solutions professionnelles (OptimoRoute, Routific) sont hors de prix pour un travailleur seul et surdimensionnées par rapport à son besoin. 

**Ce que NextStop lui apporte.** 
Marc crée un compte, sauvegarde ses tournées récurrentes, en lance de nouvelles chaque matin en quelques secondes, et bénéficie de l'application en tant que PWA installée sur son smartphone. La limite de vingt-cinq arrêts couvre largement ses journées les plus chargées. 

Ce persona illustre le **cas d'usage professionnel léger** : celui d'un indépendant qui a un vrai besoin métier mais pour qui les solutions d'entreprise sont inadaptées, à la fois économiquement et fonctionnellement. 

IFOSUP Wavre                                                                                                                                                                        22 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

##### **5.5 Persona 3 — Sophie, commerciale terrain** 

**Identité.** Sophie, 30 ans, commerciale terrain pour une entreprise de matériel médical. Basée à Namur, elle couvre la Wallonie et se déplace en permanence pour rencontrer médecins, cliniques et pharmacies. 

**Contexte d'usage.** Chaque semaine, Sophie planifie ses rendez-vous du lundi au vendredi. Elle organise elle-même son agenda, en tenant compte de la disponibilité de ses interlocuteurs, mais chaque journée reste à optimiser individuellement : elle a en général huit à dix rendez-vous par jour, répartis dans une même sous-région, et cherche à minimiser le temps de route pour maximiser le temps passé en clientèle. 

**Besoins clés.** 
- Optimiser rapidement une journée-type de huit à dix rendez-vous. 
- Retrouver et modifier facilement les tournées d'une semaine sur l'autre (les clients récurrents reviennent régulièrement). 
- Bénéficier d'une interface propre et lisible, présentable devant un client si nécessaire. 
- Pouvoir consulter l'application indifféremment sur son ordinateur (au bureau, en préparation) et sur son smartphone (en déplacement). 

**Frustrations avec les outils existants.** 
- Le CRM de son entreprise ne propose aucune fonction d'optimisation d'itinéraire. 
- Google Maps l'oblige à réordonner ses arrêts manuellement, ce qui lui prend une dizaine de minutes chaque matin. 
- Les solutions professionnelles imposeraient un abonnement supplémentaire non couvert par son employeur. 

**Ce que NextStop lui apporte.** 
Sophie crée un compte, sauvegarde ses tournées hebdomadaires typées par zone (« Brabant wallon », « Charleroi », « Liège ouest ») et les rejoue chaque semaine en ajustant deux ou trois arrêts. Elle gagne environ dix minutes par matinée. 

Ce persona illustre un usage **professionnel régulier**, similaire à celui de Marc mais dans un secteur différent, et met en valeur l'importance de la fonction de sauvegarde et de rechargement. 

IFOSUP Wavre                                                                                                                                                                        23 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

##### **5.6 Persona 4 — Amélie, infirmière libérale à domicile** 

**Identité.** Amélie, 34 ans, infirmière libérale installée en région namuroise depuis cinq ans. Elle assure chaque jour entre huit et douze visites à domicile chez ses patients : injections, soins de plaies, prises de sang, administration de médicaments. Elle se déplace en voiture sur un secteur couvrant plusieurs communes. 

**Contexte d'usage.** La liste de patients d'Amélie évolue chaque semaine : certains sont suivis quotidiennement, d'autres ponctuellement. Elle reçoit ses ordonnances par courrier ou par son logiciel médical, mais aucun outil ne lui propose un itinéraire optimisé. Elle organise elle-même ses tournées en tenant compte des contraintes horaires de certains patients (un patient diabétique doit recevoir son insuline avant huit heures trente, un autre ne peut recevoir des soins qu'après sa rééducation du matin). Mal organiser sa tournée ne signifie pas seulement perdre du temps — cela peut signifier arriver en retard chez un patient qui en a besoin à heure fixe. 

**Besoins clés.** 
- Construire rapidement une tournée cohérente à partir de la liste de patients du jour, en tenant compte de leur localisation géographique. 
- Minimiser les distances parcourues pour limiter la fatigue et les frais kilométriques, qui sont partiellement remboursés selon un barème fixe. 
- Sauvegarder les tournées récurrentes (les patients chroniques reviennent chaque semaine avec les mêmes adresses). 
- Disposer d'une application accessible en quelques secondes depuis son smartphone entre deux visites, sans nécessiter une connexion permanente. 

**Frustrations avec les outils existants.** 
- Google Maps ne permet que dix arrêts et n'optimise pas leur ordre : Amélie doit réordonner manuellement ses visites, ce qui lui prend parfois une vingtaine de minutes le matin. 
- Les logiciels de gestion d'infirmières libérales (comme Albus ou Vivalto) gèrent la facturation et les ordonnances, mais n'offrent aucune optimisation de tournée. 
- Les solutions professionnelles de planification d'itinéraires sont pensées pour des flottes d'entreprise et facturées à des tarifs inaccessibles pour une praticienne indépendante. 

**Ce que NextStop lui apporte.** 
Amélie crée un compte et sauvegarde ses patients récurrents par zone géographique. Chaque matin, elle charge la tournée de base et ajuste les deux ou trois patients ponctuels de la journée. En moins d'une minute, elle dispose d'un itinéraire optimisé qu'elle lance en mode trajet en cours, avec un renvoi vers Google Maps arrêt par arrêt. Elle réduit ses temps de trajet d'environ quinze à vingt minutes par journée, ce qui représente une à deux visites supplémentaires possibles par semaine. 

Ce persona illustre un **cas d'usage professionnel de santé** : il est délibérément distinct des personas précédents par son secteur d'activité, ses contraintes horaires médicales, et la nature de ses déplacements. Il démontre que le besoin d'optimisation de tournée dépasse largement la logistique commerciale pour toucher des métiers du soin où la ponctualité a une dimension éthique directe. 

IFOSUP Wavre                                                                                                                                                                        24 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

##### **5.7 Tableau des cas d’utilisation** 

Le tableau ci-dessous croise les acteurs identifiés (utilisateur anonyme, utilisateur connecté) avec les principaux cas d'utilisation supportés par NextStop. Il sert d'entrée pour la construction du diagramme de cas d'utilisation UML détaillé au chapitre 12. 

_Tableau 2 – Cas d'utilisation par acteur_ 

|Cas d’utilisation|Utilisateur anonyme|Utilisateur connecté|
|---|---|---|
|Consulter la carte|✓|✓|
|Ajouter un arrêt (autocomplétion)|✓|✓|
|Modifier ou supprimer un arrêt|✓|✓|
|Lancer une optimisation d'itinéraire|✓|✓|
|Visualiser le trajet optimisé (polyline, ordre, indicateurs)|✓|✓|
|Lancer le mode « trajet en cours » (suivi arrêt par arrêt)|✓|✓|
|Ouvrir le trajet dans Google Maps ou Waze (deep-link)|✓|✓|
|Basculer entre mode clair et mode sombre|✓|✓|
|Installer l'application (PWA)|✓|✓|
|Créer un compte|✓ (bascule vers profil 2)|—|
|Se connecter|✓ (bascule vers profil 2)|—|
|Se déconnecter|—|✓|
|Sauvegarder un trajet sous un nom|✗|✓|
|Consulter l'historique des trajets sauvegardés|✗|✓|
|Recharger un trajet sauvegardé|✗|✓|
|Supprimer un trajet sauvegardé|✗|✓|
|Supprimer définitivement son compte (RGPD)|✗|✓|
|Consulter la politique de confidentialité|✓|✓|

**Lecture du tableau.** La colonne "Utilisateur anonyme" recouvre l'intégralité du cœur fonctionnel de l'application, ce qui matérialise dans le modèle d'acteurs la promesse d'usage sans friction énoncée au chapitre 4. La colonne "Utilisateur connecté" ajoute exclusivement les fonctionnalités liées à la persistance et à la gestion du compte, sans jamais retirer ou dégrader une capacité de l'utilisateur anonyme. 

IFOSUP Wavre                                                                                                                                                                        25 

NextStop – Optimisation de tournées multi-arrêts                                                               Septembre 2026 

Cette lecture prépare directement les chapitres suivants : le chapitre 6 formalise chacun de ces cas d'utilisation en exigences fonctionnelles précises, le chapitre 7 leur associe des exigences non fonctionnelles (temps de réponse, sécurité, accessibilité), et le chapitre 12 en dérive le diagramme UML de cas d'utilisation. 



