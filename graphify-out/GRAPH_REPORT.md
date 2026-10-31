# Graph Report - VYROX  (2026-10-30)

## Corpus Check
- 76 files · ~45,806 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 751 nodes · 1917 edges · 30 communities (28 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d21d6b0c`
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
- MatchCenter.tsx
- test_details.py
- tsconfig.json
- triage-labels.md
- radar.py
- BetSlip.tsx
- test_parlays.py
- gemini.py
- useBetSlip.ts
- parlays.py
- AiPrediction.tsx
- types.ts
- Match
- MatchList.tsx
- test_bookmakers.py
- details.py
- forecast_rows
- OddsTable.tsx
- builder.py
- _markets

## God Nodes (most connected - your core abstractions)
1. `a11y()` - 34 edges
2. `App()` - 33 edges
3. `react` - 24 edges
4. `MatchCenter()` - 24 edges
5. `fixture()` - 23 edges
6. `useBetSlip()` - 20 edges
7. `UpstreamError` - 18 edges
8. `compilerOptions` - 18 edges
9. `fetch_matches()` - 17 edges
10. `get_details()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Reglas de arquitectura` --references--> `forecast_rows()`  [INFERRED]
  docs/proyecto.md → backend/app/radar.py
- `Reglas de arquitectura` --references--> `bestHouse()`  [INFERRED]
  docs/proyecto.md → frontend/src/bookmakers.ts
- `Reglas de arquitectura` --references--> `goals()`  [INFERRED]
  docs/proyecto.md → frontend/src/goals.test.ts
- `Reglas de arquitectura` --references--> `newGoals()`  [INFERRED]
  docs/proyecto.md → frontend/src/goals.ts
- `Reglas de arquitectura` --references--> `compareMatches()`  [INFERRED]
  docs/proyecto.md → frontend/src/matchComparator.ts

## Import Cycles
- None detected.

## Communities (30 total, 2 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.11
Nodes (17): expire_cache(), fetch(), fresh_cache(), keys(), league_fixture(), test_a_spent_key_hands_the_same_request_to_the_next_one(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_errors_that_no_other_key_fixes_reach_the_caller() (+9 more)

### Community 1 - "package.json"
Cohesion: 0.07
Nodes (33): dependencies, react@^19.3.1, react-dom@^19.3.1, devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2 (+25 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 3 - "App.tsx"
Cohesion: 0.06
Nodes (87): App(), DAYS, FILTERS, hot(), longDate(), Message(), shiftDay(), shortWeekday() (+79 more)

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

### Community 10 - "MatchCenter.tsx"
Cohesion: 0.16
Nodes (19): HeadToHead(), Lineups(), MatchCenter(), Note(), Pitch(), SIDE_COLOR, SIDE_RING, SIDES (+11 more)

### Community 11 - "test_details.py"
Cohesion: 0.07
Nodes (37): fixture(), install(), meeting(), team(), api(), expire(), get(), test_a_live_match_gets_its_momentum_and_the_list_shows_it() (+29 more)

### Community 14 - "radar.py"
Cohesion: 0.15
Nodes (11): odds_1x2(), pick_odd(), prob_to_market_odd(), _within(), _forecast(), test_1x2_keeps_the_draw_and_the_favourite_in_range(), test_1x2_shares_a_107_5_percent_book(), test_a_pick_pays_between_1_22_and_2_35() (+3 more)

### Community 15 - "BetSlip.tsx"
Cohesion: 0.08
Nodes (45): Badge(), BankrollAnalytics(), Chart(), Mode, MODES, bankrollAnalytics(), BankrollPoint, day() (+37 more)

### Community 16 - "test_parlays.py"
Cohesion: 0.08
Nodes (35): build(), test_a_day_already_played_builds_a_reference(), test_another_combination_is_another_mix_of_matches_on_target(), test_auto_splits_the_target_into_safe_legs(), test_auto_takes_fewer_legs_when_the_market_pays_more_per_leg(), test_dates_outside_the_free_plan_return_400(), test_one_pick_per_match_with_the_legs_and_market_asked(), test_reads_the_cached_forecast_without_new_calls() (+27 more)

### Community 17 - "gemini.py"
Cohesion: 0.14
Nodes (9): ask_vyrox_ia(), _context(), _generate(), MatchInfo, predict(), Prediction, Probabilities, Score (+1 more)

### Community 18 - "useBetSlip.ts"
Cohesion: 0.07
Nodes (31): ComparedSide, compareMatches(), likelier(), phrase(), safety(), side(), teams(), ARSENAL (+23 more)

### Community 19 - "parlays.py"
Cohesion: 0.19
Nodes (10): _build(), day_forecasts(), DayForecast, get_parlays(), kickoff(), _leg(), MatchForecast, _options() (+2 more)

### Community 20 - "AiPrediction.tsx"
Cohesion: 0.14
Nodes (23): CONFIDENCE, MarketOdds(), PredictionCards(), PredictionView(), Thinking(), OddButton(), StakeSimulator(), CheckIcon() (+15 more)

### Community 21 - "types.ts"
Cohesion: 0.12
Nodes (18): bestHouse(), quote(), slot(), BookmakerOdds, Competition, ForecastsResponse, Goals, League (+10 more)

### Community 22 - "Match"
Cohesion: 0.22
Nodes (11): GoalAlert, newGoals(), Score, goals(), NOTES, playGoal(), Match, ALERT_MODES (+3 more)

### Community 23 - "MatchList.tsx"
Cohesion: 0.29
Nodes (10): ActivityPulseIcon(), CompareButton(), MatchRow(), MomentumPanel(), PressureBar(), kickoffTime(), LIVE, STATUS_LABEL (+2 more)

### Community 24 - "test_bookmakers.py"
Cohesion: 0.32
Nodes (9): api(), bet(), expire(), get(), response(), test_a_match_without_odds_or_without_a_key(), test_each_bookmaker_with_the_markets_it_fully_quotes(), test_odds_are_cached_for_three_hours_and_arrows_show_real_moves() (+1 more)

### Community 25 - "details.py"
Cohesion: 0.06
Nodes (48): api_get(), api_keys(), UpstreamError, _bookmakers(), get_odds(), _quote(), _build(), _by_side() (+40 more)

### Community 26 - "forecast_rows"
Cohesion: 0.14
Nodes (11): colombia_today(), fetch_matches(), _fresh(), group_by_league(), _league_order(), _team(), to_match(), upcoming() (+3 more)

### Community 27 - "OddsTable.tsx"
Cohesion: 0.27
Nodes (10): selection(), TrendDownArrowIcon(), TrendUpArrowIcon(), COLUMNS, LINES, OddsTable(), pill(), TABS (+2 more)

### Community 28 - "builder.py"
Cohesion: 0.27
Nodes (3): get_builder(), _mixes(), _picks()

### Community 29 - "_markets"
Cohesion: 0.50
Nodes (3): _item(), _markets(), test_no_pick_is_shown_surer_than_92_percent()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reglas de arquitectura` connect `radar.py` to `VYROX: contexto del proyecto`, `useBetSlip.ts`, `types.ts`, `Match`, `forecast_rows`?**
  _High betweenness centrality (0.427) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11375661375661375 - nodes in this community are weakly interconnected._
- **Why does `bestHouse()` connect `types.ts` to `App.tsx`, `radar.py`, `BetSlip.tsx`?**
  _High betweenness centrality (0.170) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07207207207207207 - nodes in this community are weakly interconnected._
- **Why does `prob_to_market_odd()` connect `radar.py` to `test_parlays.py`, `gemini.py`, `parlays.py`, `forecast_rows`, `builder.py`, `_markets`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05670103092783505 - nodes in this community are weakly interconnected._