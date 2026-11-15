# STATUS — kiroween-bare-bones

## Session 2026-11-15 (opencode), étapes 6 à 9

- Phase : finalisation (étapes 6-9/9 FAITES).
- **Étape 6 FAITE — `site/`** : page d'accueil construite depuis la planche 01 (`design/reference/planches/planche-01.html`) : cadre technique en filets, nav (logo os, chip Kiroween), titre « Drop a spreadsheet. Share an *explorer.* », The problem / The answer, bande « Who's involved · 6 parties », sculpture Three.js (chunk **lazy**, mesuré à part : 129 ko), scénario **9 étapes** (dont 2 pour le club) avec lecture auto/manual, sélecteur Ink / **Paper (défaut)** / Orbit persisté, deux cartes **./budget/ et ./club/** vers les vraies apps, favicon `favicon-bare-bones.svg`, `og:image`/`twitter:image` = `social-preview-1280x640.png`. Tous les chiffres de la page (tests, lignes, gzip, dépendances, solde démo, leader du club) viennent de `site/metrics.json` produit par `tools/metrics.mjs` (tests, lignes, gzip des builds, stats démo recalculées des CSV, durée CI via l'API GitHub). Favicons apps : `favicon-budget.svg` (budget), `favicon-club.svg` (club, déjà en place).
- **Étape 7 FAITE — gardes, budgets, Playwright, Pages** :
  - gardes étendues (`tools/guard.mjs`) : public API only, pas de `dangerouslySetInnerHTML`, **no-sound**, et **core/ui gelé par manifeste** (`tools/core-ui.sha256`, 66 fichiers, `tools/snapshot-core-ui.mjs` pour l'accepter explicitement) ;
  - budgets gzip (`tools/budget.mjs`) : **home 10,2 ko**, budget **116,9 ko**, club **111,8 ko**, squelette **95,2 ko** / 200 ko — 3D à part (home 126,3 ko, club 122,1 ko) ;
  - serveur statique `tools/serve.mjs` + `tests/e2e/` : home (chip, thèmes, faits réels, cartes → apps réelles, scénario 9 étapes), budget/club/skeleton, liens `#bb=` copier → rouvrir dans un nouveau contexte → même vue, lien altéré → repli ;
  - **19 tests Playwright verts** (~1,2 min) ; CI `ci.yml` : job `check` + job `e2e` (< 5 min au total) ;
  - déploiement Pages : `.github/workflows/pages.yml` (build apps → metrics → site → assemblage `/`, `/budget/`, `/club/`, `/skeleton/` → deploy-pages).
- **Étape 8 FAITE — CLI, power, doctor** :
  - `create-bare-bones/index.mjs` (test node natif) : copie le squelette en une app, renomme le package, pointe la config ;
  - `power/bare-bones/` : `POWER.md`, `skill/new-explorer-app/SKILL.md`, deux datasets de référence, `rubric.md` (8 lignes de revue) ;
  - `tools/doctor.mjs` (`pnpm doctor`) : node, pnpm, liens workspace, manifeste gelé, gardes, budgets, builds.
- **Étape 9 FAITE — livrables Devpost (EN)** : `README.md` (pitch, URLs en ligne, « Two apps, one skeleton » avec diff vide prouvé, `pnpm i && pnpm dev`, chiffres de metrics.json), `KIRO.md` (specs EARS, steering, hooks, PBT avec les 2 vrais bugs attrapés, power, MCP: absent assumé, IDE vs CLI), `DEVPOST.md`, `VIDEO.md` (script < 3 min, pas de musique ni marque tierce), checklist § 12 relue.
- Vérifications : 77 tests verts, typecheck ×5 OK, budgets lignes+gzip OK, gardes OK (66 fichiers gelés), builds des 4 sites OK, **19/19 E2E verts**, doctor OK.
- Pages : le premier run du workflow `pages.yml` déploie ; URLs à vérifier en 200 après le run.
- Reste : vérifier les 4 URLs post-déploiement + Gaia pose `social-preview-1280x640.png` dans Settings → Social preview.

## Session 2026-11-15 (opencode), étape 5 bis