# STATUS — kiroween-bare-bones

## Session 2026-11-15 (opencode), étape 5

- Phase : build (étapes 1-5/9).
- Étape 5 FAITE : `apps/club-results` (597/600 lignes), design Floodlight :
  - trois colonnes sur le stade de nuit : classement (écussons, ligne leader lumineuse, prochain match), page d'équipe (gros total, W/D/L/GD, forme, courbe cumulée, derniers résultats), partage public `#bb=` par défaut ;
  - stade Three.js adapté de `design/reference/directions/stadium.js`, **chargé paresseusement** (chunk séparé, 125,06 ko gzip mesuré à part), repli `fl-bg.png` (compressée à ~844 ko) si WebGL absent ou échec ;
  - données : pas d'open data compatible trouvée → saison de démo générée (double round-robin 6 équipes, semaines 1-8 jouées, 9-10 à venir), badge « Demo data » dans l'UI, `data/README.md` explicite ;
  - cinq registres dans `explorer.config.ts` (importer, derivation, reducer, views, shareAdapter public), thème Floodlight déclaratif ; **0 ligne modifiée dans core et ui** ;
  - `?demo=1` charge la saison automatiquement (captures/E2E) ; bouton « ← Bare Bones » ; colonnes empilées sur mobile.
- Vérifications : 67 tests verts (11 fichiers) dont 7 club (PBT seed 20261111 : conservation des points, matchs joués égaux, tri stable), typecheck club OK, budgets OK (club 597/600), guards OK, build `/club/` OK (93,17 ko gzip JS + 2,25 ko CSS, scène 3D à part).
- Specs ajoutées : `.kiro/specs/club-floodlight/` (requirements/design/tasks).
- Vérifié par script Playwright : classement calculé (Castors 22 pts), page équipe interactive, canvas prêt, lien `#bb=v1.p…`, zéro erreur console.
- Reste : états V2 (5 bis), site, Playwright CI, Pages, CLI/power, livrables.

## Session 2026-11-13 (opencode), étape 4

- Phase : build (étapes 1-4/9).
- Étape 4 FAITE :
  - `skeleton/` starter : 70/300 lignes, config unique + CSV demo + entry point, build `/skeleton/` OK ;
  - `apps/nonprofit-budget` : 580/600 lignes, package Vite/React, config publique avec importer, derivation, reducer, 5 vues, adapters public/private ;
  - design Orb app-owned : fond off-white, cartes arrondies, navigation, métriques, orbes granuleuses dérivées des données, graphique mensuel, table typée, rail partage/rejets/actual-vs-plan ;
  - dataset FY2026 réaliste + plan voté : transactions bonnes, deux lignes défectueuses (date impossible et montant invalide), une ligne vide rejetée ; tous les chiffres affichés viennent des CSV ;
  - tests de données : catégorisation, conservation income/expenses/balance, totaux par catégorie, totaux du plan, property tests seed 20261111.
- Vérifications : 60 tests verts (10 fichiers), typecheck core/ui/skeleton/budget OK, budgets OK (core 1 498/3 300, ui 1 824/4 400, skeleton 70/300, budget 580/600), guards OK, builds skeleton et budget OK.
- Bundles produits : skeleton 94.60 kB gzip JS + 0.82 kB CSS ; budget 93.96 kB gzip JS + 3.53 kB CSS.
- Specs ajoutées : `.kiro/specs/skeleton-orb/` (requirements/design/tasks).
- Reste : club Floodlight, site, Playwright, Pages, CLI/power et livrables.

## Session 2026-11-13 (opencode), étape 3

- Phase : build (étapes 1-3/9).
- Étape 3 FAITE : `packages/ui` (1 808/4 400 lignes, TS strict OK) : thème déclaratif, layout, grille virtualisée, filtres, 7 graphiques SVG avec équivalents textuels, partage, Explorer, styles.
- Tests : 53 verts au total (15 côté ui), 11 propriétés fast-check.
- CI verte en 24 s. Commit `959210b` poussé sur main.

## Session 2026-11-13 (opencode), étape 2

- Phase : build (étapes 1-2/9).
- Étape 2 FAITE : `packages/core` (1 493/3 300 lignes, TS strict OK) : types, zod, import CSV/Worker, query, codec `#bb=`, AES-GCM-256, PBT.
- Tests : 38 verts, dont 8 propriétés fast-check (seed 20261111).
- CI verte en 15 s. Commit `f117db7` poussé sur main.

## Session 2026-11-13 (opencode), étape 1

- Phase : build (étape 1/9 du PROMPT-BARE-BONES-CODE.md).
- État : dépôt local créé à `HACKATONS/2026-12-04-kiroween/skeleton-crew/bare-bones` (monorepo pnpm, TS strict, LICENSE MIT, README, `.kiro/steering` ×4, `.kiro/specs/core-types`, CI minimale, design/reference).
- Dépôt GitHub public : https://github.com/GaiaSG94/bare-bones. Collaborateur : invitation envoyée à BaptisteFaisy.
- En attente : trancher le conflit LabKit vs Bare Bones en Skeleton Crew dans le Sheet ; l’implémentation des specs doit être rejouée dans Kiro pour satisfaire le règlement.
- Prochaine action : étape 2 — packages/core.

## Claude

- **2026-11-14 13:40** · phase : design V2 · round 2.
- Fait :
  - planche des états (`design/reference/directions/states.html`, `png/states.png`) ;
  - favicons (`design/assets/favicon-*.svg`) ;
  - images de partage (`design/assets/social-preview-1280x640.png`, `devpost-thumbnail-1500x1000.png`) ;
  - DESIGN.md en V2 avec changelog ;
  - doublons `bare-bones-planches/` supprimés.
- Gaia soumet LabKit **et** Bare Bones : le conflit Skeleton Crew est levé.
- Suite côté code : `PROMPT-BARE-BONES-SUITE.md` (racine `2026-12-04-kiroween/`), étapes 5 à 9 pour opencode.
