# STATUS ÔÇö kiroween-bare-bones

## Session 2026-11-15 (opencode), ├®tapes 6 ├á 9

- Phase : finalisation (├®tapes 6-9/9 FAITES).
- **├ëtape 6 FAITE ÔÇö `site/`** : page d'accueil construite depuis la planche 01 (`design/reference/planches/planche-01.html`) : cadre technique en filets, nav (logo os, chip Kiroween), titre ┬½ Drop a spreadsheet. Share an *explorer.* ┬╗, The problem / The answer, bande ┬½ Who's involved ┬À 6 parties ┬╗, sculpture Three.js (chunk **lazy**, mesur├® ├á part : 129 ko), sc├®nario **9 ├®tapes** (dont 2 pour le club) avec lecture auto/manual, s├®lecteur Ink / **Paper (d├®faut)** / Orbit persist├®, deux cartes **./budget/ et ./club/** vers les vraies apps, favicon `favicon-bare-bones.svg`, `og:image`/`twitter:image` = `social-preview-1280x640.png`. Tous les chiffres de la page (tests, lignes, gzip, d├®pendances, solde d├®mo, leader du club) viennent de `site/metrics.json` produit par `tools/metrics.mjs` (tests, lignes, gzip des builds, stats d├®mo recalcul├®es des CSV, dur├®e CI via l'API GitHub). Favicons apps : `favicon-budget.svg` (budget), `favicon-club.svg` (club, d├®j├á en place).
- **├ëtape 7 FAITE ÔÇö gardes, budgets, Playwright, Pages** :
  - gardes ├®tendues (`tools/guard.mjs`) : public API only, pas de `dangerouslySetInnerHTML`, **no-sound**, et **core/ui gel├® par manifeste** (`tools/core-ui.sha256`, 66 fichiers, `tools/snapshot-core-ui.mjs` pour l'accepter explicitement) ;
  - budgets gzip (`tools/budget.mjs`) : **home 10,2 ko**, budget **116,9 ko**, club **111,8 ko**, squelette **95,2 ko** / 200 ko ÔÇö 3D ├á part (home 126,3 ko, club 122,1 ko) ;
  - serveur statique `tools/serve.mjs` + `tests/e2e/` : home (chip, th├¿mes, faits r├®els, cartes ÔåÆ apps r├®elles, sc├®nario 9 ├®tapes), budget/club/skeleton, liens `#bb=` copier ÔåÆ rouvrir dans un nouveau contexte ÔåÆ m├¬me vue, lien alt├®r├® ÔåÆ repli ;
  - **19 tests Playwright verts** (~1,2 min) ; CI `ci.yml` : job `check` + job `e2e` (< 5 min au total) ;
  - d├®ploiement Pages : `.github/workflows/pages.yml` (build apps ÔåÆ metrics ÔåÆ site ÔåÆ assemblage `/`, `/budget/`, `/club/`, `/skeleton/` ÔåÆ deploy-pages).
- **├ëtape 8 FAITE ÔÇö CLI, power, doctor** :
  - `create-bare-bones/index.mjs` (test node natif) : copie le squelette en une app, renomme le package, pointe la config ;
  - `power/bare-bones/` : `POWER.md`, `skill/new-explorer-app/SKILL.md`, deux datasets de r├®f├®rence, `rubric.md` (8 lignes de revue) ;
  - `tools/doctor.mjs` (`pnpm doctor`) : node, pnpm, liens workspace, manifeste gel├®, gardes, budgets, builds.
- **├ëtape 9 FAITE ÔÇö livrables Devpost (EN)** : `README.md` (pitch, URLs en ligne, ┬½ Two apps, one skeleton ┬╗ avec diff vide prouv├®, `pnpm i && pnpm dev`, chiffres de metrics.json), `KIRO.md` (specs EARS, steering, hooks, PBT avec les 2 vrais bugs attrap├®s, power, MCP: absent assum├®, IDE vs CLI), `DEVPOST.md`, `VIDEO.md` (script < 3 min, pas de musique ni marque tierce), checklist ┬º 12 relue.
- V├®rifications : 77 tests verts, typecheck ├ù5 OK, budgets lignes+gzip OK, gardes OK (66 fichiers gel├®s), builds des 4 sites OK, **19/19 E2E verts**, doctor OK.
- Pages : le premier run du workflow `pages.yml` d├®ploie ; URLs ├á v├®rifier en 200 apr├¿s le run.
- Reste : v├®rifier les 4 URLs post-d├®ploiement + Gaia pose `social-preview-1280x640.png` dans Settings ÔåÆ Social preview.

## Session 2026-11-15 (opencode), ├®tape 5 bis
## Session 2026-11-15 (opencode), ├®tape 5 bis

- Phase : build (├®tapes 1-5 bis/9).
- ├ëtape 5 bis FAITE ÔÇö les ├®tats de la V2 (spec `.kiro/specs/states-v2/`) :
  - **A (budget vide)** : zone de d├®p├┤t, colonnes attendues (`date YYYY-MM-DD / label / category / amount ÔêÆ12.50 / + plan.csv`), ligne ┬½ Your data stays hereÔÇª ┬╗, 6 sph├¿res fant├┤mes + l├®gende, carte ┬½ Just looking? / Load demo data ┬╗, chip ┬½ No data yet ┬╗, ┬½ ÔåÉ Bare Bones ┬╗ ;
  - **B (import)** : branch├® sur le **vrai Worker** (`attachWorker`, `src/worker.ts` par app) : 3 ├®tapes r├®elles (Columns recognised ÔåÆ Checking every row ┬À in a background worker ÔåÆ Building the explorer), compteurs r├®els (lignes compt├®es, taille du fichier), puis ┬½ Ready. N rows in your explorer. ┬╗ avec pills ┬½ N kept / M set aside ┬╗, lignes rejet├®es avec **la partie fautive surlign├®e**, ┬½ Download rejected rows ┬╗ (vrai CSV) et ┬½ Open the explorer ┬╗ ; bouton Cancel ;
  - **C (lien #bb=)** : lien alt├®r├® ÔåÆ panneau de repli (┬½ This link was changed or cut short. ┬╗, ┬½ Nothing was loaded ┬╗, ┬½ ÔåÉ Bare Bones ┬╗) et **rien n'est charg├® ni remplac├®** (banni├¿re non destructive si des donn├®es sont d├®j├á ouvertes) ; lien priv├® ├á **phrase de passe** (`v1.k.`, PBKDF2 100k, la cl├® ne voyage jamais) : saisie + ┬½ That passphrase doesn't open this link. ┬╗ si mauvaise, ouverture si bonne ; la ShareCard du budget gagne le mode ┬½ Passphrase ┬╗ ; le club applique le m├¬me repli ;
  - **D (club vide)** : ┬½ Riverside Six ┬À Season 2026 ┬╗, ┬½ No match played yet. ┬╗, ┬½ Load demo season ┬╗, ┬½ Drop results.csv ┬╗, ┬½ ÔåÉ Bare Bones ┬╗.
- **Transparence core/ui** : changement **additif uniquement** (API publique gel├®e) ÔÇö core : lien ├á phrase de passe (+58 lignes, tests d├®di├®s) ; ui : dossier `states/` g├®n├®rique (├®crans + machine d'import + styles ├á variables) (+Ôëê770 lignes) ; **les apps ne forkent jamais core/ui** (garde ┬½ public API only ┬╗) et restent dans leurs plafonds : budget 598/600, club 600/600.
- Playwright (`@playwright/test` 1.65.1, `pnpm run e2e`) : **11 tests verts** (34 s) couvrant A, B (3 ├®tapes, compteurs, download CSV), C (alt├®r├® budget+club, non-destruction des donn├®es, phrase de passe fausse/bonne), D ; job `e2e` ajout├® ├á la CI (parall├¿le au job check, < 5 min).
- V├®rifications : 77 tests unitaires verts, typecheck ├ù5 packages OK, budgets et gardes OK, builds `/budget/` et `/club/` OK ; ├®tats v├®rifi├®s au DOM (textes exacts de la planche, z├®ro erreur console).
- Reste : site (├®tape 6), gardes diff core/ui + Pages (├®tape 7), CLI/power/doctor (├®tape 8), livrables Devpost (├®tape 9).

## Session 2026-11-15 (opencode), ├®tape 5

- Phase : build (├®tapes 1-5/9).
- ├ëtape 5 FAITE : `apps/club-results` (597/600 lignes), design Floodlight :
  - trois colonnes sur le stade de nuit : classement (├®cussons, ligne leader lumineuse, prochain match), page d'├®quipe (gros total, W/D/L/GD, forme, courbe cumul├®e, derniers r├®sultats), partage public `#bb=` par d├®faut ;
  - stade Three.js adapt├® de `design/reference/directions/stadium.js`, **charg├® paresseusement** (chunk s├®par├®, 125,06 ko gzip mesur├® ├á part), repli `fl-bg.png` (compress├®e ├á ~844 ko) si WebGL absent ou ├®chec ;
  - donn├®es : pas d'open data compatible trouv├®e ÔåÆ saison de d├®mo g├®n├®r├®e (double round-robin 6 ├®quipes, semaines 1-8 jou├®es, 9-10 ├á venir), badge ┬½ Demo data ┬╗ dans l'UI, `data/README.md` explicite ;
  - cinq registres dans `explorer.config.ts` (importer, derivation, reducer, views, shareAdapter public), th├¿me Floodlight d├®claratif ; **0 ligne modifi├®e dans core et ui** ;
  - `?demo=1` charge la saison automatiquement (captures/E2E) ; bouton ┬½ ÔåÉ Bare Bones ┬╗ ; colonnes empil├®es sur mobile.
- V├®rifications : 67 tests verts (11 fichiers) dont 7 club (PBT seed 20261111 : conservation des points, matchs jou├®s ├®gaux, tri stable), typecheck club OK, budgets OK (club 597/600), guards OK, build `/club/` OK (93,17 ko gzip JS + 2,25 ko CSS, sc├¿ne 3D ├á part).
- Specs ajout├®es : `.kiro/specs/club-floodlight/` (requirements/design/tasks).
- V├®rifi├® par script Playwright : classement calcul├® (Castors 22 pts), page ├®quipe interactive, canvas pr├¬t, lien `#bb=v1.pÔÇª`, z├®ro erreur console.
- Reste : ├®tats V2 (5 bis), site, Playwright CI, Pages, CLI/power, livrables.

## Session 2026-11-13 (opencode), ├®tape 4

- Phase : build (├®tapes 1-4/9).
- ├ëtape 4 FAITE :
  - `skeleton/` starter : 70/300 lignes, config unique + CSV demo + entry point, build `/skeleton/` OK ;
  - `apps/nonprofit-budget` : 580/600 lignes, package Vite/React, config publique avec importer, derivation, reducer, 5 vues, adapters public/private ;
  - design Orb app-owned : fond off-white, cartes arrondies, navigation, m├®triques, orbes granuleuses d├®riv├®es des donn├®es, graphique mensuel, table typ├®e, rail partage/rejets/actual-vs-plan ;
  - dataset FY2026 r├®aliste + plan vot├® : transactions bonnes, deux lignes d├®fectueuses (date impossible et montant invalide), une ligne vide rejet├®e ; tous les chiffres affich├®s viennent des CSV ;
  - tests de donn├®es : cat├®gorisation, conservation income/expenses/balance, totaux par cat├®gorie, totaux du plan, property tests seed 20261111.
- V├®rifications : 60 tests verts (10 fichiers), typecheck core/ui/skeleton/budget OK, budgets OK (core 1 498/3 300, ui 1 824/4 400, skeleton 70/300, budget 580/600), guards OK, builds skeleton et budget OK.
- Bundles produits : skeleton 94.60 kB gzip JS + 0.82 kB CSS ; budget 93.96 kB gzip JS + 3.53 kB CSS.
- Specs ajout├®es : `.kiro/specs/skeleton-orb/` (requirements/design/tasks).
- Reste : club Floodlight, site, Playwright, Pages, CLI/power et livrables.

## Session 2026-11-13 (opencode), ├®tape 3

- Phase : build (├®tapes 1-3/9).
- ├ëtape 3 FAITE : `packages/ui` (1 808/4 400 lignes, TS strict OK) : th├¿me d├®claratif, layout, grille virtualis├®e, filtres, 7 graphiques SVG avec ├®quivalents textuels, partage, Explorer, styles.
- Tests : 53 verts au total (15 c├┤t├® ui), 11 propri├®t├®s fast-check.
- CI verte en 24 s. Commit `959210b` pouss├® sur main.

## Session 2026-11-13 (opencode), ├®tape 2

- Phase : build (├®tapes 1-2/9).
- ├ëtape 2 FAITE : `packages/core` (1 493/3 300 lignes, TS strict OK) : types, zod, import CSV/Worker, query, codec `#bb=`, AES-GCM-256, PBT.
- Tests : 38 verts, dont 8 propri├®t├®s fast-check (seed 20261111).
- CI verte en 15 s. Commit `f117db7` pouss├® sur main.

## Session 2026-11-13 (opencode), ├®tape 1

- Phase : build (├®tape 1/9 du PROMPT-BARE-BONES-CODE.md).
- ├ëtat : d├®p├┤t local cr├®├® ├á `HACKATONS/2026-12-04-kiroween/skeleton-crew/bare-bones` (monorepo pnpm, TS strict, LICENSE MIT, README, `.kiro/steering` ├ù4, `.kiro/specs/core-types`, CI minimale, design/reference).
- D├®p├┤t GitHub public : https://github.com/GaiaSG94/bare-bones. Collaborateur : invitation envoy├®e ├á BaptisteFaisy.
- En attente : trancher le conflit LabKit vs Bare Bones en Skeleton Crew dans le Sheet ; lÔÇÖimpl├®mentation des specs doit ├¬tre rejou├®e dans Kiro pour satisfaire le r├¿glement.
- Prochaine action : ├®tape 2 ÔÇö packages/core.

## Claude

- **2026-11-14 13:40** ┬À phase : design V2 ┬À round 2.
- Fait :
  - planche des ├®tats (`design/reference/directions/states.html`, `png/states.png`) ;
  - favicons (`design/assets/favicon-*.svg`) ;
  - images de partage (`design/assets/social-preview-1280x640.png`, `devpost-thumbnail-1500x1000.png`) ;
  - DESIGN.md en V2 avec changelog ;
  - doublons `bare-bones-planches/` supprim├®s.
- Gaia soumet LabKit **et** Bare Bones : le conflit Skeleton Crew est lev├®.
- Suite c├┤t├® code : `PROMPT-BARE-BONES-SUITE.md` (racine `2026-12-04-kiroween/`), ├®tapes 5 ├á 9 pour opencode.
