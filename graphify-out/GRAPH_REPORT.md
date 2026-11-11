# Graph Report - VYROX  (2026-11-11)

## Corpus Check
- 95 files · ~66,882 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 928 nodes · 2520 edges · 41 communities (38 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 69 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f30ee62c`
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
- test_predictions.py
- tsconfig.json
- triage-labels.md
- builder.py
- BetSlip.tsx
- test_parlays.py
- sameGameParlay.ts
- ticketSettlement.test.ts
- capture.mjs
- test_radar.py
- types.ts
- Radar.tsx
- MatchList.tsx
- parlays.py
- bookmakers.ts
- radar.py
- Comparator.tsx
- ThemeToggle.tsx
- OddsTable.tsx
- Parlays.tsx
- icons.tsx
- test_builder.py
- AiPrediction.tsx
- TicketSlipIcon
- vercel.json
- test_live.py
- Sidebar.tsx
- main.py
- builder.py
- usePinned.ts

## God Nodes (most connected - your core abstractions)
1. `App()` - 49 edges
2. `a11y()` - 42 edges
3. `react` - 29 edges
4. `MatchCenter()` - 26 edges
5. `colombia_today()` - 24 edges
6. `fixture()` - 23 edges
7. `useBetSlip()` - 22 edges
8. `MatchForecast` - 21 edges
9. `BetSlip()` - 20 edges
10. `Reglas de arquitectura` - 20 edges

## Surprising Connections (you probably didn't know these)
- `Reglas de arquitectura` --references--> `open_rows()`  [INFERRED]
  docs/proyecto.md → backend/app/parlays.py
- `Reglas de arquitectura` --references--> `Parlays()`  [INFERRED]
  docs/proyecto.md → frontend/src/Parlays.tsx
- `Reglas de arquitectura` --references--> `VyroxDropdown()`  [INFERRED]
  docs/proyecto.md → frontend/src/VyroxDropdown.tsx
- `Reglas de arquitectura` --references--> `bestHouse()`  [INFERRED]
  docs/proyecto.md → frontend/src/bookmakers.ts
- `Reglas de arquitectura` --references--> `goals()`  [INFERRED]
  docs/proyecto.md → frontend/src/goals.test.ts

## Import Cycles
- None detected.

## Communities (41 total, 3 thin omitted)

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
Cohesion: 0.12
Nodes (25): ALERT_ICONS, App(), DAYS, FILTERS, hot(), longDate(), Message(), QUICK_MARKETS (+17 more)

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
Nodes (21): CHIP, HeadToHead(), Lineups(), Markings(), MatchCenter(), Note(), Pitch(), PlayerCard() (+13 more)

### Community 11 - "test_predictions.py"
Cohesion: 0.05
Nodes (50): measure(), pressure(), attack(), with_momentum(), fixture(), install(), meeting(), team() (+42 more)

### Community 14 - "builder.py"
Cohesion: 0.13
Nodes (13): live_odd(), odds_1x2(), pick_odd(), prob_to_market_odd(), _within(), next_date(), test_a_live_odd_always_carries_a_margin_and_a_settled_side_has_none(), test_1x2_keeps_the_draw_and_the_favourite_in_range() (+5 more)

### Community 15 - "BetSlip.tsx"
Cohesion: 0.10
Nodes (43): Badge(), BankrollAnalytics(), Chart(), Mode, MODES, BADGES, CARD, CopInput() (+35 more)

### Community 16 - "test_parlays.py"
Cohesion: 0.17
Nodes (16): colombia_today(), test_a_later_forecast_keeps_the_earlier_one_of_matches_already_live(), age(), api(), check_slips(), get(), matches(), test_dates_outside_the_free_plan_return_400() (+8 more)

### Community 17 - "sameGameParlay.ts"
Cohesion: 0.11
Nodes (37): BetBuilder(), pill(), Base, betBuilderMarkets(), calculateCorrelatedOdd(), Chances, Choice, fitModel() (+29 more)

### Community 18 - "ticketSettlement.test.ts"
Cohesion: 0.43
Nodes (7): ComparedSide, compareMatches(), likelier(), phrase(), safety(), side(), teams()

### Community 19 - "capture.mjs"
Cohesion: 0.17
Nodes (4): OUT, openPage(), OUT, [WIDTH, HEIGHT]

### Community 20 - "test_radar.py"
Cohesion: 0.28
Nodes (10): check(), get(), picks(), radar_api(), test_a_day_already_played_shows_its_matches_as_a_reference(), test_forecasts_price_every_match_like_the_radar_without_a_new_call(), test_four_markets_from_one_forecast(), test_no_matches() (+2 more)

### Community 21 - "types.ts"
Cohesion: 0.11
Nodes (20): API_BASE_URL, Market, TARGETS, Competition, ForecastPick, ForecastsResponse, Goals, League (+12 more)

### Community 22 - "Radar.tsx"
Cohesion: 0.22
Nodes (10): Thinking(), Compare, Card(), Market, MARKETS, Props, RadarGrid(), RadarCategory (+2 more)

### Community 23 - "MatchList.tsx"
Cohesion: 0.05
Nodes (61): bankrollAnalytics(), BankrollPoint, day(), FAMILIES, FAMILY, net(), Settled, GoalAlert (+53 more)

### Community 24 - "parlays.py"
Cohesion: 0.10
Nodes (10): ask_vyrox_ia(), _generate(), Prediction, Probabilities, Score, _build(), DayForecast, _fresh() (+2 more)

### Community 25 - "bookmakers.ts"
Cohesion: 0.31
Nodes (6): bestHouse(), quote(), selection(), slot(), BookmakerOdds, MatchOdds

### Community 26 - "radar.py"
Cohesion: 0.12
Nodes (17): group_by_league(), day_forecasts(), kickoff(), MatchForecast, open_rows(), prices(), simulated_forecast(), still_open() (+9 more)

### Community 27 - "Comparator.tsx"
Cohesion: 0.36
Nodes (9): BetSlip(), Column(), Comparator(), Crests(), METRICS, Slip, CrossIcon(), ScaleCompareIcon() (+1 more)

### Community 28 - "ThemeToggle.tsx"
Cohesion: 0.83
Nodes (3): MoonIcon(), SunIcon(), ThemeToggle()

### Community 29 - "OddsTable.tsx"
Cohesion: 0.33
Nodes (8): OddButton(), TrendCorner(), COLUMNS, LINES, OddsTable(), pill(), TABS, OddsMarket

### Community 30 - "Parlays.tsx"
Cohesion: 0.14
Nodes (23): Collapse(), ArrowLeftIcon(), DoubleChevronRightIcon(), DoubleChevronUpIcon(), RefreshIcon(), BADGE, choice(), Choices() (+15 more)

### Community 31 - "icons.tsx"
Cohesion: 0.13
Nodes (29): a11y(), BallIcon(), BellRingIcon(), CalendarIcon(), CARD, CardIcon(), CollapseAllIcon(), CopyIcon() (+21 more)

### Community 32 - "test_builder.py"
Cohesion: 0.31
Nodes (11): build(), test_a_day_already_played_builds_a_reference(), test_another_combination_is_another_mix_of_matches_on_target(), test_auto_splits_the_target_into_safe_legs(), test_auto_takes_fewer_legs_when_the_market_pays_more_per_leg(), test_dates_outside_the_free_plan_return_400(), test_one_pick_per_match_with_the_legs_and_market_asked(), test_reads_the_cached_forecast_without_new_calls() (+3 more)

### Community 33 - "AiPrediction.tsx"
Cohesion: 0.29
Nodes (8): CONFIDENCE, MarketOdds(), PredictionCards(), PredictionView(), byMatch(), totalOdd(), Prediction, usePrediction()

### Community 34 - "TicketSlipIcon"
Cohesion: 0.46
Nodes (6): GoalToasts(), StarIcon(), TicketSlipIcon(), blast(), playRefereeWhistle(), scheduleWhistle()

### Community 37 - "test_live.py"
Cohesion: 0.13
Nodes (22): chances_at(), live_forecast(), finished(), live_match(), test_a_forecast_keeps_its_chances_at_kickoff(), test_a_goal_moves_the_chances_toward_the_side_that_scored(), test_a_slip_never_takes_what_the_score_settled(), test_another_day_never_points_ahead() (+14 more)

### Community 38 - "Sidebar.tsx"
Cohesion: 0.22
Nodes (19): CheckIcon(), Chevron(), FilterIcon(), Flag(), byCountry(), countryLabel(), fold(), LEAD_COUNTRIES (+11 more)

### Community 42 - "main.py"
Cohesion: 0.05
Nodes (54): api_get(), api_keys(), fetch_matches(), _fresh(), _league_order(), _team(), to_match(), UpstreamError (+46 more)

### Community 43 - "builder.py"
Cohesion: 0.13
Nodes (10): get_builder(), _mixes(), _picks(), _chances(), expected_goals(), _home_share(), _solve(), _leg() (+2 more)

### Community 50 - "usePinned.ts"
Cohesion: 0.70
Nodes (4): save(), stored(), storedAuto(), usePinned()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reglas de arquitectura` connect `builder.py` to `AiPrediction.tsx`, `VYROX: contexto del proyecto`, `Sidebar.tsx`, `sameGameParlay.ts`, `ticketSettlement.test.ts`, `MatchList.tsx`, `bookmakers.ts`, `radar.py`, `Parlays.tsx`?**
  _High betweenness centrality (0.423) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.10837438423645321 - nodes in this community are weakly interconnected._
- **Why does `open_rows()` connect `radar.py` to `test_live.py`, `main.py`, `builder.py`, `builder.py`, `parlays.py`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._
- **Why does `prob_to_market_odd()` connect `builder.py` to `parlays.py`, `test_parlays.py`, `radar.py`, `test_radar.py`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12183908045977011 - nodes in this community are weakly interconnected._