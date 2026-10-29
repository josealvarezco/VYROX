# Graph Report - VYROX  (2026-10-29)

## Corpus Check
- 44 files · ~21,859 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 462 nodes · 1003 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8688e324`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_matches.py
- package.json
- compilerOptions
- App.tsx
- compilerOptions
- VYROX: contexto del proyecto
- Agent skills
- Issue tracker: GitHub
- Domain Docs
- .oxlintrc.json
- details.py
- test_details.py
- tsconfig.json
- triage-labels.md
- MatchCenter.tsx
- details.py
- test_parlays.py

## God Nodes (most connected - your core abstractions)
1. `App()` - 21 edges
2. `a11y()` - 19 edges
3. `MatchCenter()` - 18 edges
4. `compilerOptions` - 18 edges
5. `fixture()` - 17 edges
6. `fetch_matches()` - 16 edges
7. `get_details()` - 16 edges
8. `react` - 15 edges
9. `compilerOptions` - 15 edges
10. `post()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `api()` --indirect_call--> `parlays()`  [INFERRED]
  backend/tests/test_parlays.py → backend/app/main.py
- `fresh_cache()` --references--> `fixture()`  [EXTRACTED]
  backend/tests/test_matches.py → backend/tests/fake_api_football.py
- `get_details()` --uses--> `UpstreamError`  [INFERRED]
  backend/app/details.py → backend/app/api_football.py
- `match_details()` --uses--> `UpstreamError`  [INFERRED]
  backend/app/main.py → backend/app/api_football.py
- `matches()` --uses--> `UpstreamError`  [INFERRED]
  backend/app/main.py → backend/app/api_football.py

## Import Cycles
- None detected.

## Communities (17 total, 2 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.12
Nodes (13): expire_cache(), fetch(), fresh_cache(), league_fixture(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_finished_past_day_is_never_requested_again(), test_future_day_is_not_treated_as_final(), test_past_day_refreshes_after_ttl_until_it_is_final() (+5 more)

### Community 1 - "package.json"
Cohesion: 0.08
Nodes (32): dependencies, react@^19.3.1, react-dom@^19.3.1, devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2 (+24 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 3 - "App.tsx"
Cohesion: 0.10
Nodes (42): App(), DAYS, FILTERS, longDate(), Message(), shiftDay(), shortWeekday(), TODAY (+34 more)

### Community 4 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 5 - "VYROX: contexto del proyecto"
Cohesion: 0.15
Nodes (11): Etapa actual, Fuera de alcance, Hitos, Idioma, Qué es, Reglas de arquitectura, Stack, VYROX: contexto del proyecto (+3 more)

### Community 6 - "Agent skills"
Cohesion: 0.29
Nodes (6): Agent skills, Domain docs, graphify, Issue tracker, Proyecto, Triage labels

### Community 7 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 8 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 9 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 10 - "details.py"
Cohesion: 0.05
Nodes (36): api_get(), fetch_matches(), _fresh(), group_by_league(), _league_order(), _team(), to_match(), UpstreamError (+28 more)

### Community 11 - "test_details.py"
Cohesion: 0.08
Nodes (35): fixture(), install(), meeting(), team(), api(), expire(), get(), test_finished_match_is_cached_for_six_hours() (+27 more)

### Community 14 - "MatchCenter.tsx"
Cohesion: 0.05
Nodes (85): CONFIDENCE, FairOdds(), PredictionCards(), PredictionView(), Thinking(), BetSlip(), CopInput(), OddButton() (+77 more)

### Community 15 - "details.py"
Cohesion: 0.21
Nodes (14): _build(), _card(), _cells(), _events(), _is_goal(), _lineups(), lineup(), player() (+6 more)

### Community 16 - "test_parlays.py"
Cohesion: 0.17
Nodes (15): colombia_today(), age(), api(), check_slips(), get(), match(), matches(), test_dates_outside_the_free_plan_return_400() (+7 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `package.json`, `MatchCenter.tsx`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Why does `fixture()` connect `test_details.py` to `test_matches.py`, `test_parlays.py`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08021390374331551 - nodes in this community are weakly interconnected._
- **Why does `fetch_matches()` connect `details.py` to `test_parlays.py`, `test_matches.py`, `details.py`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10159651669085631 - nodes in this community are weakly interconnected._