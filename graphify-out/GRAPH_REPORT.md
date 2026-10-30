# Graph Report - VYROX  (2026-10-29)

## Corpus Check
- 57 files · ~32,563 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 583 nodes · 1401 edges · 19 communities (17 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `09d2ca09`
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
- test_details.py
- tsconfig.json
- triage-labels.md
- parlays.py
- test_parlays.py
- MatchCenter.tsx
- BetSlip.tsx
- useBetSlip.ts
- details.py

## God Nodes (most connected - your core abstractions)
1. `App()` - 27 edges
2. `a11y()` - 26 edges
3. `MatchCenter()` - 21 edges
4. `fixture()` - 19 edges
5. `react` - 19 edges
6. `useBetSlip()` - 18 edges
7. `compilerOptions` - 18 edges
8. `fetch_matches()` - 17 edges
9. `get_details()` - 17 edges
10. `compilerOptions` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Reglas de arquitectura` --references--> `goals()`  [INFERRED]
  docs/proyecto.md → frontend/src/goals.test.ts
- `Reglas de arquitectura` --references--> `newGoals()`  [INFERRED]
  docs/proyecto.md → frontend/src/goals.ts
- `Reglas de arquitectura` --references--> `settle()`  [INFERRED]
  docs/proyecto.md → frontend/src/ticketSettlement.ts
- `Reglas de arquitectura` --references--> `prob_to_market_odd()`  [INFERRED]
  docs/proyecto.md → backend/app/odds.py
- `Reglas de arquitectura` --references--> `odds_1x2()`  [INFERRED]
  docs/proyecto.md → backend/app/odds.py

## Import Cycles
- None detected.

## Communities (19 total, 2 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.11
Nodes (17): expire_cache(), fetch(), fresh_cache(), keys(), league_fixture(), test_a_spent_key_hands_the_same_request_to_the_next_one(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_errors_that_no_other_key_fixes_reach_the_caller() (+9 more)

### Community 1 - "package.json"
Cohesion: 0.09
Nodes (29): devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@~7.0.2 (+21 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 3 - "App.tsx"
Cohesion: 0.09
Nodes (43): dependencies, react@^19.3.1, react-dom@^19.3.1, App(), DAYS, FILTERS, longDate(), Message() (+35 more)

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

### Community 11 - "test_details.py"
Cohesion: 0.07
Nodes (36): fixture(), install(), meeting(), team(), api(), expire(), get(), test_finished_match_is_cached_for_six_hours() (+28 more)

### Community 14 - "parlays.py"
Cohesion: 0.06
Nodes (39): group_by_league(), ask_vyrox_ia(), _generate(), Prediction, Probabilities, Score, odds_1x2(), pick_odd() (+31 more)

### Community 16 - "test_parlays.py"
Cohesion: 0.17
Nodes (14): age(), api(), check_slips(), get(), match(), matches(), test_dates_outside_the_free_plan_return_400(), test_failure_serves_simulated_parlays_and_retries_after_5_minutes() (+6 more)

### Community 17 - "MatchCenter.tsx"
Cohesion: 0.05
Nodes (89): CONFIDENCE, MarketOdds(), PredictionCards(), PredictionView(), Thinking(), OddButton(), StakeSimulator(), GoalToasts() (+81 more)

### Community 18 - "BetSlip.tsx"
Cohesion: 0.15
Nodes (25): BADGES, CARD, CopInput(), IconButton(), MyBets(), ODD, PICK, pill() (+17 more)

### Community 20 - "useBetSlip.ts"
Cohesion: 0.09
Nodes (31): GoalAlert, newGoals(), Score, goals(), DECIDED, legResult(), liveResult(), settle() (+23 more)

### Community 25 - "details.py"
Cohesion: 0.07
Nodes (37): api_get(), api_keys(), colombia_today(), fetch_matches(), _fresh(), _league_order(), _team(), to_match() (+29 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reglas de arquitectura` connect `parlays.py` to `useBetSlip.ts`, `VYROX: contexto del proyecto`?**
  _High betweenness centrality (0.407) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11375661375661375 - nodes in this community are weakly interconnected._
- **Why does `settle()` connect `useBetSlip.ts` to `parlays.py`?**
  _High betweenness centrality (0.274) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08817204301075268 - nodes in this community are weakly interconnected._
- **Why does `prob_to_market_odd()` connect `parlays.py` to `test_parlays.py`?**
  _High betweenness centrality (0.164) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09433962264150944 - nodes in this community are weakly interconnected._