# Demo video script — under 3 minutes

No third-party brand, no music. Screen recording + voice-over (English).

| Time | Shot | Voice-over |
| --- | --- | --- |
| 0:00–0:12 | Home page, title and the two cards | "A community group is handed a spreadsheet. Nobody opens it, the tools are too heavy, and running a server is out of the question. This is Bare Bones." |
| 0:12–0:25 | Press **Play the scenario**, let steps 1–3 play | "A skeleton you copy: one command, five extension points, and the whole app is one config file." |
| 0:25–0:45 | Open **budget**: the empty state (drop zone, expected columns, ghost spheres) | "First visit. It says what it expects: a date, a label, a category, an amount. Nothing is uploaded." |
| 0:45–1:05 | Press **Load demo data** | "Load the sample year. Ninety-nine rows, two set aside — and the two bad rows are kept, with the faulty cell highlighted." |
| 1:05–1:25 | Scroll the overview: balance, came in / went out, bubbles, monthly bars, table | "Every figure is computed from the file: the balance, the categories, the monthly bars. No chart library — the charts are SVG written by hand." |
| 1:25–1:45 | Share card → **Passphrase**, type one, copy the link, open it in a second window, wrong passphrase, then the right one | "The link carries the view, never the file. Public, private, or protected by a passphrase. A tampered link says so — and replaces nothing." |
| 1:45–2:05 | Open **club** (Floodlight), empty state, **Load demo season** | "Second app, same skeleton: a six-team league under the floodlights. The stadium is Three.js, loaded lazily; without WebGL, an image takes over." |
| 2:05–2:20 | Click a team, show the form pills and the points curve, then copy the public link and open it in a phone-sized window | "Standings, form, goal difference. The public link opens the same table on a phone, no account." |
| 2:20–2:40 | Terminal: `node tools/guard.mjs`, `git diff --stat` on core/ui (empty), `pnpm run check` | "Two apps, one skeleton: the guard proves zero lines changed in core and ui. Budgets, tests, property-based checks, Playwright — all green." |
| 2:40–2:55 | `.kiro/` tree, a spec file, `power/bare-bones` | "Built with Kiro: specs first, steering, hooks on save, property-based tests, and a power so an agent can build the third app." |
| 2:55–3:00 | Home page, two cards | "Drop a spreadsheet. Share an explorer." |

## Recording notes

- Resolution 1600×900, browser zoom 100 %, dark room not needed.
- The club's 3D scene takes a second to appear: wait for the floodlights before
  the voice-over line "under the floodlights".
- Show the real deployed URLs in the address bar (gaiasg94.github.io/bare-bones).
- No music. If a bed is added later, it must be licensed for commercial use and
  credited in the video description.
