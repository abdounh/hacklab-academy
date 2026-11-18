# Publier HackLab Academy sur GitHub Pages

Guide complet pour mettre le site en ligne sur un dépôt GitHub public, avec déploiement automatique par GitHub Actions.

## 1. Ce qui est déjà prêt dans le projet

- Dépôt Git local initialisé sur la branche `main`.
- Historique de commits propre.
- Workflow `.github/workflows/pages.yml` qui publie le site à chaque push.
- `.gitignore` qui exclut `dist/`, les descripteurs Qoder, les fichiers `.env` et les clés privées.
- Script `publier-github.ps1` qui automatise la création du dépôt, le push, l'activation de Pages et le suivi du déploiement.
- Site statique testé : 6 labs, filtres, 404, CSP et bac à sable XSS.

## 2. Prérequis

- Un compte GitHub (le script utilise `abdounh` par défaut, modifiable).
- Git installé et accessible dans PowerShell.
- Un **jeton personnel GitHub classique** avec les droits :
  - `repo` : créer le dépôt et pousser le code ;
  - `workflow` : pousser le fichier `.github/workflows/pages.yml`.

### Créer le jeton

1. Ouvrir <https://github.com/settings/tokens>.
2. **Generate new token** → **Generate new token (classic)**.
3. Nom : `hacklab-academy-publish`.
4. Expiration : 7 jours (suffisant pour la mise en ligne).
5. Cocher `repo` et `workflow`.
6. Cliquer sur **Generate token**, puis copier le jeton affiché (il commence par `ghp_`) immédiatement.

Le jeton ne doit jamais être collé dans un fichier, un commit, une conversation ou un dépôt. Le script le demande dans une invite masquée et ne l'écrit pas sur le disque.

## 3. Méthode automatique (recommandée)

Ouvrir PowerShell dans le dossier du site :

```powershell
cd "C:\Users\Lenovo\Documents\Qoder\2026-11-11\020cbe28\hacklab-academy"
powershell -ExecutionPolicy Bypass -File .\publier-github.ps1
```

Répondre aux trois invites :

| Invite | Valeur |
| --- | --- |
| Compte GitHub | `abdounh` ou votre nom d'utilisateur exact |
| Nom du dépôt | `hacklab-academy` |
| Jeton GitHub | coller le jeton affiché (l'invite est masquée) |

Le script effectue alors :

1. Vérification du jeton et du compte associé.
2. Création du dépôt public s'il n'existe pas.
3. Configuration du remote `origin` et commit des changements éventuels.
4. Push de `main` avec une authentification en mémoire, sans stocker le jeton dans `.git/config`.
5. Activation de GitHub Pages en mode **GitHub Actions**.
6. Lancement du workflow et attente du résultat.

Résultat attendu :

```text
Publication terminee : https://abdounh.github.io/hacklab-academy/
Depot : https://github.com/abdounh/hacklab-academy
```

## 4. Méthode manuelle

### Créer le dépôt distant

1. Aller sur <https://github.com/new>.
2. Nom : `hacklab-academy`.
3. Visibilité : **Public**.
4. Ne pas cocher **Add a README**, **Add .gitignore** ni **Choose a license** : le dépôt doit être vide.
5. Cliquer sur **Create repository**.

### Pousser le code

```bash
cd "C:/Users/Lenovo/Documents/Qoder/2026-11-11/020cbe28/hacklab-academy"
git remote add origin https://github.com/abdounh/hacklab-academy.git
git push -u origin main
```

Si `origin` existe déjà :

```bash
git remote set-url origin https://github.com/abdounh/hacklab-academy.git
git push -u origin main
```

Git demandera une authentification. Utiliser le jeton comme **mot de passe**, pas le mot de passe du compte GitHub.

### Activer GitHub Pages

1. Dans le dépôt : **Settings** → **Pages**.
2. Section **Build and deployment** → **Source** : **GitHub Actions**.
3. Aller dans **Actions** → **Deploy static site to GitHub Pages** → **Run workflow** → branche `main`.

Le workflow copie `assets/`, `labs/` et les fichiers `*.html` dans `_site`, puis publie l'artefact. Il s'exécute aussi automatiquement à chaque push sur `main`.

## 5. Vérification professionnelle

Après le déploiement :

- [ ] Le workflow est vert dans l'onglet **Actions**.
- [ ] `https://abdounh.github.io/hacklab-academy/` affiche la page d'accueil.
- [ ] `https://abdounh.github.io/hacklab-academy/labs.html` liste les 6 labs.
- [ ] Le lab XSS déclenche le flag et l'iframe reste isolée.
- [ ] `https://abdounh.github.io/hacklab-academy/404.html` s'affiche.
- [ ] Le dépôt ne contient ni `dist/`, ni `.qoder.site`, ni jeton.
- [ ] `git status` est propre localement.

Commandes utiles :

```bash
git status
git log --oneline -5
git remote -v
```

## 6. Dépannage

| Symptôme | Cause probable | Solution |
| --- | --- | --- |
| `401 Bad credentials` | Jeton incorrect, expiré ou mal collé | Régénérer un jeton et recommencer |
| `403 Resource not accessible by personal access token` | Droit `workflow` manquant | Recréer le jeton avec `repo` + `workflow` |
| `! [rejected] main -> main (fetch first)` | Dépôt distant non vide (README initial) | Recréer un dépôt vide ou synchroniser avec `git pull --rebase` |
| `404` sur l'URL Pages | Pages pas encore activé ou déploiement en cours | Vérifier **Settings → Pages** et attendre la fin du workflow |
| Workflow rouge à `configure-pages` | Source Pages mal configurée | Choisir **GitHub Actions** comme source |
| Le script signale un autre compte | Le jeton appartient à un autre utilisateur | Relancer avec le nom affiché par le script |
| Ancienne version affichée | Cache navigateur | Recharger avec `Ctrl + F5` |

## 7. Mettre à jour le site

Après une modification locale :

```bash
git add .
git commit -m "Description de la modification"
git push
```

GitHub Actions republie automatiquement la nouvelle version. Attendre le workflow vert avant de considérer la mise à jour comme en ligne.

## 8. Sécurité

- Le jeton est utilisé uniquement en mémoire et peut être révoqué après la publication : <https://github.com/settings/tokens>.
- `.gitignore` exclut `dist/`, `*.qoder.site`, `.env*`, les clés privées et les dépendances.
- Aucun mot de passe, token ou clé API réelle n'est présent dans le site.
- Les identifiants et flags des labs sont fictifs et publics par conception.
- Le lab XSS s'exécute dans une iframe `sandbox="allow-scripts"` sans accès à la page parente.
- Le dépôt et GitHub Pages sont publics : ne jamais y ajouter de secret réel.
