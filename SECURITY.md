# Security Policy

## Périmètre

HackLab Academy est un site statique pédagogique. Il ne possède ni back-end, ni base de données, ni compte utilisateur, ni cookie, ni analytics. Aucune donnée personnelle n'est collectée par le site.

## Secrets et identifiants

Le dépôt ne doit contenir aucun secret réel : clé API, token, mot de passe, certificat privé ou fichier `.env`.

Les identifiants, mots de passe et flags présents dans les labs sont **fictifs et intentionnellement publics**. Ils illustrent des vulnérabilités dans un environnement local isolé et ne donnent accès à aucun système réel. Les valeurs de démonstration ne doivent jamais être réutilisées ailleurs.

Le lab XSS exécute les charges dans une iframe sandbox sans `allow-same-origin`. Il ne peut donc pas accéder au `localStorage`, aux cookies ou au DOM de la page principale.

## Signaler une vulnérabilité

Si vous pensez avoir trouvé un problème de sécurité dans ce site :

1. N'exploitez pas le problème au-delà du strict nécessaire.
2. N'accédez pas aux données d'autrui et ne perturbez pas le service.
3. Ouvrez un **rapport privé** via l'onglet **Security → Report a vulnerability** du dépôt GitHub.
4. Décrivez la page concernée, les étapes de reproduction et l'impact observé.

Merci de laisser un délai raisonnable avant toute divulgation publique.

## Hors périmètre

- Les sites externes référencés dans le catalogue de cours.
- Les plateformes d'entraînement tierces.
- Les attaques contre des systèmes sans autorisation écrite.
- Les tests volumétriques, le déni de service et l'ingénierie sociale.
