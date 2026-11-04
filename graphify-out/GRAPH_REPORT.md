# Graph Report - VYROX  (2026-11-03)

## Corpus Check
- 88 files · ~58,884 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 842 nodes · 2284 edges · 41 communities (38 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 59 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8c50d78e`
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
- Comparator.tsx
- MatchList.tsx
- gemini.py
- main.py
- radar.py
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
- bookmakers.ts
- Sidebar.tsx
- GoalToasts.tsx
- parlays.py

## God Nodes (most connected - your core abstractions)
1. `App()` - 48 edges
2. `a11y()` - 41 edges
3. `react` - 29 edges
4. `MatchCenter()` - 26 edges
5. `fixture()` - 23 edges
6. `useBetSlip()` - 22 edges
7. `BetSlip()` - 20 edges
8. `CrossIcon()` - 19 edges
9. `Match` - 19 edges
10. `UpstreamError` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Reglas de arquitectura` --references--> `prob_to_market_odd()`  [INFERRED]
  docs/proyecto.md → backend/app/odds.py
- `Reglas de arquitectura` --references--> `odds_1x2()`  [INFERRED]
  docs/proyecto.md → backend/app/odds.py
- `Reglas de arquitectura` --references--> `pick_odd()`  [INFERRED]
  docs/proyecto.md → backend/app/odds.py
- `Reglas de arquitectura` --references--> `VyroxDropdown()`  [INFERRED]
  docs/proyecto.md → frontend/src/VyroxDropdown.tsx
- `Reglas de arquitectura` --references--> `bestHouse()`  [INFERRED]
  docs/proyecto.md → frontend/src/bookmakers.ts

## Import Cycles
- None detected.

## Communities (41 total, 3 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.15
Nodes (14): expire_cache(), fetch(), fresh_cache(), league_fixture(), test_a_spent_key_hands_the_same_request_to_the_next_one(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_errors_that_no_other_key_fixes_reach_the_caller(), test_finished_past_day_is_never_requested_again() (+6 more)

### Community 1 - "package.json"
Cohesion: 0.08
Nodes (33): dependencies, react@^19.3.1, react-dom@^19.3.1, devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2 (+25 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 3 - "App.tsx"
Cohesion: 0.11
Nodes (30): ALERT_ICONS, App(), DAYS, FILTERS, hot(), longDate(), Message(), QUICK_MARKETS (+22 more)

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
Cohesion: 0.13
Nodes (29): CardIcon(), JerseyIcon(), PitchIcon(), SubIcon(), WhistleIcon(), CHIP, EventText(), HeadToHead() (+21 more)

### Community 11 - "test_predictions.py"
Cohesion: 0.16
Nodes (16): install(), fresh_cache(), post(), sent_prompt(), test_gemini_failure_returns_fallback_and_is_not_cached(), test_market_odds_follow_the_rescaled_probabilities_and_skip_zero(), test_missing_market_probability_is_outside_schema(), test_overloaded_flash_falls_back_to_flash_lite() (+8 more)

### Community 14 - "builder.py"
Cohesion: 0.17
Nodes (9): odds_1x2(), pick_odd(), prob_to_market_odd(), _within(), test_1x2_keeps_the_draw_and_the_favourite_in_range(), test_1x2_shares_a_107_5_percent_book(), test_a_pick_pays_between_1_22_and_2_35(), test_both_sides_of_a_two_way_market_carry_a_6_5_percent_margin() (+1 more)

### Community 15 - "BetSlip.tsx"
Cohesion: 0.07
Nodes (48): Badge(), BankrollAnalytics(), Chart(), Mode, MODES, bankrollAnalytics(), BankrollPoint, day() (+40 more)

### Community 16 - "test_parlays.py"
Cohesion: 0.17
Nodes (15): colombia_today(), age(), api(), check_slips(), get(), match(), matches(), test_dates_outside_the_free_plan_return_400() (+7 more)

### Community 17 - "useBetSlip.ts"
Cohesion: 0.10
Nodes (42): BetBuilder(), pill(), BetSlip(), IconButton(), LayersCombineIcon(), Base, betBuilderMarkets(), byMatch() (+34 more)

### Community 18 - "ticketSettlement.test.ts"
Cohesion: 0.20
Nodes (10): ComparedSide, compareMatches(), likelier(), phrase(), safety(), side(), teams(), ARSENAL (+2 more)

### Community 19 - "test_details.py"
Cohesion: 0.24
Nodes (16): fixture(), api(), expire(), get(), test_a_live_match_gets_its_momentum_and_the_list_shows_it(), test_finished_match_is_cached_for_six_hours(), test_finished_or_simulated_statistics_get_no_momentum(), test_h2h_failure_keeps_the_rest_of_the_match_center() (+8 more)

### Community 20 - "Radar.tsx"
Cohesion: 0.22
Nodes (12): Thinking(), RadarIcon(), Compare, CompareButton(), Card(), Market, MARKETS, Props (+4 more)

### Community 21 - "types.ts"
Cohesion: 0.13
Nodes (15): ForecastPick, ForecastsResponse, Goals, League, Lineup, MatchDetails, MatchesResponse, MatchEvent (+7 more)

### Community 22 - "Comparator.tsx"
Cohesion: 0.39
Nodes (7): Column(), Comparator(), Crests(), METRICS, Slip, ScaleCompareIcon(), SparklesIcon()

### Community 23 - "MatchList.tsx"
Cohesion: 0.08
Nodes (44): GoalAlert, newGoals(), Score, goals(), ActivityPulseIcon(), FlameIcon(), GridMultiViewIcon(), MaximizeExpandIcon() (+36 more)

### Community 24 - "gemini.py"
Cohesion: 0.16
Nodes (8): ask_vyrox_ia(), _context(), _generate(), MatchInfo, predict(), Prediction, Score, predictions()

### Community 25 - "main.py"
Cohesion: 0.06
Nodes (50): api_get(), api_keys(), fetch_matches(), _fresh(), group_by_league(), _league_order(), _team(), to_match() (+42 more)

### Community 26 - "radar.py"
Cohesion: 0.14
Nodes (12): day_forecasts(), get_parlays(), kickoff(), upcoming(), _forecast(), forecast_rows(), get_forecasts(), get_radar() (+4 more)

### Community 27 - "test_momentum.py"
Cohesion: 0.18
Nodes (13): measure(), pressure(), attack(), with_momentum(), fresh_measurements(), side(), test_a_side_a_man_down_presses_less(), test_an_average_match_is_balanced() (+5 more)

### Community 29 - "AiPrediction.tsx"
Cohesion: 0.20
Nodes (14): CONFIDENCE, MarketOdds(), PredictionCards(), PredictionView(), StakeSimulator(), TicketSlipIcon(), TrendUpIcon(), Prediction (+6 more)

### Community 30 - "Parlays.tsx"
Cohesion: 0.13
Nodes (25): Chevron(), DoubleChevronRightIcon(), DoubleChevronUpIcon(), RefreshIcon(), WandSparklesIcon(), choice(), Choices(), Leg() (+17 more)

### Community 31 - "icons.tsx"
Cohesion: 0.17
Nodes (17): TicketCard(), CARD, CopyIcon(), CrossIcon(), DownloadIcon(), GlobeIcon(), IconProps, MoonIcon() (+9 more)

### Community 32 - "test_builder.py"
Cohesion: 0.25
Nodes (12): build(), test_a_day_already_played_builds_a_reference(), test_another_combination_is_another_mix_of_matches_on_target(), test_auto_splits_the_target_into_safe_legs(), test_auto_takes_fewer_legs_when_the_market_pays_more_per_leg(), test_dates_outside_the_free_plan_return_400(), test_one_pick_per_match_with_the_legs_and_market_asked(), test_reads_the_cached_forecast_without_new_calls() (+4 more)

### Community 33 - "OddsTable.tsx"
Cohesion: 0.33
Nodes (9): OddButton(), TrendCorner(), selection(), COLUMNS, LINES, OddsTable(), pill(), TABS (+1 more)

### Community 34 - "test_radar.py"
Cohesion: 0.36
Nodes (9): check(), get(), picks(), test_a_day_already_played_shows_its_matches_as_a_reference(), test_forecasts_price_every_match_like_the_radar_without_a_new_call(), test_four_markets_from_one_forecast(), test_no_matches(), test_shares_the_parlays_cached_forecast() (+1 more)

### Community 35 - "keys"
Cohesion: 0.33
Nodes (3): keys(), upstream(), fake_get()

### Community 36 - "upstream"
Cohesion: 0.40
Nodes (3): gemini_body(), upstream(), fake_post()

### Community 37 - "bookmakers.ts"
Cohesion: 0.29
Nodes (6): bestHouse(), quote(), slot(), BookmakerOdds, MatchOdds, OddsMarket

### Community 38 - "Sidebar.tsx"
Cohesion: 0.26
Nodes (14): CheckIcon(), FilterIcon(), Flag(), countryLabel(), fold(), leagueLogo(), TOP_LEAGUES, WORLD (+6 more)

### Community 40 - "GoalToasts.tsx"
Cohesion: 0.39
Nodes (7): GoalToasts(), BallIcon(), StarIcon(), TeamBadge(), blast(), playRefereeWhistle(), scheduleWhistle()

### Community 43 - "parlays.py"
Cohesion: 0.13
Nodes (11): get_builder(), _mixes(), _picks(), Probabilities, _build(), DayForecast, _leg(), MatchForecast (+3 more)

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reglas de arquitectura` connect `radar.py` to `bookmakers.ts`, `Sidebar.tsx`, `VYROX: contexto del proyecto`, `builder.py`, `useBetSlip.ts`, `ticketSettlement.test.ts`, `MatchList.tsx`?**
  _High betweenness centrality (0.428) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.14624505928853754 - nodes in this community are weakly interconnected._
- **Why does `VyroxDropdown()` connect `Sidebar.tsx` to `App.tsx`, `Comparator.tsx`, `MatchList.tsx`, `radar.py`, `Parlays.tsx`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._
- **Why does `prob_to_market_odd()` connect `builder.py` to `test_radar.py`, `parlays.py`, `test_parlays.py`, `gemini.py`, `radar.py`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11092436974789915 - nodes in this community are weakly interconnected._