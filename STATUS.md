# STATUS — kiroween-bare-bones

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
