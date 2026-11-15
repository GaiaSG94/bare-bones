# Bare Bones power (Kiro)

A **Kiro power** that teaches an agent how to build a new explorer on the
Bare Bones skeleton: the five registries, the two share modes, the budget
rules and the rubric the judges apply.

```
power/bare-bones/
├─ POWER.md            what this power is, when it activates
├─ skill/
│  └─ new-explorer-app/SKILL.md
├─ datasets/
│  ├─ budget-monthly.csv        small association ledger (income/expense)
│  └─ league-week.csv           six-team amateur league results
└─ rubric.md           the review rubric used to grade a new app
```

## Activation

The agent loads this power when the user asks to *create, copy or adapt*
an explorer app, or to review one. Keywords: "new explorer", "copy the
skeleton", "add an app", "second app", "Bare Bones".

## The five registries (the only customization surface)

| Registry | Answers |
| --- | --- |
| `importers` | How is the file read? (CSV, its columns, its quirks) |
| `derivations` | What is computed per row? (categories, outcomes, months) |
| `reducers` | What are the headline numbers? (balance, leader, totals) |
| `views` | What does the user look at? (table, chart, filters) |
| `shareAdapters` | How is the view shared? (public compact, private encrypted) |

Nothing else changes: `packages/core` and `packages/ui` are frozen and the
CI guard proves it (`tools/core-ui.sha256`).
