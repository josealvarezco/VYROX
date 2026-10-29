# Graph Report - VYROX  (2026-10-29)

## Corpus Check
- 55 files · ~31,170 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 564 nodes · 1336 edges · 23 communities (20 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6c4bbb53`
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
- test_parlays.py
- MatchCenter.tsx
- BetSlip.tsx
- gemini.py
- useBetSlip.ts
- api_football.py
- main.py

## God Nodes (most connected - your core abstractions)
1. `App()` - 26 edges
2. `a11y()` - 25 edges
3. `MatchCenter()` - 21 edges
4. `fixture()` - 19 edges
5. `react` - 19 edges
6. `useBetSlip()` - 18 edges
7. `compilerOptions` - 18 edges
8. `fetch_matches()` - 17 edges
9. `get_details()` - 17 edges
10. `compilerOptions` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Reglas de arquitectura` --references--> `settle()`  [INFERRED]
  docs/proyecto.md → frontend/src/ticketSettlement.ts
- `Reglas de arquitectura` --references--> `goals()`  [INFERRED]
  docs/proyecto.md → frontend/src/goals.test.ts
- `Reglas de arquitectura` --references--> `newGoals()`  [INFERRED]
  docs/proyecto.md → frontend/src/goals.ts
- `get_details()` --uses--> `UpstreamError`  [INFERRED]
  backend/app/details.py → backend/app/api_football.py
- `api()` --indirect_call--> `parlays()`  [INFERRED]
  backend/tests/test_parlays.py → backend/app/main.py

## Import Cycles
- None detected.

## Communities (23 total, 3 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.10
Nodes (17): expire_cache(), fetch(), fresh_cache(), keys(), league_fixture(), test_a_spent_key_hands_the_same_request_to_the_next_one(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_errors_that_no_other_key_fixes_reach_the_caller() (+9 more)

### Community 1 - "package.json"
Cohesion: 0.08
Nodes (33): dependencies, react@^19.3.1, react-dom@^19.3.1, devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2 (+25 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 3 - "App.tsx"
Cohesion: 0.08
Nodes (47): Reglas de arquitectura, App(), DAYS, FILTERS, longDate(), Message(), shiftDay(), shortWeekday() (+39 more)

### Community 4 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 5 - "VYROX: contexto del proyecto"
Cohesion: 0.17
Nodes (10): Etapa actual, Fuera de alcance, Hitos, Idioma, Qué es, Stack, VYROX: contexto del proyecto, Backend (FastAPI) (+2 more)

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
Cohesion: 0.21
Nodes (14): _build(), _card(), _cells(), _events(), _is_goal(), _lineups(), lineup(), player() (+6 more)

### Community 11 - "test_details.py"
Cohesion: 0.07
Nodes (36): fixture(), install(), meeting(), team(), api(), expire(), get(), test_finished_match_is_cached_for_six_hours() (+28 more)

### Community 14 - "parlays.py"
Cohesion: 0.12
Nodes (18): group_by_league(), _league_order(), Probabilities, _build(), day_forecasts(), DayForecast, get_parlays(), kickoff() (+10 more)

### Community 16 - "test_parlays.py"
Cohesion: 0.13
Nodes (22): age(), api(), check_slips(), get(), match(), matches(), test_dates_outside_the_free_plan_return_400(), test_failure_serves_simulated_parlays_and_retries_after_5_minutes() (+14 more)

### Community 17 - "MatchCenter.tsx"
Cohesion: 0.05
Nodes (87): CONFIDENCE, FairOdds(), PredictionCards(), PredictionView(), Thinking(), OddButton(), a11y(), BallIcon() (+79 more)

### Community 18 - "BetSlip.tsx"
Cohesion: 0.15
Nodes (27): BADGES, BetSlip(), CARD, CopInput(), IconButton(), MyBets(), ODD, PICK (+19 more)

### Community 19 - "gemini.py"
Cohesion: 0.13
Nodes (8): ask_vyrox_ia(), _context(), _generate(), MatchInfo, predict(), Prediction, Score, predictions()

### Community 20 - "useBetSlip.ts"
Cohesion: 0.13
Nodes (21): DECIDED, legResult(), liveResult(), settle(), BOTH_SCORE, HOME_WIN, SavedTicket, SlipLeg (+13 more)

### Community 25 - "api_football.py"
Cohesion: 0.17
Nodes (11): api_get(), api_keys(), colombia_today(), fetch_matches(), _fresh(), _team(), to_match(), get_details() (+3 more)

### Community 26 - "main.py"
Cohesion: 0.27
Nodes (7): UpstreamError, MatchNotFound, check_available(), match_details(), matches(), parlays(), radar()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `package.json`, `BetSlip.tsx`, `useBetSlip.ts`, `MatchCenter.tsx`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.10344827586206896 - nodes in this community are weakly interconnected._
- **Why does `Reglas de arquitectura` connect `App.tsx` to `useBetSlip.ts`, `VYROX: contexto del proyecto`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._
- **Why does `VYROX: contexto del proyecto` connect `VYROX: contexto del proyecto` to `App.tsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08408249603384453 - nodes in this community are weakly interconnected._