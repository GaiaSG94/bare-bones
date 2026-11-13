# skeleton-and-orb — Requirements (EARS)

## 1. Starter

**Requirement 1.1** — The starter shall contain one config file exposing the
five registries and one entry point rendering the generic explorer.

**Requirement 1.2** — When a user drops a CSV or chooses `Load demo data`,
the starter shall show a typed table without requiring a server.

**Requirement 1.3** — The starter shall remain under 300 non-test source
lines, enforced by the line-budget guard.

## 2. Budget application

**Requirement 2.1** — The budget app shall import a bank statement with
`date`, `label`, and `amount` columns and derive one of Membership, Grants,
Activities, Events, Premises, Fixed costs, or Other.

**Requirement 2.2** — The app shall display computed income, expenses,
balance, spending by category, monthly spending, and actual vs plan. No
visible amount shall be hard-coded in the UI.

**Requirement 2.3** — The app shall preserve rejected rows and show their
reason, including an impossible date and an invalid number in the demo data.

**Requirement 2.4** — The app shall offer a private encrypted share link by
default and a public view-only link as an option.

## 3. Orb design

**Requirement 3.1** — On a desktop viewport, the app shall render the Orb
composition: off-white background, rounded white cards, left navigation,
central metrics/charts/table, and a right sharing/plan rail.

**Requirement 3.2** — Category bubbles shall use the category design tokens
and their sizes shall derive from the computed category totals.

**Requirement 3.3** — The app shall include the "Your data stays here"
notice and a `← Bare Bones` link.

## 4. Proof

**Requirement 4.1** — Property tests shall prove category labels always map
to a known category and demo totals are conserved.

**Requirement 4.2** — The app shall typecheck and build under the monorepo
CI budget.
