# Graph Report - VYROX  (2026-11-18)

## Corpus Check
- 100 files · ~70,075 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 993 nodes · 2677 edges · 43 communities (38 shown, 5 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 78 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5e892b65`
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
- parlays.py
- radar.py
- open_rows
- history.py
- AiPrediction.tsx
- Parlays.tsx
- icons.tsx
- Comparator.tsx
- matchComparator.ts
- TicketSlipIcon
- vercel.json
- colombia_today
- math
- Sidebar.tsx
- table
- details.py
- builder.py

## God Nodes (most connected - your core abstractions)
1. `App()` - 51 edges
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
- `Reglas de arquitectura` --references--> `prob_to_market_odd()`  [INFERRED]
  docs/proyecto.md → backend/app/odds.py
- `Reglas de arquitectura` --references--> `live_odd()`  [INFERRED]
  docs/proyecto.md → backend/app/odds.py
- `Reglas de arquitectura` --references--> `odds_1x2()`  [INFERRED]
  docs/proyecto.md → backend/app/odds.py

## Import Cycles
- None detected.

## Communities (43 total, 5 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.11
Nodes (17): expire_cache(), fetch(), fresh_cache(), keys(), league_fixture(), test_a_spent_key_hands_the_same_request_to_the_next_one(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_errors_that_no_other_key_fixes_reach_the_caller() (+9 more)

### Community 1 - "package.json"
Cohesion: 0.07
Nodes (37): dependencies, lucide-react@^1.75.0, react@^19.3.1, react-dom@^19.3.1, recharts@^3.11.0, devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3 (+29 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 3 - "App.tsx"
Cohesion: 0.11
Nodes (28): ALERT_ICONS, App(), DAYS, FILTERS, hot(), longDate(), Message(), QUICK_MARKETS (+20 more)

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
Cohesion: 0.18
Nodes (13): UpstreamError, get_performance(), check_available(), forecasts(), health(), match_details(), match_odds(), matches() (+5 more)

### Community 11 - "test_predictions.py"
Cohesion: 0.06
Nodes (46): fixture(), install(), meeting(), team(), api(), bet(), expire(), get() (+38 more)

### Community 14 - "builder.py"
Cohesion: 0.17
Nodes (9): odds_1x2(), pick_odd(), prob_to_market_odd(), _within(), test_1x2_keeps_the_draw_and_the_favourite_in_range(), test_1x2_shares_a_107_5_percent_book(), test_a_pick_pays_between_1_22_and_2_35(), test_both_sides_of_a_two_way_market_carry_a_6_5_percent_margin() (+1 more)

### Community 15 - "BetSlip.tsx"
Cohesion: 0.07
Nodes (55): Badge(), BankrollAnalytics(), Chart(), Mode, MODES, bankrollAnalytics(), BankrollPoint, day() (+47 more)

### Community 16 - "test_live.py"
Cohesion: 0.06
Nodes (53): build(), test_a_day_already_played_builds_a_reference(), test_another_combination_is_another_mix_of_matches_on_target(), test_auto_splits_the_target_into_safe_legs(), test_auto_takes_fewer_legs_when_the_market_pays_more_per_leg(), test_dates_outside_the_free_plan_return_400(), test_one_pick_per_match_with_the_legs_and_market_asked(), test_reads_the_cached_forecast_without_new_calls() (+45 more)

### Community 17 - "sameGameParlay.ts"
Cohesion: 0.06
Nodes (61): Reglas de arquitectura, CONFIDENCE, MarketOdds(), PredictionCards(), PredictionView(), BetBuilder(), pill(), OddButton() (+53 more)

### Community 18 - "test_history.py"
Cohesion: 0.12
Nodes (19): net(), radar_rows(), settle(), summarize(), item(), match(), resolve(), row() (+11 more)

### Community 19 - "capture.mjs"
Cohesion: 0.17
Nodes (4): OUT, openPage(), OUT, [WIDTH, HEIGHT]

### Community 20 - "test_momentum.py"
Cohesion: 0.18
Nodes (13): measure(), pressure(), attack(), with_momentum(), fresh_measurements(), side(), test_a_side_a_man_down_presses_less(), test_an_average_match_is_balanced() (+5 more)

### Community 21 - "MatchCenter.tsx"
Cohesion: 0.07
Nodes (47): API_BASE_URL, PerformanceView, CHIP, HeadToHead(), Lineups(), Markings(), MatchCenter(), Note() (+39 more)

### Community 22 - "get_details"
Cohesion: 0.18
Nodes (7): api_get(), api_keys(), _team(), to_match(), _bookmakers(), get_odds(), _quote()

### Community 23 - "MatchList.tsx"
Cohesion: 0.08
Nodes (43): GoalAlert, newGoals(), Score, goals(), GridMultiViewIcon(), LockClosedIcon(), MaximizeExpandIcon(), LiveMultiView() (+35 more)

### Community 24 - "gemini.py"
Cohesion: 0.18
Nodes (8): ask_vyrox_ia(), _context(), _generate(), MatchInfo, predict(), Prediction, Score, predictions()

### Community 25 - "parlays.py"
Cohesion: 0.19
Nodes (7): _build(), DayForecast, _fresh(), _leg(), _options(), _parlay(), _safest()

### Community 26 - "radar.py"
Cohesion: 0.15
Nodes (14): Probabilities, kickoff(), live_forecast(), MatchForecast, simulated_forecast(), still_open(), _forecast(), forecast_rows() (+6 more)

### Community 27 - "open_rows"
Cohesion: 0.19
Nodes (7): group_by_league(), _league_order(), day_forecasts(), get_parlays(), next_date(), open_rows(), upcoming()

### Community 28 - "history.py"
Cohesion: 0.21
Nodes (6): client(), insert_new(), pending_until(), set_status(), settled_since(), record_today()

### Community 29 - "AiPrediction.tsx"
Cohesion: 0.21
Nodes (11): Thinking(), Compare, Card(), Market, MARKETS, Props, Radar(), RadarGrid() (+3 more)

### Community 30 - "Parlays.tsx"
Cohesion: 0.13
Nodes (23): Collapse(), ArrowLeftIcon(), BADGE, choice(), Choices(), Leg(), LEG_COUNTS, MARKETS (+15 more)

### Community 31 - "icons.tsx"
Cohesion: 0.11
Nodes (34): a11y(), ActivityPulseIcon(), BellRingIcon(), CalendarIcon(), CARD, CardIcon(), ChartLineUpIcon(), CollapseAllIcon() (+26 more)

### Community 32 - "Comparator.tsx"
Cohesion: 0.36
Nodes (8): Column(), Comparator(), Crests(), METRICS, Slip, DoubleChevronRightIcon(), ScaleCompareIcon(), SparklesIcon()

### Community 33 - "matchComparator.ts"
Cohesion: 0.22
Nodes (10): ComparedSide, compareMatches(), likelier(), phrase(), safety(), side(), teams(), ARSENAL (+2 more)

### Community 34 - "TicketSlipIcon"
Cohesion: 0.42
Nodes (7): GoalToasts(), BallIcon(), StarIcon(), TicketSlipIcon(), blast(), playRefereeWhistle(), scheduleWhistle()

### Community 36 - "colombia_today"
Cohesion: 0.43
Nodes (4): colombia_today(), fetch_matches(), _fresh(), resolve_pending()

### Community 37 - "math"
Cohesion: 0.18
Nodes (8): _chances(), chances_at(), expected_goals(), _home_share(), _solve(), test_a_forecast_keeps_its_chances_at_kickoff(), test_a_goal_moves_the_chances_toward_the_side_that_scored(), test_what_the_score_already_settled_is_certain()

### Community 38 - "Sidebar.tsx"
Cohesion: 0.23
Nodes (17): FilterIcon(), Flag(), byCountry(), countryLabel(), fold(), LEAD_COUNTRIES, LEAD_ORDER, leagueLogo() (+9 more)

### Community 42 - "details.py"
Cohesion: 0.13
Nodes (21): _build(), _by_side(), _card(), _cells(), _events(), get_details(), _h2h_summary(), _head_to_head() (+13 more)

### Community 43 - "builder.py"
Cohesion: 0.18
Nodes (6): get_builder(), _mixes(), _picks(), live_odd(), prices(), test_a_live_odd_always_carries_a_margin_and_a_settled_side_has_none()

## Knowledge Gaps
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reglas de arquitectura` connect `sameGameParlay.ts` to `matchComparator.ts`, `VYROX: contexto del proyecto`, `Sidebar.tsx`, `builder.py`, `builder.py`, `MatchList.tsx`, `gemini.py`, `open_rows`, `Parlays.tsx`?**
  _High betweenness centrality (0.427) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.10837438423645321 - nodes in this community are weakly interconnected._
- **Why does `predictions()` connect `gemini.py` to `sameGameParlay.ts`, `main.py`, `test_predictions.py`, `VYROX: contexto del proyecto`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07017543859649122 - nodes in this community are weakly interconnected._
- **Why does `VyroxDropdown()` connect `Sidebar.tsx` to `Comparator.tsx`, `App.tsx`, `BetSlip.tsx`, `sameGameParlay.ts`, `MatchList.tsx`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10756302521008404 - nodes in this community are weakly interconnected._