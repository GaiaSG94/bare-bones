# AGENTS.md — règles générales pour tous les agents (CI, code, voix)

Ces règles s'appliquent à tous les agents travaillant sur n'importe quel projet. Elles doivent être recopiées dans le fichier `agents.md` (ou `AGENTS.md`) de chaque nouveau dépôt.

## 0. Routage hackathons

- Si la tâche concerne les hackathons (Gaia + Baptiste, pipeline de participation), lire en priorité `HACKATONS/AGENTS.md` puis `HACKATONS/PIPELINE.md`. En cas de conflit, les règles de `HACKATONS/` gagnent pour ces tâches.
- Les chats s'ouvrent avec `Downloads` comme dossier racine. Ne jamais créer de dossier hackathon à la racine : tout va dans `HACKATONS/` (voir ses règles d'arborescence).

## 1. CI — jamais plus de 5 minutes

- Toute la CI d'un projet (lint, tests, build) doit se terminer en **moins de 5 minutes** au total.
- À la création de tout nouveau dépôt, configurer la CI pour respecter cette limite :
  - parallaxer les tests et le lint (matrice de jobs) au lieu de les séquentiels ;
  - activer le cache des dépendances (npm/pnpm/yarn cache, pip cache, Cargo cache, etc.) ;
  - ne lancer que les tests impactés par le diff quand c'est possible (turborepo, nx, pytest --selected, etc.) ;
  - limiter les suites à ce qui est nécessaire sur chaque PR (les tests lourds/intégration seulement sur tag, nightly ou demandé) ;
  - activer le mode CI de l'outil de build (vitest --run, jest --ci, etc.) et_timeout courts avec fail-fast.
- Si une CI dépasse 5 minutes, c'est un bug à corriger : déplier, réduire la granularité des jobs, cacher, isoler les tests lents — pas juste augmenter le timeout.

## 2. Taille du code

- **Fichiers de code : jamais plus de 500 lignes.** Au-delà, découper en modules séparés (un module = une responsabilité).
- **Fonctions : jamais plus de 50 lignes.** Au-delà, extraire des sous-fonctions avec un nom explicite.

## 3. Réutilisabilité maximale du code

- Écrire le code le plus réutilisable possible :
  - pas de logique dupliquée — si un même bloc existe à deux endroits, l'extraire dans une fonction ou un module partagé ;
  - séparer la logique métier (testable, pure) de l'interface / du système de fichiers / du réseau ;
  - glanages config-driven : constantes en haut de fichier ou dans un fichier de config, pas en dur au milieu du code ;
  - noms, conventions typiques du langage utilisé, petits fichiers, petits exports, API claires — tout doit être importable ailleurs sans effet de bord ;
  - privilégier la花花 composition : petites fonctions combinées plutôt que gros blocs monolithiques.

## 4. Voix avec ElevenLabs

Quand une tâche nécessite de la synthèse vocale (TTS) avec ElevenLabs, les clés
vivent **uniquement** dans Bitwarden Secrets Manager. Ne jamais les recopier dans
ce fichier, dans un autre fichier, dans un log ou dans un message : **noms
uniquement**, comme pour tout secret.

Noms d'injection (source unique : Bitwarden) :

- `SCAN_ELEVENLABS_1` — compte Gaia
- `SCAN_ELEVENLABS_2` — compte Baptiste

Pour les obtenir dans un run (depuis la racine `Downloads`) :

```
powershell -NoProfile -ExecutionPolicy Bypass -File "HACKATONS/tools/with-secrets.ps1" -Only "SCAN_ELEVENLABS_1" python video.py
```

- L'injection se fait en mémoire, dans le process enfant uniquement ; le jeton Bitwarden est retiré avant le lancement.
- Le code lit la variable d'environnement `SCAN_ELEVENLABS_1` / `SCAN_ELEVENLABS_2` (`os.environ`), jamais une clé en dur.
- En cas d'échec (quota, erreur d'API) sur un compte, tenter l'autre (fallback documenté dans `HACKATONS/PIPELINE-BAPTISTE.md`).
- Liste blanche par type de run : `HACKATONS/tools/secrets-by-run.ps1`.
- Si une clé a été exposée (copiée dans un fichier, un log, un commit) : la faire tourner dans Bitwarden et supprimer l'occurrence.

## 5. Bureau — ne rien créer dessus

- **Ne jamais créer de fichier ni de dossier sur le Bureau** (Desktop), sauf demande explicite de l'utilisateur.
- Créer les fichiers uniquement dans le dépôt / workspace courant, ou dans un dossier temporaire si c'est du scratch.

## 6. Secrets (Bitwarden)

- **Jamais de secret en dur ni commité** : clés API, tokens, fichiers JSON de comptes de service, mots de passe. Repos publics = tolérance zéro.
- Source unique : **Bitwarden Secrets Manager** (cloud), projet global avec les clés de Gaia et Baptiste.
- Tout run nécessitant des secrets passe par `HACKATONS/tools/with-secrets.ps1 <commande>` (injection en mémoire, rien sur disque, valeurs jamais affichées).
- Toujours restreindre l'injection avec `-Only <NOMS>` (liste blanche) ou `-NoSecrets` : noms autorisés par type de run dans `HACKATONS/tools/secrets-by-run.ps1`.
- Ne jamais afficher, copier ou logger une valeur de secret (ni chat, ni logs, ni fichiers). En cas d'erreur : noms uniquement.
- Convention détaillée (agents hackathons) : voir `HACKATONS/AGENTS.md`.
