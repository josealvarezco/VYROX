# Graph Report - VYROX  (2026-10-30)

## Corpus Check
- 70 files · ~42,757 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 707 nodes · 1782 edges · 30 communities (28 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bfa66487`
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
- radar.py
- MatchCenter.tsx
- test_parlays.py
- gemini.py
- useBetSlip.ts
- parlays.py
- Radar.tsx
- types.ts
- api_football.py
- main.py
- matchComparator.ts
- details.py
- forecast_rows
- shareCard.ts
- builder.py
- Comparator.tsx

## God Nodes (most connected - your core abstractions)
1. `App()` - 33 edges
2. `a11y()` - 32 edges
3. `fixture()` - 22 edges
4. `react` - 22 edges
5. `MatchCenter()` - 22 edges
6. `useBetSlip()` - 19 edges
7. `compilerOptions` - 18 edges
8. `fetch_matches()` - 17 edges
9. `get_details()` - 17 edges
10. `prob_to_market_odd()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Reglas de arquitectura` --references--> `forecast_rows()`  [INFERRED]
  docs/proyecto.md → backend/app/radar.py
- `Reglas de arquitectura` --references--> `goals()`  [INFERRED]
  docs/proyecto.md → frontend/src/goals.test.ts
- `Reglas de arquitectura` --references--> `newGoals()`  [INFERRED]
  docs/proyecto.md → frontend/src/goals.ts
- `Reglas de arquitectura` --references--> `compareMatches()`  [INFERRED]
  docs/proyecto.md → frontend/src/matchComparator.ts
- `Reglas de arquitectura` --references--> `settle()`  [INFERRED]
  docs/proyecto.md → frontend/src/ticketSettlement.ts

## Import Cycles
- None detected.

## Communities (30 total, 2 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.11
Nodes (17): expire_cache(), fetch(), fresh_cache(), keys(), league_fixture(), test_a_spent_key_hands_the_same_request_to_the_next_one(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_errors_that_no_other_key_fixes_reach_the_caller() (+9 more)

### Community 1 - "package.json"
Cohesion: 0.08
Nodes (33): dependencies, react@^19.3.1, react-dom@^19.3.1, devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2 (+25 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 3 - "App.tsx"
Cohesion: 0.07
Nodes (52): App(), DAYS, FILTERS, hot(), longDate(), Message(), shiftDay(), shortWeekday() (+44 more)

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
Cohesion: 0.15
Nodes (18): choice(), Choices(), Leg(), LEG_COUNTS, MARKETS, ParlayCard(), ParlayGrid(), Props (+10 more)

### Community 11 - "test_details.py"
Cohesion: 0.07
Nodes (37): fixture(), install(), meeting(), team(), api(), expire(), get(), test_a_live_match_gets_its_momentum_and_the_list_shows_it() (+29 more)

### Community 14 - "radar.py"
Cohesion: 0.17
Nodes (10): odds_1x2(), pick_odd(), prob_to_market_odd(), _within(), test_1x2_keeps_the_draw_and_the_favourite_in_range(), test_1x2_shares_a_107_5_percent_book(), test_a_pick_pays_between_1_22_and_2_35(), test_both_sides_of_a_two_way_market_carry_a_6_5_percent_margin() (+2 more)

### Community 15 - "MatchCenter.tsx"
Cohesion: 0.06
Nodes (82): CONFIDENCE, MarketOdds(), PredictionCards(), PredictionView(), Badge(), BankrollAnalytics(), Chart(), Mode (+74 more)

### Community 16 - "test_parlays.py"
Cohesion: 0.08
Nodes (35): build(), test_a_day_already_played_builds_a_reference(), test_another_combination_is_another_mix_of_matches_on_target(), test_auto_splits_the_target_into_safe_legs(), test_auto_takes_fewer_legs_when_the_market_pays_more_per_leg(), test_dates_outside_the_free_plan_return_400(), test_one_pick_per_match_with_the_legs_and_market_asked(), test_reads_the_cached_forecast_without_new_calls() (+27 more)

### Community 17 - "gemini.py"
Cohesion: 0.15
Nodes (8): ask_vyrox_ia(), _context(), _generate(), MatchInfo, predict(), Prediction, Score, predictions()

### Community 18 - "useBetSlip.ts"
Cohesion: 0.09
Nodes (29): bankrollAnalytics(), BankrollPoint, day(), FAMILIES, FAMILY, net(), Settled, DECIDED (+21 more)

### Community 19 - "parlays.py"
Cohesion: 0.14
Nodes (10): Probabilities, _build(), day_forecasts(), DayForecast, get_parlays(), MatchForecast, _options(), simulated_forecast() (+2 more)

### Community 20 - "Radar.tsx"
Cohesion: 0.20
Nodes (13): Thinking(), RadarIcon(), Compare, CompareButton(), Card(), Market, MARKETS, Props (+5 more)

### Community 21 - "types.ts"
Cohesion: 0.13
Nodes (14): Competition, ForecastsResponse, Goals, League, Lineup, MatchDetails, MatchesResponse, MatchEvent (+6 more)

### Community 22 - "api_football.py"
Cohesion: 0.22
Nodes (5): api_get(), api_keys(), colombia_today(), fetch_matches(), _fresh()

### Community 23 - "main.py"
Cohesion: 0.25
Nodes (9): UpstreamError, get_builder(), check_available(), forecasts(), match_details(), matches(), parlay_builder(), parlays() (+1 more)

### Community 24 - "matchComparator.ts"
Cohesion: 0.18
Nodes (11): ComparedSide, compareMatches(), likelier(), phrase(), safety(), side(), teams(), ARSENAL (+3 more)

### Community 25 - "details.py"
Cohesion: 0.07
Nodes (36): _team(), to_match(), _build(), _by_side(), _card(), _cells(), _events(), get_details() (+28 more)

### Community 26 - "forecast_rows"
Cohesion: 0.18
Nodes (9): group_by_league(), _league_order(), kickoff(), upcoming(), _forecast(), forecast_rows(), get_forecasts(), get_radar() (+1 more)

### Community 27 - "shareCard.ts"
Cohesion: 0.42
Nodes (11): box(), card(), Ctx, fit(), footer(), forecastCard(), pill(), playCard() (+3 more)

### Community 28 - "builder.py"
Cohesion: 0.29
Nodes (4): _mixes(), _picks(), _leg(), _parlay()

### Community 29 - "Comparator.tsx"
Cohesion: 0.39
Nodes (7): OddButton(), Column(), Comparator(), METRICS, Slip, DoubleChevronRightIcon(), ScaleCompareIcon()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reglas de arquitectura` connect `radar.py` to `App.tsx`, `VYROX: contexto del proyecto`, `useBetSlip.ts`, `matchComparator.ts`, `forecast_rows`?**
  _High betweenness centrality (0.423) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11375661375661375 - nodes in this community are weakly interconnected._
- **Why does `settle()` connect `useBetSlip.ts` to `radar.py`?**
  _High betweenness centrality (0.200) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._
- **Why does `prob_to_market_odd()` connect `radar.py` to `test_parlays.py`, `gemini.py`, `parlays.py`, `forecast_rows`, `builder.py`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07418788410886742 - nodes in this community are weakly interconnected._