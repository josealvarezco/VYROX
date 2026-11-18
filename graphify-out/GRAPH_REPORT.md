# Graph Report - VYROX  (2026-11-18)

## Corpus Check
- 100 files · ~69,446 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 987 nodes · 2668 edges · 43 communities (40 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 78 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `757ac0e3`
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
- test_history.py
- capture.mjs
- test_momentum.py
- MatchCenter.tsx
- get_details
- MatchList.tsx
- gemini.py
- bookmakers.ts
- radar.py
- types.ts
- history.py
- AiPrediction.tsx
- Parlays.tsx
- icons.tsx
- Comparator.tsx
- useBetSlip.ts
- TicketSlipIcon
- vercel.json
- api_football.py
- math
- Sidebar.tsx
- AiPrediction.tsx
- details.py
- builder.py
- react

## God Nodes (most connected - your core abstractions)
1. `App()` - 50 edges
2. `a11y()` - 42 edges
3. `colombia_today()` - 32 edges
4. `react` - 30 edges
5. `MatchCenter()` - 26 edges
6. `fixture()` - 24 edges
7. `useBetSlip()` - 22 edges
8. `MatchForecast` - 21 edges
9. `BetSlip()` - 20 edges
10. `Reglas de arquitectura` - 20 edges

## Surprising Connections (you probably didn't know these)
- `Stack` --references--> `predictions()`  [INFERRED]
  docs/proyecto.md → backend/app/main.py
- `Reglas de arquitectura` --references--> `predictions()`  [INFERRED]
  docs/proyecto.md → backend/app/main.py
- `Reglas de arquitectura` --references--> `next_date()`  [INFERRED]
  docs/proyecto.md → backend/app/parlays.py
- `Reglas de arquitectura` --references--> `open_rows()`  [INFERRED]
  docs/proyecto.md → backend/app/parlays.py
- `Reglas de arquitectura` --references--> `Parlays()`  [INFERRED]
  docs/proyecto.md → frontend/src/Parlays.tsx

## Import Cycles
- None detected.

## Communities (43 total, 3 thin omitted)

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
Cohesion: 0.10
Nodes (34): ALERT_ICONS, App(), DAYS, FILTERS, hot(), longDate(), Message(), PerformanceWidget (+26 more)

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
Cohesion: 0.15
Nodes (14): UpstreamError, MatchNotFound, get_performance(), check_available(), forecasts(), health(), match_details(), match_odds() (+6 more)

### Community 11 - "test_predictions.py"
Cohesion: 0.06
Nodes (46): fixture(), install(), meeting(), team(), api(), bet(), expire(), get() (+38 more)

### Community 14 - "builder.py"
Cohesion: 0.15
Nodes (11): live_odd(), odds_1x2(), pick_odd(), prob_to_market_odd(), _within(), test_1x2_keeps_the_draw_and_the_favourite_in_range(), test_1x2_shares_a_107_5_percent_book(), test_a_pick_pays_between_1_22_and_2_35() (+3 more)

### Community 15 - "BetSlip.tsx"
Cohesion: 0.07
Nodes (52): Badge(), BankrollAnalytics(), Chart(), Mode, MODES, bankrollAnalytics(), BankrollPoint, day() (+44 more)

### Community 16 - "test_live.py"
Cohesion: 0.06
Nodes (54): build(), test_a_day_already_played_builds_a_reference(), test_another_combination_is_another_mix_of_matches_on_target(), test_auto_splits_the_target_into_safe_legs(), test_auto_takes_fewer_legs_when_the_market_pays_more_per_leg(), test_dates_outside_the_free_plan_return_400(), test_one_pick_per_match_with_the_legs_and_market_asked(), test_reads_the_cached_forecast_without_new_calls() (+46 more)

### Community 17 - "sameGameParlay.ts"
Cohesion: 0.14
Nodes (26): BetBuilder(), pill(), Base, betBuilderMarkets(), calculateCorrelatedOdd(), Chances, Choice, fitModel() (+18 more)

### Community 18 - "test_history.py"
Cohesion: 0.12
Nodes (17): settle(), summarize(), item(), match(), resolve(), row(), table(), fake_fetch() (+9 more)

### Community 19 - "capture.mjs"
Cohesion: 0.17
Nodes (4): OUT, openPage(), OUT, [WIDTH, HEIGHT]

### Community 20 - "test_momentum.py"
Cohesion: 0.18
Nodes (13): measure(), pressure(), attack(), with_momentum(), fresh_measurements(), side(), test_a_side_a_man_down_presses_less(), test_an_average_match_is_balanced() (+5 more)

### Community 21 - "MatchCenter.tsx"
Cohesion: 0.13
Nodes (23): CHIP, HeadToHead(), Lineups(), Markings(), MatchCenter(), Note(), Pitch(), PlayerCard() (+15 more)

### Community 22 - "get_details"
Cohesion: 0.20
Nodes (8): api_get(), api_keys(), _bookmakers(), get_odds(), _quote(), get_details(), _head_to_head(), _ttl()

### Community 23 - "MatchList.tsx"
Cohesion: 0.06
Nodes (54): GoalAlert, newGoals(), Score, goals(), ActivityPulseIcon(), LockClosedIcon(), MaximizeExpandIcon(), Play (+46 more)

### Community 24 - "gemini.py"
Cohesion: 0.11
Nodes (11): ask_vyrox_ia(), _context(), _generate(), MatchInfo, predict(), Prediction, Probabilities, Score (+3 more)

### Community 25 - "bookmakers.ts"
Cohesion: 0.24
Nodes (8): bestHouse(), quote(), selection(), slot(), byMatch(), matchOdd(), totalOdd(), BookmakerOdds

### Community 26 - "radar.py"
Cohesion: 0.11
Nodes (17): group_by_league(), day_forecasts(), kickoff(), live_forecast(), MatchForecast, _options(), prices(), still_open() (+9 more)

### Community 27 - "types.ts"
Cohesion: 0.10
Nodes (21): API_BASE_URL, Market, TARGETS, ForecastPick, ForecastsResponse, Goals, League, Lineup (+13 more)

### Community 28 - "history.py"
Cohesion: 0.15
Nodes (8): client(), insert_new(), pending_until(), set_status(), settled_since(), radar_rows(), record_today(), resolve_pending()

### Community 29 - "AiPrediction.tsx"
Cohesion: 0.15
Nodes (18): Thinking(), OddButton(), TrendCorner(), Compare, COLUMNS, LINES, OddsTable(), pill() (+10 more)

### Community 30 - "Parlays.tsx"
Cohesion: 0.17
Nodes (20): ArrowLeftIcon(), DoubleChevronUpIcon(), FlameIcon(), RefreshIcon(), WandSparklesIcon(), BADGE, choice(), Choices() (+12 more)

### Community 31 - "icons.tsx"
Cohesion: 0.15
Nodes (24): a11y(), BallIcon(), CARD, CardIcon(), ChartLineUpIcon(), CheckIcon(), CopyIcon(), DownloadIcon() (+16 more)

### Community 32 - "Comparator.tsx"
Cohesion: 0.33
Nodes (10): BetSlip(), Column(), Comparator(), Crests(), METRICS, Slip, CrossIcon(), DoubleChevronRightIcon() (+2 more)

### Community 33 - "useBetSlip.ts"
Cohesion: 0.35
Nodes (11): settle(), isLeg(), isTicket(), merge(), same(), save(), slipKey(), STATUSES (+3 more)

### Community 34 - "TicketSlipIcon"
Cohesion: 0.46
Nodes (6): GoalToasts(), StarIcon(), TicketSlipIcon(), blast(), playRefereeWhistle(), scheduleWhistle()

### Community 36 - "api_football.py"
Cohesion: 0.26
Nodes (6): colombia_today(), fetch_matches(), _fresh(), _league_order(), _team(), to_match()

### Community 37 - "math"
Cohesion: 0.18
Nodes (8): _chances(), chances_at(), expected_goals(), _home_share(), _solve(), test_a_forecast_keeps_its_chances_at_kickoff(), test_a_goal_moves_the_chances_toward_the_side_that_scored(), test_what_the_score_already_settled_is_certain()

### Community 38 - "Sidebar.tsx"
Cohesion: 0.21
Nodes (19): Collapse(), Chevron(), FilterIcon(), Flag(), byCountry(), countryLabel(), fold(), LEAD_COUNTRIES (+11 more)

### Community 39 - "AiPrediction.tsx"
Cohesion: 0.31
Nodes (8): CONFIDENCE, MarketOdds(), PredictionCards(), PredictionView(), TrendUpIcon(), kickoffLabel(), Prediction, usePrediction()

### Community 42 - "details.py"
Cohesion: 0.17
Nodes (17): _build(), _by_side(), _card(), _cells(), _events(), _h2h_summary(), _is_goal(), _lineups() (+9 more)

### Community 43 - "builder.py"
Cohesion: 0.13
Nodes (11): get_builder(), _mixes(), _picks(), _build(), _fresh(), get_parlays(), _leg(), next_date() (+3 more)

### Community 50 - "react"
Cohesion: 0.24
Nodes (8): MoonIcon(), SunIcon(), ThemeToggle(), save(), stored(), storedAuto(), usePinned(), react

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reglas de arquitectura` connect `builder.py` to `VYROX: contexto del proyecto`, `Sidebar.tsx`, `builder.py`, `sameGameParlay.ts`, `MatchList.tsx`, `gemini.py`, `bookmakers.ts`, `Parlays.tsx`?**
  _High betweenness centrality (0.427) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.10837438423645321 - nodes in this community are weakly interconnected._
- **Why does `predictions()` connect `gemini.py` to `main.py`, `test_predictions.py`, `VYROX: contexto del proyecto`, `builder.py`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07357357357357357 - nodes in this community are weakly interconnected._
- **Why does `VyroxDropdown()` connect `Sidebar.tsx` to `Comparator.tsx`, `App.tsx`, `builder.py`, `MatchList.tsx`, `icons.tsx`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1021021021021021 - nodes in this community are weakly interconnected._