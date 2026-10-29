# Graph Report - VYROX  (2026-10-29)

## Corpus Check
- 49 files · ~26,773 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 528 nodes · 1201 edges · 22 communities (20 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `303833a7`
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
- parlays.py
- Probabilities
- test_parlays.py
- MatchCenter.tsx
- gemini.py
- types.ts
- api_football.py
- main.py

## God Nodes (most connected - your core abstractions)
1. `App()` - 23 edges
2. `a11y()` - 21 edges
3. `fixture()` - 19 edges
4. `MatchCenter()` - 18 edges
5. `useBetSlip()` - 18 edges
6. `compilerOptions` - 18 edges
7. `fetch_matches()` - 17 edges
8. `get_details()` - 17 edges
9. `react` - 16 edges
10. `compilerOptions` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Reglas de arquitectura` --references--> `settle()`  [INFERRED]
  docs/proyecto.md → frontend/src/ticketSettlement.ts
- `MatchForecast` --uses--> `Probabilities`  [INFERRED]
  backend/app/parlays.py → backend/app/gemini.py
- `api()` --indirect_call--> `parlays()`  [INFERRED]
  backend/tests/test_parlays.py → backend/app/main.py
- `radar_api()` --indirect_call--> `radar()`  [INFERRED]
  backend/tests/test_radar.py → backend/app/main.py
- `_markets()` --uses--> `MatchForecast`  [INFERRED]
  backend/app/radar.py → backend/app/parlays.py

## Import Cycles
- None detected.

## Communities (22 total, 2 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.12
Nodes (17): expire_cache(), fetch(), fresh_cache(), keys(), league_fixture(), test_a_spent_key_hands_the_same_request_to_the_next_one(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_errors_that_no_other_key_fixes_reach_the_caller() (+9 more)

### Community 1 - "package.json"
Cohesion: 0.08
Nodes (33): dependencies, react@^19.3.1, react-dom@^19.3.1, devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2 (+25 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 3 - "App.tsx"
Cohesion: 0.10
Nodes (44): App(), DAYS, FILTERS, longDate(), Message(), shiftDay(), shortWeekday(), TODAY (+36 more)

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
Cohesion: 0.18
Nodes (16): _build(), _card(), _cells(), _events(), _h2h_summary(), _is_goal(), _lineups(), lineup() (+8 more)

### Community 11 - "test_details.py"
Cohesion: 0.08
Nodes (35): fixture(), install(), meeting(), team(), api(), expire(), get(), test_finished_match_is_cached_for_six_hours() (+27 more)

### Community 14 - "parlays.py"
Cohesion: 0.19
Nodes (10): _build(), day_forecasts(), DayForecast, get_parlays(), kickoff(), _leg(), MatchForecast, _options() (+2 more)

### Community 15 - "Probabilities"
Cohesion: 0.25
Nodes (4): Probabilities, _item(), _markets(), test_no_pick_is_shown_surer_than_92_percent()

### Community 16 - "test_parlays.py"
Cohesion: 0.11
Nodes (23): age(), api(), check_slips(), get(), match(), matches(), test_dates_outside_the_free_plan_return_400(), test_failure_serves_simulated_parlays_and_retries_after_5_minutes() (+15 more)

### Community 17 - "MatchCenter.tsx"
Cohesion: 0.08
Nodes (56): CONFIDENCE, FairOdds(), PredictionCards(), PredictionView(), BADGES, BetSlip(), CopInput(), IconButton() (+48 more)

### Community 19 - "gemini.py"
Cohesion: 0.13
Nodes (8): ask_vyrox_ia(), _context(), _generate(), MatchInfo, predict(), Prediction, Score, predictions()

### Community 20 - "types.ts"
Cohesion: 0.06
Nodes (52): Thinking(), DoubleChevronRightIcon(), DoubleChevronUpIcon(), FlameIcon(), Leg(), ParlayCard(), ParlayGrid(), Props (+44 more)

### Community 25 - "api_football.py"
Cohesion: 0.15
Nodes (9): colombia_today(), fetch_matches(), _fresh(), group_by_league(), _league_order(), _team(), to_match(), upcoming() (+1 more)

### Community 26 - "main.py"
Cohesion: 0.17
Nodes (11): api_get(), api_keys(), UpstreamError, get_details(), _head_to_head(), MatchNotFound, check_available(), match_details() (+3 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `MatchCenter.tsx` to `package.json`, `App.tsx`, `types.ts`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useBetSlip()` (e.g. with `isLeg()` and `isTicket()`) actually correct?**
  _`useBetSlip()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11965811965811966 - nodes in this community are weakly interconnected._
- **Why does `settle()` connect `types.ts` to `VYROX: contexto del proyecto`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._
- **Why does `Reglas de arquitectura` connect `VYROX: contexto del proyecto` to `types.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._