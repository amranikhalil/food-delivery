# Bilan technique — Redesign du site Benny's

> Périmètre : le site client (`/` et `/commande/[id]`) de l'application Next.js `restaurant-dashboard`.
> Le tableau de bord (`/dashboard`) et les applications mobiles (`driver-app`, `user-side`) n'ont pas été redessinés.

## 1. Résumé de l'évolution

### 1.1 Avant / après

| | Avant | Après |
|---|---|---|
| **Look** | Interface générique : fond gris, cartes blanches, boutons verts, emojis | Identité Benny's : crème, rouge diner, encre noire, damier, typographie de menu imprimé |
| **Page d'accueil** | Un seul fichier de 308 lignes (`pages/index.js`) qui mélange données, panier, formulaire et affichage | Une page de 75 lignes qui assemble des composants spécialisés (header, hero, sections du menu, infos, panier) |
| **Chargement** | Écran « Chargement du menu… » puis lecture Firestore dans le navigateur | Page générée côté serveur avec le menu déjà dedans : contenu visible tout de suite |
| **Si Firestore tombe** | Message d'erreur, page vide | Le menu Benny's intégré s'affiche quand même |
| **Langage** | JavaScript | TypeScript pour tout le code client nouveau ou modifié (le dashboard reste en JS) |
| **Panier** | Barre verte en bas, checkout qui remplace la page | Tiroir latéral animé en 2 étapes (panier → livraison), panier conservé si on rafraîchit la page |
| **Suivi de commande** | Liste d'étapes grise avec emojis | Page aux couleurs Benny's, barre de progression animée, indicateur « en direct » |
| **Images** | Balises `<img>` brutes | `next/image` : conversion WebP, tailles adaptées à l'écran, chargement différé |
| **Animations** | Aucune | Framer Motion : entrée du hero, apparitions au scroll, « lancer » de la photo dans le panier, menu mobile… |

### 1.2 Principales améliorations

- **Design** : fidèle à la maquette `desgin-reference/` (couleurs, polices, espacements, damier, angles inclinés). Le design system est traduit en tokens Tailwind réutilisables.
- **Performance** : génération statique avec rafraîchissement automatique (ISR), polices auto-hébergées, images optimisées.
- **Fiabilité** : un menu de secours garde le site utilisable. Les catégories mal écrites (« Pizzas » et « pizzas ») sont fusionnées en une seule section.
- **Maintenabilité** : un composant par responsabilité, des types partagés, une seule source de vérité pour le menu (`menu.json`), utilisée par le site et par le script de seed.
- **Expérience** : le panier survit au rafraîchissement, le formulaire est pré-rempli avec les infos du dernier client, les erreurs s'affichent clairement.

## 2. Architecture technique choisie

### 2.1 Structure des dossiers

```
restaurant-dashboard/
├─ public/menu/              Photos du menu (copiées depuis desgin-reference/assets, renommées)
├─ scripts/seed.mjs          Remplit Firestore avec le menu Benny's (lit src/data/menu.json)
├─ src/
│  ├─ pages/
│  │  ├─ index.tsx           Page d'accueil : charge les données, assemble les sections
│  │  ├─ commande/[id].tsx   Suivi de commande en temps réel
│  │  ├─ _app.tsx            Polices + réglage « animations réduites »
│  │  ├─ _document.tsx       <html lang="fr">, couleur du navigateur mobile
│  │  └─ dashboard.js        (inchangé)
│  ├─ components/
│  │  ├─ site/               Composants du site client
│  │  │  ├─ Header.tsx         En-tête collant, nav active, bouton Commander, menu mobile
│  │  │  ├─ Hero.tsx           Titre, boutons, prix, visuel (cercle, photo, badge)
│  │  │  ├─ MenuSections.tsx   Sections « liste » (burgers) et « cartes » (tenders)
│  │  │  ├─ SectionTitle.tsx   Titre à damier / titre rouge souligné
│  │  │  ├─ Infos.tsx          Section « Passez nous voir. » + footer
│  │  │  ├─ CartDrawer.tsx     Tiroir panier + formulaire de livraison
│  │  │  ├─ QtyControl.tsx     Bouton « Ajouter » → sélecteur − 1 +
│  │  │  ├─ DishImage.tsx      Photo d'un plat (ou emoji si pas de photo)
│  │  │  ├─ Logo.tsx, Checker.tsx, icons.tsx
│  │  ├─ motion/index.tsx    Briques d'animation réutilisables (Reveal, WordsReveal, CountUp)
│  │  └─ Menu/, Orders/, …   Dashboard (inchangé, sauf 2 champs dans Settings)
│  ├─ data/
│  │  ├─ menu.json           LE menu Benny's (catégories, plats, prix, photos)
│  │  └─ brand.ts            Textes de marque + valeurs par défaut (adresse, horaires…)
│  ├─ hooks/useCart.ts       Logique du panier
│  ├─ lib/
│  │  ├─ menu.ts             Lecture Firestore, menu de secours, regroupement en sections
│  │  ├─ orders.ts           Validation du formulaire + écriture de la commande
│  │  ├─ flyToCart.ts        Animation « photo lancée dans le panier »
│  │  ├─ fonts.ts            Chargement des 3 polices Google
│  │  └─ format.ts           Prix (« 1 050 DA »), téléphone, statuts
│  ├─ types/menu.ts          Types partagés : Dish, Restaurant, MenuSection, CartLine
│  └─ styles/globals.css     Damier, boutons, styles de menu, keyframes
├─ tailwind.config.js        Tokens du design system
└─ tsconfig.json             Remplace jsconfig.json (alias @/ conservé)
```

