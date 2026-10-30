# Graph Report - VYROX  (2026-10-29)

## Corpus Check
- 60 files · ~35,315 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 623 nodes · 1528 edges · 22 communities (20 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7cd3f6d5`
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
- types.ts
- test_details.py
- tsconfig.json
- triage-labels.md
- parlays.py
- AiPrediction.tsx
- test_parlays.py
- MatchCenter.tsx
- BetSlip.tsx
- shareCard.ts
- useBetSlip.ts
- details.py

## God Nodes (most connected - your core abstractions)
1. `a11y()` - 28 edges
2. `App()` - 27 edges
3. `MatchCenter()` - 21 edges
4. `fixture()` - 19 edges
5. `react` - 19 edges
6. `useBetSlip()` - 18 edges
7. `compilerOptions` - 18 edges
8. `fetch_matches()` - 17 edges
9. `get_details()` - 17 edges
10. `prob_to_market_odd()` - 16 edges

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
Cohesion: 0.07
Nodes (70): Thinking(), App(), DAYS, FILTERS, longDate(), Message(), shiftDay(), shortWeekday() (+62 more)

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

### Community 10 - "types.ts"
Cohesion: 0.10
Nodes (21): Market, MARKETS, Props, Competition, Goals, League, Lineup, MatchDetails (+13 more)

### Community 11 - "test_details.py"
Cohesion: 0.08
Nodes (35): fixture(), install(), meeting(), team(), api(), expire(), get(), test_finished_match_is_cached_for_six_hours() (+27 more)

### Community 14 - "parlays.py"
Cohesion: 0.05
Nodes (39): api_get(), api_keys(), colombia_today(), fetch_matches(), _fresh(), group_by_league(), _league_order(), _team() (+31 more)

### Community 15 - "AiPrediction.tsx"
Cohesion: 0.24
Nodes (12): CONFIDENCE, MarketOdds(), PredictionCards(), PredictionView(), OddButton(), TicketSlipIcon(), TrendUpIcon(), Card() (+4 more)

### Community 16 - "test_parlays.py"
Cohesion: 0.08
Nodes (34): build(), test_a_day_already_played_builds_a_reference(), test_another_combination_is_another_mix_of_matches_on_target(), test_auto_splits_the_target_into_safe_legs(), test_auto_takes_fewer_legs_when_the_market_pays_more_per_leg(), test_dates_outside_the_free_plan_return_400(), test_one_pick_per_match_with_the_legs_and_market_asked(), test_reads_the_cached_forecast_without_new_calls() (+26 more)

### Community 17 - "MatchCenter.tsx"
Cohesion: 0.14
Nodes (28): BallIcon(), CardIcon(), JerseyIcon(), PitchIcon(), ShareIcon(), SparklesIcon(), StopwatchIcon(), SubIcon() (+20 more)

### Community 18 - "BetSlip.tsx"
Cohesion: 0.18
Nodes (21): BADGES, BetSlip(), CARD, CopInput(), IconButton(), MyBets(), ODD, PICK (+13 more)

### Community 19 - "shareCard.ts"
Cohesion: 0.49
Nodes (10): box(), card(), Ctx, fit(), footer(), forecastCard(), pill(), playCard() (+2 more)

### Community 20 - "useBetSlip.ts"
Cohesion: 0.08
Nodes (35): GoalAlert, newGoals(), Score, goals(), MatchRow(), kickoffTime(), LIVE, STATUS_LABEL (+27 more)

### Community 25 - "details.py"
Cohesion: 0.07
Nodes (34): UpstreamError, _build(), _card(), _cells(), _events(), get_details(), _h2h_summary(), _head_to_head() (+26 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reglas de arquitectura` connect `parlays.py` to `useBetSlip.ts`, `VYROX: contexto del proyecto`?**
  _High betweenness centrality (0.413) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11965811965811966 - nodes in this community are weakly interconnected._
- **Why does `settle()` connect `useBetSlip.ts` to `parlays.py`?**
  _High betweenness centrality (0.283) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._
- **Why does `prob_to_market_odd()` connect `parlays.py` to `test_parlays.py`, `details.py`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0653417645287564 - nodes in this community are weakly interconnected._