# Graph Report - VYROX  (2026-11-03)

## Corpus Check
- 90 files · ~62,566 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 900 nodes · 2461 edges · 52 communities (49 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 69 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7d535619`
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
- useBetSlip.ts
- ticketSettlement.test.ts
- test_details.py
- Radar.tsx
- types.ts
- api_football.py
- MatchList.tsx
- gemini.py
- details.py
- Probabilities
- test_momentum.py
- fake_api_football.py
- AiPrediction.tsx
- Parlays.tsx
- icons.tsx
- test_builder.py
- OddsTable.tsx
- test_radar.py
- keys
- upstream
- test_live.py
- Sidebar.tsx
- math
- GoalToasts.tsx
- multiView.ts
- main.py
- parlays.py
- Match
- test_bookmakers.py
- ticketSettlement.test.ts
- useBetSlip.ts
- hedgeCalculator.test.ts
- get_details
- usePinned.ts
- ThemeToggle.tsx

## God Nodes (most connected - your core abstractions)
1. `App()` - 48 edges
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

## Communities (52 total, 3 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.16
Nodes (14): expire_cache(), fetch(), fresh_cache(), league_fixture(), test_a_spent_key_hands_the_same_request_to_the_next_one(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_errors_that_no_other_key_fixes_reach_the_caller(), test_finished_past_day_is_never_requested_again() (+6 more)

### Community 1 - "package.json"
Cohesion: 0.08
Nodes (33): dependencies, react@^19.3.1, react-dom@^19.3.1, devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2 (+25 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 3 - "App.tsx"
Cohesion: 0.11
Nodes (27): ALERT_ICONS, App(), DAYS, FILTERS, hot(), longDate(), Message(), QUICK_MARKETS (+19 more)

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
Cohesion: 0.14
Nodes (23): CHIP, HeadToHead(), Lineups(), Markings(), MatchCenter(), Note(), Pitch(), PlayerCard() (+15 more)

### Community 11 - "test_predictions.py"
Cohesion: 0.16
Nodes (16): install(), fresh_cache(), post(), sent_prompt(), test_gemini_failure_returns_fallback_and_is_not_cached(), test_market_odds_follow_the_rescaled_probabilities_and_skip_zero(), test_missing_market_probability_is_outside_schema(), test_overloaded_flash_falls_back_to_flash_lite() (+8 more)

### Community 14 - "builder.py"
Cohesion: 0.14
Nodes (12): live_odd(), odds_1x2(), pick_odd(), prob_to_market_odd(), _within(), test_a_live_odd_always_carries_a_margin_and_a_settled_side_has_none(), test_1x2_keeps_the_draw_and_the_favourite_in_range(), test_1x2_shares_a_107_5_percent_book() (+4 more)

### Community 15 - "BetSlip.tsx"
Cohesion: 0.07
Nodes (54): Badge(), BankrollAnalytics(), Chart(), Mode, MODES, bankrollAnalytics(), BankrollPoint, day() (+46 more)

### Community 16 - "test_parlays.py"
Cohesion: 0.19
Nodes (14): colombia_today(), age(), api(), check_slips(), get(), matches(), test_dates_outside_the_free_plan_return_400(), test_failure_serves_simulated_parlays_and_retries_after_5_minutes() (+6 more)

### Community 17 - "useBetSlip.ts"
Cohesion: 0.14
Nodes (27): BetBuilder(), pill(), LayersCombineIcon(), Base, betBuilderMarkets(), calculateCorrelatedOdd(), Chances, Choice (+19 more)

### Community 18 - "ticketSettlement.test.ts"
Cohesion: 0.16
Nodes (17): Column(), Comparator(), Crests(), METRICS, Slip, DoubleChevronRightIcon(), SparklesIcon(), ComparedSide (+9 more)

### Community 19 - "test_details.py"
Cohesion: 0.24
Nodes (16): fixture(), api(), expire(), get(), test_a_live_match_gets_its_momentum_and_the_list_shows_it(), test_finished_match_is_cached_for_six_hours(), test_finished_or_simulated_statistics_get_no_momentum(), test_h2h_failure_keeps_the_rest_of_the_match_center() (+8 more)

### Community 20 - "Radar.tsx"
Cohesion: 0.22
Nodes (10): Thinking(), Compare, Card(), Market, MARKETS, Props, RadarGrid(), RadarCategory (+2 more)

### Community 21 - "types.ts"
Cohesion: 0.13
Nodes (15): Competition, ForecastPick, ForecastsResponse, Goals, League, Lineup, MatchDetails, MatchesResponse (+7 more)

### Community 22 - "api_football.py"
Cohesion: 0.14
Nodes (9): api_get(), api_keys(), fetch_matches(), _fresh(), _team(), to_match(), _bookmakers(), get_odds() (+1 more)

### Community 23 - "MatchList.tsx"
Cohesion: 0.18
Nodes (25): ActivityPulseIcon(), FlameIcon(), GridMultiViewIcon(), PinIcon(), ScaleCompareIcon(), LiveMultiView(), Play, Quadrant() (+17 more)

### Community 24 - "gemini.py"
Cohesion: 0.16
Nodes (8): ask_vyrox_ia(), _context(), _generate(), MatchInfo, predict(), Prediction, Score, predictions()

### Community 25 - "details.py"
Cohesion: 0.19
Nodes (16): _build(), _by_side(), _card(), _cells(), _events(), _is_goal(), _lineups(), lineup() (+8 more)

### Community 26 - "Probabilities"
Cohesion: 0.22
Nodes (5): Probabilities, get_radar(), _item(), _markets(), test_no_pick_is_shown_surer_than_92_percent()

### Community 27 - "test_momentum.py"
Cohesion: 0.18
Nodes (13): measure(), pressure(), attack(), with_momentum(), fresh_measurements(), side(), test_a_side_a_man_down_presses_less(), test_an_average_match_is_balanced() (+5 more)

### Community 29 - "AiPrediction.tsx"
Cohesion: 0.43
Nodes (5): CONFIDENCE, PredictionCards(), PredictionView(), Prediction, usePrediction()

### Community 30 - "Parlays.tsx"
Cohesion: 0.14
Nodes (21): choice(), Choices(), Leg(), LEG_COUNTS, MARKETS, NextDay(), ParlayCard(), ParlayGrid() (+13 more)

### Community 31 - "icons.tsx"
Cohesion: 0.12
Nodes (31): a11y(), ArrowLeftIcon(), BallIcon(), CalendarIcon(), CARD, CardIcon(), CollapseAllIcon(), CopyIcon() (+23 more)

### Community 32 - "test_builder.py"
Cohesion: 0.31
Nodes (11): build(), test_a_day_already_played_builds_a_reference(), test_another_combination_is_another_mix_of_matches_on_target(), test_auto_splits_the_target_into_safe_legs(), test_auto_takes_fewer_legs_when_the_market_pays_more_per_leg(), test_dates_outside_the_free_plan_return_400(), test_one_pick_per_match_with_the_legs_and_market_asked(), test_reads_the_cached_forecast_without_new_calls() (+3 more)

### Community 33 - "OddsTable.tsx"
Cohesion: 0.31
Nodes (10): MarketOdds(), OddButton(), TrendCorner(), selection(), COLUMNS, LINES, OddsTable(), pill() (+2 more)

### Community 34 - "test_radar.py"
Cohesion: 0.28
Nodes (10): check(), get(), picks(), radar_api(), test_a_day_already_played_shows_its_matches_as_a_reference(), test_forecasts_price_every_match_like_the_radar_without_a_new_call(), test_four_markets_from_one_forecast(), test_no_matches() (+2 more)

### Community 35 - "keys"
Cohesion: 0.33
Nodes (3): keys(), upstream(), fake_get()

### Community 36 - "upstream"
Cohesion: 0.40
Nodes (3): gemini_body(), upstream(), fake_post()

### Community 37 - "test_live.py"
Cohesion: 0.19
Nodes (18): finished(), live_match(), test_a_later_forecast_keeps_the_earlier_one_of_matches_already_live(), test_a_slip_never_takes_what_the_score_settled(), test_another_day_never_points_ahead(), test_few_upcoming_matches_are_joined_by_the_live_ones_before_minute_75(), test_fewer_than_3_matches_today_point_to_tomorrow(), test_live_forecast_without_a_forecast_uses_an_average_match() (+10 more)

### Community 38 - "Sidebar.tsx"
Cohesion: 0.21
Nodes (18): CheckIcon(), Chevron(), FilterIcon(), Flag(), byCountry(), countryLabel(), fold(), LEAD_COUNTRIES (+10 more)

### Community 39 - "math"
Cohesion: 0.16
Nodes (9): _chances(), chances_at(), expected_goals(), _home_share(), _solve(), live_forecast(), test_a_forecast_keeps_its_chances_at_kickoff(), test_a_goal_moves_the_chances_toward_the_side_that_scored() (+1 more)

### Community 40 - "GoalToasts.tsx"
Cohesion: 0.46
Nodes (6): GoalToasts(), StarIcon(), TicketSlipIcon(), blast(), playRefereeWhistle(), scheduleWhistle()

### Community 41 - "multiView.ts"
Cohesion: 0.22
Nodes (11): parlayMatches(), stage(), topLive(), Track, trackLeg(), LIVE, STATUS_LABEL, DECIDED (+3 more)

### Community 42 - "main.py"
Cohesion: 0.32
Nodes (9): UpstreamError, check_available(), forecasts(), match_details(), match_odds(), matches(), parlay_builder(), parlays() (+1 more)

### Community 43 - "parlays.py"
Cohesion: 0.08
Nodes (24): group_by_league(), _league_order(), get_builder(), _mixes(), _picks(), _build(), day_forecasts(), DayForecast (+16 more)

### Community 44 - "Match"
Cohesion: 0.28
Nodes (9): GoalAlert, newGoals(), Score, goals(), Match, ALERT_MODES, AlertMode, storedMode() (+1 more)

### Community 45 - "test_bookmakers.py"
Cohesion: 0.32
Nodes (9): api(), bet(), expire(), get(), response(), test_a_match_without_odds_or_without_a_key(), test_each_bookmaker_with_the_markets_it_fully_quotes(), test_odds_are_cached_for_three_hours_and_arrows_show_real_moves() (+1 more)

### Community 46 - "ticketSettlement.test.ts"
Cohesion: 0.18
Nodes (3): COLUMN_WON, BOTH_SCORE, HOME_WIN

### Community 47 - "useBetSlip.ts"
Cohesion: 0.35
Nodes (11): settle(), isLeg(), isTicket(), merge(), same(), save(), slipKey(), STATUSES (+3 more)

### Community 48 - "hedgeCalculator.test.ts"
Cohesion: 0.40
Nodes (7): HedgePanel(), HedgeSums(), calculateHedge(), getOppositeMarket(), pickToCover(), suggestedHedgeOdd(), TicketLeg

### Community 49 - "get_details"
Cohesion: 0.28
Nodes (5): get_details(), _h2h_summary(), _head_to_head(), MatchNotFound, _ttl()

### Community 50 - "usePinned.ts"
Cohesion: 0.70
Nodes (4): save(), stored(), storedAuto(), usePinned()

### Community 51 - "ThemeToggle.tsx"
Cohesion: 0.83
Nodes (3): MoonIcon(), SunIcon(), ThemeToggle()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reglas de arquitectura` connect `builder.py` to `VYROX: contexto del proyecto`, `Sidebar.tsx`, `multiView.ts`, `parlays.py`, `Match`, `BetSlip.tsx`, `useBetSlip.ts`, `useBetSlip.ts`, `ticketSettlement.test.ts`, `Parlays.tsx`?**
  _High betweenness centrality (0.438) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._
- **Why does `open_rows()` connect `parlays.py` to `builder.py`, `api_football.py`, `math`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Why does `prob_to_market_odd()` connect `builder.py` to `test_radar.py`, `parlays.py`, `test_parlays.py`, `gemini.py`, `Probabilities`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11491935483870967 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._