**Le principe** : on sépare les **données** (`data/`), la **logique** (`lib/`, `hooks/`) et l'**affichage** (`components/`). Une page ne fait qu'assembler. Pour changer un prix, on ne touche pas au JSX. Pour changer le style d'une carte, on ne touche pas à Firestore.

### 2.2 Technologies et librairies

| Choix | Pourquoi |
|---|---|
| **Next.js 13.3 (Pages Router), conservé** | C'est ta stack actuelle. Migrer vers l'App Router aurait tout réécrit, y compris le dashboard, sans bénéfice visible pour le client. |
| **TypeScript 5.4 (ajouté)** | Tu l'avais demandé. Il attrape les erreurs avant l'exécution (prix en texte au lieu de nombre, champ oublié…). `allowJs: true` permet de garder le dashboard en JS : la migration est progressive, sans big-bang. |
| **Tailwind 3.3, conservé** | Les tokens du design system (`red`, `ink`, `cream`, `text-display-xl`, `tracking-eyebrow`…) sont déclarés dans `tailwind.config.js`. Les noms de classes reprennent ceux de la maquette. |
| **Framer Motion 11 (ajouté)** | La référence pour les animations React : ressorts physiques, déclenchement au scroll, animations de sortie (tiroir, menu mobile). Il respecte le réglage « réduire les animations » du téléphone. Le faire à la main en CSS + JS aurait demandé beaucoup plus de code fragile. |
| **`next/font` (polices)** | Fraunces, Archivo et Kaushan Script sont téléchargées au build et servies par ton site : pas d'appel à Google au chargement, pas de « saut » du texte. |
| **`next/image` (images)** | Conversion WebP automatique, tailles adaptées à l'écran, chargement différé hors écran. |
| **Firebase 9, conservé** | Même base, mêmes collections (`restaurants`, `dishes`, `orders`, `orderDishes`) : le dashboard et les apps mobiles continuent de fonctionner. |

### 2.3 Décisions d'architecture importantes

1. **Rendu statique + rafraîchissement (ISR)** : `getStaticProps` dans `pages/index.tsx`
   - Le serveur lit Firestore et génère la page HTML avec le menu dedans.
   - Toutes les **30 secondes** au plus, la page est régénérée en arrière-plan (5 s si Firestore était injoignable).
   - Dans le navigateur, le menu est relu une fois après l'affichage, pour que les changements faits dans le dashboard apparaissent tout de suite.
   - Résultat : affichage instantané, bon référencement Google, et données à jour.

2. **Menu de secours intégré** : `FALLBACK_DISHES` dans `lib/menu.ts`
   - Si Firestore ne répond pas (délai max de 6 s) ou s'il n'y a aucun plat, le site affiche le menu de `menu.json`.
   - Les identifiants sont **les mêmes** que ceux du script de seed (`demo-classic`, `demo-tenders-10`…). Une commande passée depuis le menu de secours reste donc cohérente avec la base.

3. **Une seule source de vérité pour le menu** : `src/data/menu.json`
   - Lue par le site (menu de secours) **et** par `scripts/seed.mjs`. Impossible d'avoir deux menus différents.

4. **Mise en page pilotée par les données** : `toSections()` dans `lib/menu.ts`
   - Les plats sont regroupés par catégorie. Les sections alternent automatiquement « liste » (style Burgers) et « cartes » (style Tenders), comme sur le menu imprimé.
   - Une nouvelle catégorie ajoutée dans le dashboard apparaît toute seule, avec son lien dans la navigation.
   - L'ordre suit le champ `order` des plats. Les plats ajoutés depuis le dashboard, qui n'en ont pas, passent à la fin, triés par nom.

