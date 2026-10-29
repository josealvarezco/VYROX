# Graph Report - VYROX  (2026-10-29)

## Corpus Check
- 46 files · ~24,137 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 486 nodes · 1072 edges · 22 communities (19 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `70c1bf71`
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
- main.py
- test_details.py
- tsconfig.json
- triage-labels.md
- MatchCenter.tsx
- details.py
- test_parlays.py
- types.ts
- api_football.py
- parlays.py
- gemini.py

## God Nodes (most connected - your core abstractions)
1. `App()` - 21 edges
2. `a11y()` - 20 edges
3. `MatchCenter()` - 18 edges
4. `compilerOptions` - 18 edges
5. `fixture()` - 17 edges
6. `useBetSlip()` - 17 edges
7. `fetch_matches()` - 16 edges
8. `get_details()` - 16 edges
9. `react` - 15 edges
10. `compilerOptions` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Reglas de arquitectura` --references--> `settle()`  [INFERRED]
  docs/proyecto.md → frontend/src/ticketSettlement.ts
- `get_details()` --uses--> `UpstreamError`  [INFERRED]
  backend/app/details.py → backend/app/api_football.py
- `api()` --indirect_call--> `parlays()`  [INFERRED]
  backend/tests/test_parlays.py → backend/app/main.py
- `fresh_cache()` --references--> `fixture()`  [EXTRACTED]
  backend/tests/test_matches.py → backend/tests/fake_api_football.py
- `match_details()` --uses--> `UpstreamError`  [INFERRED]
  backend/app/main.py → backend/app/api_football.py

## Import Cycles
- None detected.

## Communities (22 total, 3 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.12
Nodes (13): expire_cache(), fetch(), fresh_cache(), league_fixture(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_finished_past_day_is_never_requested_again(), test_future_day_is_not_treated_as_final(), test_past_day_refreshes_after_ttl_until_it_is_final() (+5 more)

### Community 1 - "package.json"
Cohesion: 0.09
Nodes (29): devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@~7.0.2 (+21 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 3 - "App.tsx"
Cohesion: 0.10
Nodes (41): dependencies, react@^19.3.1, react-dom@^19.3.1, App(), DAYS, FILTERS, longDate(), Message() (+33 more)

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

### Community 10 - "main.py"
Cohesion: 0.16
Nodes (11): group_by_league(), _league_order(), UpstreamError, MatchNotFound, MatchInfo, predict(), check_available(), match_details() (+3 more)

### Community 11 - "test_details.py"
Cohesion: 0.08
Nodes (35): fixture(), install(), meeting(), team(), api(), expire(), get(), test_finished_match_is_cached_for_six_hours() (+27 more)

### Community 14 - "MatchCenter.tsx"
Cohesion: 0.07
Nodes (72): CONFIDENCE, FairOdds(), PredictionCards(), PredictionView(), Thinking(), BADGES, BetSlip(), CopInput() (+64 more)

### Community 15 - "details.py"
Cohesion: 0.21
Nodes (14): _build(), _card(), _cells(), _events(), _is_goal(), _lineups(), lineup(), player() (+6 more)

### Community 16 - "test_parlays.py"
Cohesion: 0.17
Nodes (15): colombia_today(), age(), api(), check_slips(), get(), match(), matches(), test_dates_outside_the_free_plan_return_400() (+7 more)

### Community 17 - "types.ts"
Cohesion: 0.08
Nodes (33): legResult(), settle(), BOTH_SCORE, HOME_WIN, Goals, League, Lineup, Match (+25 more)

### Community 18 - "api_football.py"
Cohesion: 0.18
Nodes (9): api_get(), fetch_matches(), _fresh(), _team(), to_match(), get_details(), _h2h_summary(), _head_to_head() (+1 more)

### Community 19 - "parlays.py"
Cohesion: 0.19
Nodes (11): Probabilities, _build(), DayForecast, _forecasts(), get_parlays(), _kickoff(), _leg(), MatchForecast (+3 more)

### Community 20 - "gemini.py"
Cohesion: 0.13
Nodes (5): ask_vyrox_ia(), _context(), _generate(), Prediction, Score

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `package.json`, `MatchCenter.tsx`, `types.ts`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Why does `settle()` connect `types.ts` to `VYROX: contexto del proyecto`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08817204301075268 - nodes in this community are weakly interconnected._
- **Why does `Reglas de arquitectura` connect `VYROX: contexto del proyecto` to `types.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09647058823529411 - nodes in this community are weakly interconnected._