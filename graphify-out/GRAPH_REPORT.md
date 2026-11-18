# Graph Report - VYROX  (2026-11-18)

## Corpus Check
- 98 files · ~67,991 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 944 nodes · 2562 edges · 44 communities (41 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 69 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d1232bcc`
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
- test_predictions.py
- tsconfig.json
- triage-labels.md
- builder.py
- BetSlip.tsx
- test_live.py
- sameGameParlay.ts
- matchComparator.ts
- capture.mjs
- test_momentum.py
- MatchCenter.tsx
- get_details
- MatchList.tsx
- gemini.py
- bookmakers.ts
- forecast_rows
- parlays.py
- MatchForecast
- AiPrediction.tsx
- Parlays.tsx
- icons.tsx
- test_bookmakers.py
- useBetSlip.ts
- TicketSlipIcon
- vercel.json
- api_football.py
- math
- Sidebar.tsx
- hedgeCalculator.test.ts
- with_live_picks
- details.py
- builder.py
- react

## God Nodes (most connected - your core abstractions)
1. `App()` - 50 edges
2. `a11y()` - 42 edges
3. `react` - 30 edges
4. `MatchCenter()` - 26 edges
5. `colombia_today()` - 25 edges
6. `fixture()` - 23 edges
7. `useBetSlip()` - 22 edges
8. `MatchForecast` - 21 edges
9. `BetSlip()` - 20 edges
10. `Reglas de arquitectura` - 20 edges

## Surprising Connections (you probably didn't know these)
- `Reglas de arquitectura` --references--> `next_date()`  [INFERRED]
  docs/proyecto.md → backend/app/parlays.py
- `Reglas de arquitectura` --references--> `open_rows()`  [INFERRED]
  docs/proyecto.md → backend/app/parlays.py
- `Reglas de arquitectura` --references--> `Parlays()`  [INFERRED]
  docs/proyecto.md → frontend/src/Parlays.tsx
- `Reglas de arquitectura` --references--> `VyroxDropdown()`  [INFERRED]
  docs/proyecto.md → frontend/src/VyroxDropdown.tsx
- `Reglas de arquitectura` --references--> `bestHouse()`  [INFERRED]
  docs/proyecto.md → frontend/src/bookmakers.ts

## Import Cycles
- None detected.

## Communities (44 total, 3 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.11
Nodes (17): expire_cache(), fetch(), fresh_cache(), keys(), league_fixture(), test_a_spent_key_hands_the_same_request_to_the_next_one(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_errors_that_no_other_key_fixes_reach_the_caller() (+9 more)

### Community 1 - "package.json"
Cohesion: 0.07
Nodes (35): dependencies, react@^19.3.1, react-dom@^19.3.1, recharts@^3.11.0, devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3 (+27 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 3 - "App.tsx"
Cohesion: 0.12
Nodes (28): ALERT_ICONS, App(), DAYS, FILTERS, hot(), longDate(), Message(), PerformanceWidget (+20 more)

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

### Community 10 - "main.py"
Cohesion: 0.20
Nodes (14): colombia_today(), UpstreamError, MatchNotFound, check_available(), forecasts(), health(), match_details(), match_odds() (+6 more)

### Community 11 - "test_predictions.py"
Cohesion: 0.07
Nodes (37): fixture(), install(), meeting(), team(), api(), expire(), get(), test_a_live_match_gets_its_momentum_and_the_list_shows_it() (+29 more)

### Community 14 - "builder.py"
Cohesion: 0.13
Nodes (13): live_odd(), odds_1x2(), pick_odd(), prob_to_market_odd(), _within(), prices(), _item(), test_1x2_keeps_the_draw_and_the_favourite_in_range() (+5 more)

### Community 15 - "BetSlip.tsx"
Cohesion: 0.14
Nodes (29): Badge(), BankrollAnalytics(), Chart(), Mode, MODES, BADGES, CARD, CopInput() (+21 more)

### Community 16 - "test_live.py"
Cohesion: 0.05
Nodes (57): get_performance(), build(), test_a_day_already_played_builds_a_reference(), test_another_combination_is_another_mix_of_matches_on_target(), test_auto_splits_the_target_into_safe_legs(), test_auto_takes_fewer_legs_when_the_market_pays_more_per_leg(), test_dates_outside_the_free_plan_return_400(), test_one_pick_per_match_with_the_legs_and_market_asked() (+49 more)

### Community 17 - "sameGameParlay.ts"
Cohesion: 0.14
Nodes (27): BetBuilder(), pill(), LayersCombineIcon(), TicketSlipIcon(), Base, betBuilderMarkets(), calculateCorrelatedOdd(), Chances (+19 more)

### Community 18 - "matchComparator.ts"
Cohesion: 0.08
Nodes (24): bankrollAnalytics(), BankrollPoint, day(), FAMILIES, FAMILY, net(), Settled, GoalAlert (+16 more)

### Community 19 - "capture.mjs"
Cohesion: 0.17
Nodes (4): OUT, openPage(), OUT, [WIDTH, HEIGHT]

### Community 20 - "test_momentum.py"
Cohesion: 0.18
Nodes (13): measure(), pressure(), attack(), with_momentum(), fresh_measurements(), side(), test_a_side_a_man_down_presses_less(), test_an_average_match_is_balanced() (+5 more)

### Community 21 - "MatchCenter.tsx"
Cohesion: 0.05
Nodes (64): API_BASE_URL, ChartLineUpIcon(), CHIP, HeadToHead(), Lineups(), Markings(), MatchCenter(), Note() (+56 more)

### Community 22 - "get_details"
Cohesion: 0.18
Nodes (9): api_get(), api_keys(), _bookmakers(), get_odds(), _quote(), get_details(), _h2h_summary(), _head_to_head() (+1 more)

### Community 23 - "MatchList.tsx"
Cohesion: 0.09
Nodes (44): ActivityPulseIcon(), FlameIcon(), GridMultiViewIcon(), LockClosedIcon(), MaximizeExpandIcon(), LiveMultiView(), Play, Quadrant() (+36 more)

### Community 24 - "gemini.py"
Cohesion: 0.15
Nodes (8): ask_vyrox_ia(), _context(), _generate(), MatchInfo, predict(), Prediction, Score, predictions()

### Community 25 - "bookmakers.ts"
Cohesion: 0.21
Nodes (11): BetSlip(), IconButton(), bestHouse(), quote(), slot(), byMatch(), matchOdd(), totalOdd() (+3 more)

### Community 26 - "forecast_rows"
Cohesion: 0.24
Nodes (5): group_by_league(), _league_order(), upcoming(), forecast_rows(), get_radar()

### Community 27 - "parlays.py"
Cohesion: 0.20
Nodes (8): _build(), day_forecasts(), _fresh(), kickoff(), _leg(), _options(), _parlay(), _safest()

### Community 28 - "MatchForecast"
Cohesion: 0.19
Nodes (7): Probabilities, DayForecast, live_forecast(), MatchForecast, simulated_forecast(), _markets(), test_no_pick_is_shown_surer_than_92_percent()

### Community 29 - "AiPrediction.tsx"
Cohesion: 0.19
Nodes (17): CONFIDENCE, MarketOdds(), PredictionCards(), PredictionView(), Thinking(), OddButton(), TrendCorner(), selection() (+9 more)

### Community 30 - "Parlays.tsx"
Cohesion: 0.13
Nodes (23): Collapse(), ArrowLeftIcon(), DoubleChevronUpIcon(), RefreshIcon(), WandSparklesIcon(), BADGE, choice(), Choices() (+15 more)

### Community 31 - "icons.tsx"
Cohesion: 0.14
Nodes (27): Column(), Comparator(), Crests(), METRICS, Slip, a11y(), CARD, CardIcon() (+19 more)

### Community 32 - "test_bookmakers.py"
Cohesion: 0.32
Nodes (9): api(), bet(), expire(), get(), response(), test_a_match_without_odds_or_without_a_key(), test_each_bookmaker_with_the_markets_it_fully_quotes(), test_odds_are_cached_for_three_hours_and_arrows_show_real_moves() (+1 more)

### Community 33 - "useBetSlip.ts"
Cohesion: 0.35
Nodes (11): settle(), isLeg(), isTicket(), merge(), same(), save(), slipKey(), STATUSES (+3 more)

### Community 34 - "TicketSlipIcon"
Cohesion: 0.46
Nodes (6): GoalToasts(), BallIcon(), StarIcon(), blast(), playRefereeWhistle(), scheduleWhistle()

### Community 36 - "api_football.py"
Cohesion: 0.29
Nodes (4): fetch_matches(), _fresh(), _team(), to_match()

### Community 37 - "math"
Cohesion: 0.18
Nodes (8): _chances(), chances_at(), expected_goals(), _home_share(), _solve(), test_a_forecast_keeps_its_chances_at_kickoff(), test_a_goal_moves_the_chances_toward_the_side_that_scored(), test_what_the_score_already_settled_is_certain()

### Community 38 - "Sidebar.tsx"
Cohesion: 0.23
Nodes (17): FilterIcon(), Flag(), byCountry(), countryLabel(), fold(), LEAD_COUNTRIES, LEAD_ORDER, leagueLogo() (+9 more)

### Community 39 - "hedgeCalculator.test.ts"
Cohesion: 0.36
Nodes (6): calculateHedge(), getOppositeMarket(), pickToCover(), suggestedHedgeOdd(), marketOdd(), TWO_WAY_BOOK

### Community 40 - "with_live_picks"
Cohesion: 0.33
Nodes (3): still_open(), _forecast(), with_live_picks()

### Community 42 - "details.py"
Cohesion: 0.19
Nodes (16): _build(), _by_side(), _card(), _cells(), _events(), _is_goal(), _lineups(), lineup() (+8 more)

### Community 43 - "builder.py"
Cohesion: 0.18
Nodes (6): get_builder(), _mixes(), _picks(), get_parlays(), next_date(), open_rows()

### Community 50 - "react"
Cohesion: 0.24
Nodes (8): MoonIcon(), SunIcon(), ThemeToggle(), save(), stored(), storedAuto(), usePinned(), react

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reglas de arquitectura` connect `builder.py` to `useBetSlip.ts`, `VYROX: contexto del proyecto`, `Sidebar.tsx`, `hedgeCalculator.test.ts`, `builder.py`, `sameGameParlay.ts`, `matchComparator.ts`, `MatchList.tsx`, `bookmakers.ts`, `Parlays.tsx`?**
  _High betweenness centrality (0.425) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.10837438423645321 - nodes in this community are weakly interconnected._
- **Why does `open_rows()` connect `builder.py` to `api_football.py`, `with_live_picks`, `builder.py`, `forecast_rows`, `parlays.py`, `MatchForecast`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07357357357357357 - nodes in this community are weakly interconnected._
- **Why does `prob_to_market_odd()` connect `builder.py` to `gemini.py`, `test_live.py`, `parlays.py`, `MatchForecast`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11954022988505747 - nodes in this community are weakly interconnected._