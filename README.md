# HackLab Academy

Site pédagogique francophone pour apprendre le pentest de zéro à un niveau professionnel. Le parcours combine cours externes vérifiés, une progression suivie localement et six labs vulnérables exécutés uniquement dans le navigateur.

## Contenu

- **6 pages** : accueil, parcours, catalogue de cours, labs, ressources, éthique et cadre légal.
- **24 modules** de progression, de la ligne de commande au rapport d'audit.
- **40 ressources externes** : Cisco, Coursera, TryHackMe, HTB, PortSwigger, Root-Me, OWASP, MITRE, ANSSI, etc.
- **6 labs** : code source, XSS, IDOR, SQLi, brute force, encodage.
- Progression et validation des flags stockées dans `localStorage`, sans compte ni serveur.
- Design responsive, navigation clavier, lien d'évitement et animations désactivables.

## Lancer le site

Le site est entièrement statique, sans build ni dépendance.

```bash
# Option 1 : ouvrir directement index.html dans le navigateur
# Option 2 : serveur local
python -m http.server 8080
# puis http://localhost:8080
```

## Structure

```text
.
├── index.html
├── parcours.html
├── cours.html
├── labs.html
├── ressources.html
├── ethique.html
├── 404.html
├── assets/
│   ├── css/style.css
│   ├── css/labs.css
│   ├── js/main.js
│   ├── js/lab-core.js
│   └── img/favicon.svg
├── labs/
│   ├── demo-corp.html
│   ├── demo-guestbook.html
│   ├── lab1-source.html
│   ├── lab2-xss.html
│   ├── lab3-idor.html
│   ├── lab4-sqli.html
│   ├── lab5-bruteforce.html
│   └── lab6-crypto.html
├── publier-github.ps1
└── .github/workflows/pages.yml
```

## Modèle de sécurité

- Aucun back-end, aucune base de données, aucun compte utilisateur.
- Aucun cookie, aucune analytics, aucune requête vers un serveur applicatif.
- Aucun mot de passe, token ou clé API réelle dans le dépôt.
- Les identifiants et flags des labs sont **fictifs et publics** : ils servent uniquement à la démonstration.
- Le lab XSS s'exécute dans une **iframe `sandbox="allow-scripts"`**, sans accès à la page parente, au `localStorage` ni aux données du site.
- Les pages principales déclarent une Content-Security-Policy restrictive et une politique de référent.
- Les liens externes utilisent `rel="noopener noreferrer"`.

Voir [SECURITY.md](SECURITY.md) pour la politique de signalement.

## Publier sur GitHub Pages

### Méthode automatique en une commande

Le script `publier-github.ps1` crée le dépôt public, pousse le code, active GitHub Pages et suit le déploiement. Il ne stocke jamais le jeton sur le disque.

1. Créez un **jeton personnel GitHub** (classique) avec les droits `repo` et `workflow` : <https://github.com/settings/tokens>.
2. Dans le dossier du projet, lancez :

```powershell
powershell -ExecutionPolicy Bypass -File .\publier-github.ps1
```

3. Saisissez votre compte (`abdounh` par défaut), le nom du dépôt (`hacklab-academy` par défaut), puis collez le jeton dans l'invite masquée.

Le site est ensuite publié à l'adresse :

```text
https://VOTRE_COMPTE.github.io/hacklab-academy/
```

### Méthode manuelle

Le workflow `.github/workflows/pages.yml` déploie automatiquement le site à chaque push sur `main`.

1. Créez un dépôt public nommé `hacklab-academy` sur votre compte GitHub.
2. Dans **Settings → Pages → Build and deployment**, choisissez **GitHub Actions**.
3. Poussez le dépôt :

```bash
git init -b main
git add .
git commit -m "Initial release of HackLab Academy"
git remote add origin https://github.com/VOTRE_COMPTE/hacklab-academy.git
git push -u origin main
```

### Avec GitHub CLI

```bash
gh auth login
gh repo create hacklab-academy --public --source . --remote origin --push
gh api --method POST repos/{owner}/hacklab-academy/pages -f build_type=workflow
```

Le workflow se déclenche ensuite à chaque push. Vous pouvez aussi lancer manuellement l'onglet **Actions → Deploy static site to GitHub Pages → Run workflow**.

## Ajouter ou modifier un lab

1. Dupliquer un fichier `labs/labN-*.html` et adapter le contenu.
2. Déclarer le lab sur `labs.html` avec un `data-lab-id` unique.
3. Appeler `HLA.initLab({ id, flag, form, input, feedback, success })`.
4. Vérifier la progression sur `labs.html` et la navigation précédent/suivant.

## Crédits

Les cours et plateformes cités appartiennent à leurs auteurs respectifs. Les liens externes sont fournis à titre pédagogique et peuvent évoluer. Ce projet n'est affilié à aucune des plateformes référencées.

## Avertissement

Les techniques présentées doivent être utilisées exclusivement dans un cadre légal : autorisation écrite, périmètre défini et proportionnalité. Les labs sont locaux et volontairement vulnérables. N'attaquez jamais un système sans autorisation.
