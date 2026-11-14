# DESIGN — kiroween-bare-bones

Design verrouillé le 2026-11-13 par Gaia (Claude, phase 12). Les maquettes sources sont dans `design/reference/` : c'est la copie unique, n'en créer aucune autre.

## Versions

- **V1 — 2026-11-13** : accueil (planche 01, Paper), Orb, Floodlight. Verrouillée. Tout ce qui suit la section V2 décrit la V1.
- **V2 — 2026-11-14** : ajouts sans rien changer à la V1 : états vides / import / lien altéré, favicons, images de partage. Voir la section suivante.

## V2 — 2026-11-14 · états et assets de soumission

**Changelog V1 → V2**
1. Nouvelle planche `design/reference/directions/states.html` (rendu `png/states.png`) avec quatre états :
   - **A. Budget, première visite** : zone de dépôt CSV, colonnes attendues, sphères fantômes, carte « Load demo data » ;
   - **B. Import** : barre de progression en 3 étapes (colonnes, vérification dans le Worker, construction), puis résultat « X kept / Y set aside », lignes rejetées avec la partie fautive surlignée, « Download rejected rows » ;
   - **C. Lien partagé** : lien public altéré (rien n'est chargé ni remplacé), lien privé avec mauvaise phrase de passe ;
   - **D. Club, première visite** : stade flouté, « No match played yet », « Load demo season », téléphone avec classement vide.
2. Favicons dans `design/assets/` : `favicon-bare-bones.svg` (accueil et squelette, s'inverse en mode sombre), `favicon-budget.svg` (sphère Activities), `favicon-club.svg` (écusson R6).
3. Images de partage, source unique `design/assets/social-card.html` :
   - `social-preview-1280x640.png` : aperçu social du dépôt GitHub et balise `og:image` de l'accueil ;
   - `devpost-thumbnail-1500x1000.png` : vignette de la page Devpost (3:2).
4. Doublons supprimés : `bare-bones-planches/` (copie identique hors dépôt, et une ancienne planche sans le club dans le dépôt). `design/reference/` reste la seule copie.

**Règles pour les états**
- Les textes des états sont ceux de la planche, en anglais, sans jargon (« set aside », jamais « parse error »).
- Un lien altéré ne remplace jamais les données déjà ouvertes.
- Les chiffres de la planche sont des exemples : l'app affiche les vrais compteurs.
- Le bouton « ← Bare Bones » reste présent dans tous les états.

**Feedback attendu de Gaia** : Garder / Changer (deltas numérotés) / Essayer.

## Choix validés

| Écran | Direction | Référence |
|---|---|---|
| Accueil Bare Bones (`site/`) | Planche 01, cadre technique, thème **Paper** par défaut (Ink et Orbit au choix) | `design/reference/planches/planche-01.html` · sources `src/` · build `build.mjs` |
| App budget (`apps/nonprofit-budget`) | **Orb** | `design/reference/directions/budget-orb.html` · `directions/png/budget-orb.png` |
| App club (`apps/club-results`) | **Floodlight** (stade de nuit 3D) | `design/reference/directions/club-floodlight.html` · `directions/stadium.js` · `directions/png/club-floodlight.png` |

Directions écartées, gardées pour mémoire : Silk, Pitlane, Horizon et Ledger grid (`directions/directions.html?d=1..5`), Gazette (`directions/club.html?d=3`).

## Accueil (planche 01)

- **Typo** : Geist, Geist Mono, Instrument Serif italique pour le mot accentué.
- **Thème Paper** : fond `#F3F2EE`, encre `#0B0D10`, accent `#E2621A`, bleu `#0A86B5`.
- **Toujours visibles** :
  - le logo os et « bare bones » ;
  - la puce Kiroween 2026 · Skeleton Crew ;
  - le titre « Drop a spreadsheet. Share an *explorer.* » ;
  - les blocs « The problem / The answer » ;
  - la bande « Who's involved · 6 parties » : Dev team, Treasurer, Members, Sports club, Kiro, et Server barré.
- **Sculpture Three.js en fils** : une colonne vertébrale (5 vertèbres = 5 points d'extension) qui se transforme à chaque étape.
- **Scénario « Play the scenario », 9 étapes** : les 7 premières pour le budget, les 8 et 9 pour le club (mêmes 5 prises, puis classement public sur téléphone).
- **Deux cartes « Two apps · one skeleton »** :
  - la carte Orb ouvre `./budget/` ;
  - la carte stade ouvre `./club/` ;
  - elles se masquent pendant le scénario.
- **Chiffres** : ils doivent venir de `metrics.json`. Ceux de la maquette sont des exemples du brief, à remplacer.

## Orb (budget)

- **Fond et formes** : `#F4F3F0`, cartes blanches de rayon 22 px, ombres très douces.
- **Typo** : Inter, plus Geist Mono pour les libellés et Instrument Serif italique pour un mot de phrase.
- **Une sphère granuleuse par catégorie** : Activities orange, Events violet, Premises bleu, Fixed costs gris, Grants vert, Other jaune.
- **Écran Overview** :
  - solde « +€X left » avec une phrase vs plan ;
  - Came in / Went out ;
  - bulles « Where the money went » ;
  - barres « Monthly spending » avec le plan en pointillés ;
  - table typée filtrable ;
  - carte noire « Share with members » (privé / public) ;
  - Rejected rows ;
  - Actual vs plan.
- **Barre latérale** et encart « Your data stays here ». Bouton « ← Bare Bones ».

## Floodlight (club)

- **Fond** : stade de nuit en Three.js (`stadium.js`) :
  - pelouse tondue avec relief et usure ;
  - 3 pylônes visibles et 1 hors champ ;
  - faisceaux, halos et traînées ;
  - foule en volume, toits éclairés, abris de touche ;
  - panneaux LED « Riverside Six · Season 2026 » ;
  - tableau d'affichage du prochain match.
  - Repli image : `directions/png/fl-bg.png`.
- **Lisibilité** : fondu sombre à gauche, flou léger et grain sur le fond.
- **Typo et couleurs** : Inter Tight 800/300, Geist Mono, accent bleu glacé `#7DD3FC`, W `#22C55E`, D `#64748B`, L `#EF4444`.
- **Écrans** :
  - League table : écussons, ligne leader lumineuse, prochain match ;
  - page d'équipe : points, W/D/L/GD, forme, courbe, résultats ;
  - partage public, montré dans une conversation d'équipe.
- Bouton « ← Bare Bones ».

## Contraintes

- Ordinateur d'abord. Le mobile n'est pas travaillé (demande de Gaia), sauf la lisibilité de l'app club.
- Interface en anglais. Aucune marque tierce.
- Les scores, noms d'équipes et montants des maquettes sont des exemples. Les apps affichent leurs vraies données de démo.

## Liens

- Planche 01 publiée, privée : https://claude.ai/artifact/LT3v8d8Pcfo4ZTexPqkhpq
- Captures de vérification : `design/reference/captures/`
- Références d'inspiration : `design/reference/references/` (iterate, hackodds, Trendtrack, Awwwards 3D, inkyy, ElevenLabs, Lando Norris, Microsoft AI, Terminal Industries)
