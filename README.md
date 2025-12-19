# OBC Matos - Achat Équipement

Une application web minimaliste pour faciliter l'enregistrement des achats d'équipement de badminton.

## Fonctionnalités

- Sélection rapide d'équipement avec images et prix
- Compteur de quantité intuitif avec calcul du total
- Pré-remplissage automatique via paramètres URL (pour QR codes)
- Détection automatique du créneau horaire
- Interface mobile-friendly
- Intégration avec Google Sheets via Apps Script
- Configuration flexible du script URL (env var ou URL param)

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev -- --host
```

Ouvrir http://localhost:5173

## Build pour production

```bash
npm run build
```

Les fichiers statiques seront générés dans le dossier `dist/`.

## Configuration Google Apps Script

### 1. Créer le script

1. Ouvrir votre Google Sheet
2. Aller dans **Extensions** > **Apps Script**
3. Copier le contenu de `google-apps-script.js` dans l'éditeur
4. Remplacer `YOUR_SPREADSHEET_ID` par l'ID de votre spreadsheet (visible dans l'URL)

### 2. Vérifier les colonnes

Le script s'attend par défaut aux colonnes suivantes dans cet ordre:
1. Timestamp
2. Nom de l'adhérent acheteur
3. Type de volant
4. Quantité
5. Grip
6. Surgrip
7. Lieu
8. Créneau
9. Moyen de paiement

**Important:** Le script valide automatiquement que les en-têtes du spreadsheet correspondent aux en-têtes attendus par l'application web. Si vous modifiez le Google Form (ajout, suppression ou réorganisation de questions), vous devrez mettre à jour le tableau `headers` dans `src/App.jsx:170-180` pour qu'il corresponde au nouveau format de votre spreadsheet.

**Avantage:** Vous pouvez modifier librement le Google Form. L'application web détectera automatiquement toute incompatibilité et renverra un message d'erreur clair avec les en-têtes attendus vs. actuels.

### 3. Déployer comme Web App

1. Dans l'éditeur Apps Script, cliquer sur **Déployer** > **Nouveau déploiement**
2. Cliquer sur l'icône d'engrenage et choisir **Application Web**
3. Configurer:
   - **Execute as:** Me (votre compte)
   - **Who has access:** Anyone (ou "Anyone with Google account" selon vos préférences)
4. Cliquer sur **Déployer**
5. Copier l'URL de déploiement fournie

### 4. Configurer l'URL du script

Il y a trois façons de configurer l'URL du Google Apps Script (par ordre de priorité):

**Option A: Paramètre URL (recommandé pour tester)**
```
https://votre-domaine.com/?scriptUrl=https://script.google.com/macros/s/...
```

**Option B: Variable d'environnement (recommandé pour production)**

Créer un fichier `.env` à la racine du projet:
```bash
VITE_SCRIPT_URL=https://script.google.com/macros/s/AKfycby.../exec
VITE_GOOGLE_FORM_URL=https://forms.gle/VotreFormID
```

Le `VITE_GOOGLE_FORM_URL` est optionnel et affiche une bannière en haut de l'application avec un lien vers le formulaire Google original en cas de problème avec l'application.

Pour GitHub Pages, vous pouvez créer un workflow qui build avec cette variable.

**Option C: Hardcodé dans le code**

Dans `src/App.jsx:158`, remplacer l'URL par défaut.

### 5. Tester

Vous pouvez tester le script directement dans Apps Script en utilisant la fonction `testDoPost()`.

### 6. Validation automatique des en-têtes

Lorsqu'un utilisateur soumet le formulaire via l'application web:
1. L'application envoie les données **avec** la liste des en-têtes attendus
2. Le Google Apps Script lit les en-têtes actuels du spreadsheet
3. Si les en-têtes ne correspondent pas (ordre ou contenu différent), l'écriture est **refusée**
4. L'erreur est affichée directement dans l'application web avec le détail de la colonne problématique

Cela garantit que les données sont toujours écrites dans les bonnes colonnes, même si le Google Form est modifié.

**Pour déboguer:** Vous pouvez aussi consulter les logs dans Apps Script > **Exécutions** pour voir l'historique complet des requêtes et erreurs.

## Utilisation avec QR Codes

### Paramètres URL disponibles

L'application supporte les paramètres URL suivants:
- `lieu` - Pré-remplit le lieu (ex: `Léo%20Lagrange`, `Argoulets`)
- `equipment` - Pré-sélectionne l'équipement (voir IDs ci-dessous)
- `scriptUrl` - Override de l'URL du Google Apps Script

### Pré-remplir le lieu

Créer des QR codes avec des URLs comme:
```
https://votre-domaine.com/?lieu=Léo%20Lagrange
https://votre-domaine.com/?lieu=Argoulets
```

### Pré-remplir le lieu ET l'équipement

Pour créer des QR codes spécialisés (ex: achat rapide de Vinastar):
```
https://votre-domaine.com/?lieu=Léo%20Lagrange&equipment=vinastar
```

IDs d'équipement disponibles:
- `vinastar`
- `as10`
- `grip`

## Déploiement

### GitHub Pages (automatique)

Le projet inclut un workflow GitHub Actions qui déploie automatiquement sur GitHub Pages à chaque push sur `main`.

**Configuration requise:**

1. **Activer GitHub Pages:**
   - Aller dans **Settings** > **Pages**
   - Sous **Source**, sélectionner **GitHub Actions**

2. **Configurer les secrets:**
   - Aller dans **Settings** > **Secrets and variables** > **Actions**
   - Ajouter un secret `VITE_SCRIPT_URL` avec l'URL de votre Google Apps Script

3. **Configurer le base path (si nécessaire):**
   - Pour un repo projet (ex: `username.github.io/repo-name`), ajouter un secret `VITE_BASE_PATH` avec la valeur `/repo-name/`
   - Pour un domaine custom ou user page (ex: `username.github.io`), laisser vide ou mettre `/`

4. **Push sur main:**
   ```bash
   git push origin main
   ```

Le site sera disponible à `https://username.github.io/repo-name/`

### Autres plateformes

Vous pouvez aussi déployer les fichiers du dossier `dist/` sur:
- Netlify
- Vercel
- Firebase Hosting
- etc.

## Technologies utilisées

- **Solid.js** - Framework réactif minimaliste
- **Vite** - Build tool rapide
- **CSS vanilla** - Pas de framework CSS lourd
- **Google Apps Script** - Backend serverless

## Structure du projet

```
.
├── src/
│   ├── App.jsx          # Composant principal
│   ├── index.jsx        # Point d'entrée
│   └── styles.css       # Styles CSS
├── index.html           # HTML de base
├── vite.config.js       # Configuration Vite
├── google-apps-script.js # Script Google Apps
└── package.json         # Dépendances
```