5. **Prix du hero calculés, pas écrits en dur** : `HERO_STATS` dans `data/brand.ts`
   - « Burgers dès 350 DA » = le prix le plus bas de la catégorie Burgers. Si tu changes un prix dans le dashboard, le hero suit.

6. **Logique sortie des composants**
   - `hooks/useCart.ts` : quantités, total, sauvegarde en `sessionStorage`.
   - `lib/orders.ts` : validation et écriture Firestore. Même format qu'avant, donc rien ne casse côté dashboard et apps mobiles.

7. **Prix formatés à l'identique serveur / navigateur** : `formatDA()` dans `lib/format.ts`
   - L'ancien `toLocaleString("fr-DZ")` peut donner un espace différent entre Node et le navigateur, ce qui provoque une erreur d'hydratation React. Le nouveau formatage est fait à la main et donne toujours « 1 050 DA ».

## 3. Parcours de commande

1. Le client clique sur **« Ajouter »** : la photo « vole » vers le bouton **Commander**, qui rebondit et affiche le nombre d'articles.
2. **Commander** ouvre le tiroir. S'il est vide, la page défile jusqu'au menu.
3. Étape **Panier** : modifier les quantités, voir sous-total, livraison et total.
4. Étape **Livraison** : nom, téléphone (format algérien vérifié), adresse, remarque. Paiement en espèces.
5. Envoi : la commande est écrite dans `orders` et `orderDishes` (format inchangé), puis le client est redirigé vers `/commande/<id>`.
6. Le **suivi** se met à jour en direct (`onSnapshot`) quand le restaurant change le statut dans le dashboard.

## 4. Points techniques importants

### 4.1 Images et assets
- Les 10 photos de la maquette sont copiées dans `public/menu/` avec des **noms lisibles** (`burger-classic.png`, `tenders-10.png`…) au lieu des noms en hash.
- **Fond des photos** : il est exactement de la couleur crème du site (`#F6F5E8`, mesurée au pixel), donc la nourriture paraît détourée sans traitement. La maquette utilisait un mode de fusion « multiply ». Je l'ai retiré, car il assombrissait légèrement le fond et faisait apparaître un cadre.
- `DishImage.tsx` choisit automatiquement :
  - photo locale, Cloudinary ou postimg → optimisée par `next/image` (hôtes autorisés dans `next.config.js`) ;
  - autre lien → affichée telle quelle (`unoptimized`) ;
  - pas de photo → l'emoji du plat dans un cercle pointillé.
- La photo du hero est chargée en **priorité**. Toutes les autres attendent d'être proches de l'écran.

### 4.2 Performance
- **HTML pré-généré** : aucun écran de chargement, contenu visible dès le premier affichage.
- **Taille** : page d'accueil 20,8 kB de code propre, 213 kB au premier chargement, dont environ 80 kB de React/Next partagés par toutes les pages. Framer Motion représente une bonne part du reste.
- **Polices** auto-hébergées, `display: swap` : le texte s'affiche tout de suite.
- **Animations** fluides : elles n'utilisent que `transform` et `opacity`, que le navigateur anime sans recalculer la mise en page. Chaque animation au scroll ne se joue **qu'une fois**.
- **Délai max de 6 s** sur Firestore : un build ou une page ne reste jamais bloqué.

### 4.3 Accessibilité
- **Animations réduites** : si le téléphone demande moins d'animations, Framer Motion coupe les mouvements, le damier s'arrête, l'effet « photo lancée » est désactivé.
- **Structure** : un seul `h1`, des `h2` par section reliés par `aria-labelledby`, des `article` pour les plats, une `nav` nommée.
- **Titres animés mot par mot** : le titre complet reste lisible par les lecteurs d'écran (`aria-label`), les morceaux animés sont masqués pour eux.
- **Boutons explicites** : « Ajouter Classic au panier », « Retirer un Classic », « Commander, 2 articles dans le panier ».
- **Tiroir et menu mobile** : `role="dialog"`, fermeture avec Échap, focus placé dans le panneau puis rendu au bouton d'origine, défilement de la page bloqué.
- **Contrastes** : le rouge foncé `#B71C24` est utilisé pour les petits textes rouges (ratio 4,5:1 sur crème, comme demandé par le design system).
- **Tactile** : tous les boutons font au moins 44 px de haut.
- **Formulaire** : vrais `<label>`, `autocomplete` (nom, téléphone, adresse), clavier téléphone sur mobile, erreurs annoncées (`role="alert"`).

