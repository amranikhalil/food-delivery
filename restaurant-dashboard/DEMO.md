# Démo : commande en ligne pour restaurants

Un seul site avec deux parties :

| Adresse | Pour qui | Ce qu'on y fait |
|---|---|---|
| `/` | les clients | voir le menu, remplir le panier, commander (paiement à la livraison) |
| `/commande/<id>` | les clients | suivre sa commande en direct |
| `/dashboard` | le restaurant | recevoir les commandes (avec un son), appeler le client, changer le statut, gérer le menu |

## 1. Créer la base Firebase (gratuit)
1. Va sur https://console.firebase.google.com, puis **Ajouter un projet**.
2. **Firestore Database** > Créer une base > **mode test**.
3. ⚙️ **Paramètres du projet** > Vos applications > icône **`</>`** (Web) > copie le `firebaseConfig`.

## 2. Configurer
1. Copie `.env.local.example` en `.env.local`.
2. Remplis les valeurs avec ton `firebaseConfig`.
3. Ajoute le restaurant et le menu de démo :
   ```
   npm run seed
   ```
   Le menu de démo (Benny's : burgers et tenders, avec photos) vient de `src/data/menu.json`.
   Le site l'affiche aussi tout seul si Firestore n'est pas joignable.

## 3. Lancer
```
npm start
```
- Site client : http://localhost:3000
- Tableau de bord : http://localhost:3000/dashboard

Pour tester sur ton téléphone (même Wi-Fi) : http://<adresse-IP-du-PC>:3000

## 4. Montrer la démo à un restaurant
1. Ouvre le **tableau de bord** sur ton PC et clique sur **« Activer le son »**.
2. Donne ton téléphone au restaurateur, ouvre le site client et passe une commande.
3. La commande arrive sur le tableau de bord avec un son. Il l'accepte, et le client voit le statut changer en direct.
4. Personnalise d'abord le nom, le menu et les prix (Paramètres et Menu) avec ceux de **son** restaurant : c'est beaucoup plus convaincant.

## 5. Le mettre en ligne (gratuit)
1. Pousse le projet sur GitHub.
2. Sur https://vercel.com, importe le dépôt et choisis le dossier **`restaurant-dashboard`**.
3. Ajoute les variables de `.env.local` dans **Settings > Environment Variables**.
4. Tu obtiens un lien public (par exemple `chez-karim.vercel.app`) à partager par WhatsApp, Instagram ou un QR code sur la table.

## ⚠️ Limites de la démo
- Le **tableau de bord n'a pas de mot de passe**. Toute personne qui connaît `/dashboard` peut y accéder. Ne mets pas le lien dans la nature.
- Le **mode test** de Firestore se ferme après 30 jours. Prolonge la date dans *Firestore > Règles* si besoin.
- Avant une vraie mise en service, il faut ajouter : une connexion pour le restaurant, des règles de sécurité Firestore, et la licence ou une réécriture du code (voir le dépôt d'origine).