### 4.4 Bonnes pratiques appliquées
- Types stricts (`strict: true`). `tsc`, ESLint et `next build` passent sans erreur ni avertissement.
- Données Firestore **nettoyées** à l'entrée (`toDish`, `toRestaurant`) : un champ manquant ou mal typé ne fait pas planter la page.
- Pas de duplication : un seul formatage de prix, un seul menu, des styles de bouton partagés (`.btn`, `.btn-red`…).
- Commentaires courts, là où le *pourquoi* n'est pas évident.
- Compatibilité préservée : collections, champs et format des commandes identiques, donc le dashboard et les apps mobiles fonctionnent comme avant.

## 5. Ce qui est prêt pour la suite

### 5.1 Facile à modifier

| Je veux changer… | Où | Comment |
|---|---|---|
| Un prix, un plat, une photo | **Dashboard** → Menu | Visible sur le site en 30 s max (immédiatement après rechargement) |
| Adresse, téléphone, horaires, Instagram, frais de livraison | **Dashboard** → Paramètres | Les champs « Horaires » et « Instagram » ont été ajoutés |
| Le menu de démo / de secours | `src/data/menu.json` | Puis `npm run seed` pour l'envoyer dans Firestore |
| Titre, accroche, textes de marque | `src/data/brand.ts` | `headline`, `lead`, `infosTitle`, `since`… |
| Les 3 prix sous le hero | `HERO_STATS` dans `src/data/brand.ts` | Un libellé + une règle (« plats dont le nom contient donette ») |
| Couleurs, tailles de texte, espacements | `tailwind.config.js` | Tout le site suit |
| Photo du hero | `BRAND.hero` dans `src/data/brand.ts` | Chemin + dimensions |

### 5.2 À faire plus tard
- **Lancer `npm run seed`** : ta base contient encore le menu « Chez Karim ». Attention, le script supprime les 10 anciens plats de démo.
- **Logo définitif** : le « B » rond dans `Logo.tsx` est provisoire (la maquette n'avait qu'un emplacement « LOGO »).
- **Vrai contenu** : adresse, téléphone et horaires réels dans Paramètres. Les boutons « Appeler » n'apparaissent qu'une fois le téléphone renseigné.
- **Photos** : celle du burger *Double* a une tache grise dans le fichier lui-même. La photo du hero (455 px de large) est un peu agrandie à l'écran. Des versions en meilleure résolution (au moins 1000 px) seraient plus nettes.
- **Image de partage** (WhatsApp, Facebook) : une image dédiée de 1200 × 630 avec une adresse complète (le lien actuel est relatif).
- **Git** : le redesign est enregistré dans les commits `1538c2d` et `69af815`. Seul ce document (`docs/BILAN-TECHNIQUE.md`) reste à commiter.

## 6. Recommandations

### 6.1 Améliorations à moyen terme
1. **Sécurité (prioritaire avant une vraie mise en service)**
   - Le dashboard n'a pas de mot de passe : ajouter Firebase Authentication.
   - Écrire des règles Firestore : lecture publique du menu, création de commande seule, modification réservée au restaurant.
   - Vérifier les prix côté serveur : aujourd'hui le navigateur envoie le prix et le total, qu'un client malin pourrait modifier. Une Cloud Function ou une route API devrait recalculer le total.
2. **Rafraîchissement instantané** : déclencher la régénération de la page (`res.revalidate`) quand le dashboard modifie le menu, au lieu d'attendre 30 s.
3. **Finir la migration TypeScript** du dashboard, fichier par fichier.
4. **Mettre à jour Next.js** (13.3 date d'avril 2023) vers une version récente maintenue, en testant le dashboard.
5. **Tests** : quelques tests sur `useCart`, `validateCustomer`, `toSections` et `formatDA`, plus un test de bout en bout du parcours de commande (Playwright).
6. **Accessibilité** : piéger complètement le focus dans le tiroir. Aujourd'hui, Tab peut sortir du panneau.
7. **Ordre des catégories** : un champ « ordre » dans le dashboard, pour que les plats ajoutés ne tombent pas à la fin.

### 6.2 Points d'attention
- **Mode test Firestore** : il expire après 30 jours, et le site ne lirait plus rien (il afficherait alors le menu de secours).
- **Photos relatives** : les plats du seed ont des chemins comme `/menu/burger-classic.png`. Le site et le dashboard les affichent, mais **les apps mobiles ne le pourront pas**. Pour les apps, il faudra des liens complets (Cloudinary).
- **Variables d'environnement** : `NEXT_PUBLIC_*` est figé au moment du build. Après un changement dans `.env.local` ou sur Vercel, il faut **rebuilder**.
- **Panier et menu** : si un plat est supprimé alors qu'il est dans un panier, il disparaît simplement du panier (pas d'erreur), mais sans message au client.
- **Poids des animations** : Framer Motion pèse environ 30 à 40 kB. Si la performance mobile devient critique, on peut passer à `LazyMotion` pour n'en charger qu'une partie.
