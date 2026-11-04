# Graph Report - VYROX  (2026-11-03)

## Corpus Check
- 90 files · ~63,509 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 906 nodes · 2480 edges · 45 communities (42 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 69 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6465e5da`
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
- Comparator.tsx
- useBetSlip.ts
- ticketSettlement.test.ts
- test_details.py
- types.ts
- api_football.py
- MatchList.tsx
- gemini.py
- details.py
- radar.py
- fake_api_football.py
- Parlays.tsx
- icons.tsx
- test_builder.py
- AiPrediction.tsx
- keys
- upstream
- test_live.py
- Sidebar.tsx
- live.py
- GoalToasts.tsx
- multiView.ts
- main.py
- parlays.py
- Match
- test_bookmakers.py
- useBetSlip.ts
- usePinned.ts
- ThemeToggle.tsx

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

## Communities (45 total, 3 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.16
Nodes (14): expire_cache(), fetch(), fresh_cache(), league_fixture(), test_a_spent_key_hands_the_same_request_to_the_next_one(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_errors_that_no_other_key_fixes_reach_the_caller(), test_finished_past_day_is_never_requested_again() (+6 more)

### Community 1 - "package.json"
Cohesion: 0.07
Nodes (33): dependencies, react@^19.3.1, react-dom@^19.3.1, devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2 (+25 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 3 - "App.tsx"
Cohesion: 0.12
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
Nodes (22): CHIP, HeadToHead(), Lineups(), Markings(), MatchCenter(), Note(), Pitch(), PlayerCard() (+14 more)

### Community 11 - "test_predictions.py"
Cohesion: 0.16
Nodes (16): install(), fresh_cache(), post(), sent_prompt(), test_gemini_failure_returns_fallback_and_is_not_cached(), test_market_odds_follow_the_rescaled_probabilities_and_skip_zero(), test_missing_market_probability_is_outside_schema(), test_overloaded_flash_falls_back_to_flash_lite() (+8 more)

### Community 14 - "builder.py"
Cohesion: 0.15
Nodes (11): live_odd(), odds_1x2(), pick_odd(), prob_to_market_odd(), _within(), test_1x2_keeps_the_draw_and_the_favourite_in_range(), test_1x2_shares_a_107_5_percent_book(), test_a_pick_pays_between_1_22_and_2_35() (+3 more)

### Community 15 - "BetSlip.tsx"
Cohesion: 0.07
Nodes (48): Badge(), BankrollAnalytics(), Chart(), Mode, MODES, bankrollAnalytics(), BankrollPoint, day() (+40 more)

### Community 16 - "Comparator.tsx"
Cohesion: 0.36
Nodes (8): Column(), Comparator(), Crests(), METRICS, Slip, DoubleChevronRightIcon(), ScaleCompareIcon(), SparklesIcon()

### Community 17 - "useBetSlip.ts"
Cohesion: 0.09
Nodes (37): BetBuilder(), pill(), BetSlip(), IconButton(), bestHouse(), quote(), slot(), LayersCombineIcon() (+29 more)

### Community 18 - "ticketSettlement.test.ts"
Cohesion: 0.22
Nodes (10): ComparedSide, compareMatches(), likelier(), phrase(), safety(), side(), teams(), ARSENAL (+2 more)

### Community 19 - "test_details.py"
Cohesion: 0.24
Nodes (16): fixture(), api(), expire(), get(), test_a_live_match_gets_its_momentum_and_the_list_shows_it(), test_finished_match_is_cached_for_six_hours(), test_finished_or_simulated_statistics_get_no_momentum(), test_h2h_failure_keeps_the_rest_of_the_match_center() (+8 more)

### Community 21 - "types.ts"
Cohesion: 0.09
Nodes (24): Compare, Card(), Market, MARKETS, Props, RadarGrid(), Competition, ForecastPick (+16 more)

### Community 22 - "api_football.py"
Cohesion: 0.21
Nodes (6): colombia_today(), fetch_matches(), _fresh(), _league_order(), _team(), to_match()

### Community 23 - "MatchList.tsx"
Cohesion: 0.16
Nodes (28): ActivityPulseIcon(), FlameIcon(), GridMultiViewIcon(), LockClosedIcon(), MaximizeExpandIcon(), LiveMultiView(), Play, Quadrant() (+20 more)

### Community 24 - "gemini.py"
Cohesion: 0.13
Nodes (9): ask_vyrox_ia(), _context(), _generate(), MatchInfo, predict(), Prediction, Probabilities, Score (+1 more)

### Community 25 - "details.py"
Cohesion: 0.09
Nodes (30): _build(), _by_side(), _card(), _cells(), _events(), _h2h_summary(), _is_goal(), _lineups() (+22 more)

### Community 26 - "radar.py"
Cohesion: 0.13
Nodes (13): group_by_league(), kickoff(), simulated_forecast(), still_open(), upcoming(), _forecast(), forecast_rows(), get_forecasts() (+5 more)

### Community 30 - "Parlays.tsx"
Cohesion: 0.12
Nodes (24): Collapse(), ArrowLeftIcon(), DoubleChevronUpIcon(), RefreshIcon(), choice(), Choices(), Leg(), LEG_COUNTS (+16 more)

### Community 31 - "icons.tsx"
Cohesion: 0.15
Nodes (26): StakeSimulator(), TicketCard(), a11y(), CARD, CardIcon(), CopyIcon(), CrossIcon(), DownloadIcon() (+18 more)

### Community 32 - "test_builder.py"
Cohesion: 0.31
Nodes (11): build(), test_a_day_already_played_builds_a_reference(), test_another_combination_is_another_mix_of_matches_on_target(), test_auto_splits_the_target_into_safe_legs(), test_auto_takes_fewer_legs_when_the_market_pays_more_per_leg(), test_dates_outside_the_free_plan_return_400(), test_one_pick_per_match_with_the_legs_and_market_asked(), test_reads_the_cached_forecast_without_new_calls() (+3 more)

### Community 33 - "AiPrediction.tsx"
Cohesion: 0.18
Nodes (18): CONFIDENCE, MarketOdds(), PredictionCards(), PredictionView(), Thinking(), OddButton(), TrendCorner(), selection() (+10 more)

### Community 35 - "keys"
Cohesion: 0.33
Nodes (3): keys(), upstream(), fake_get()

### Community 36 - "upstream"
Cohesion: 0.40
Nodes (3): gemini_body(), upstream(), fake_post()

### Community 37 - "test_live.py"
Cohesion: 0.07
Nodes (47): chances_at(), finished(), live_match(), test_a_forecast_keeps_its_chances_at_kickoff(), test_a_goal_moves_the_chances_toward_the_side_that_scored(), test_a_later_forecast_keeps_the_earlier_one_of_matches_already_live(), test_a_live_odd_always_carries_a_margin_and_a_settled_side_has_none(), test_a_slip_never_takes_what_the_score_settled() (+39 more)

### Community 38 - "Sidebar.tsx"
Cohesion: 0.23
Nodes (18): CheckIcon(), Chevron(), FilterIcon(), Flag(), byCountry(), countryLabel(), fold(), LEAD_COUNTRIES (+10 more)

### Community 39 - "live.py"
Cohesion: 0.31
Nodes (4): _chances(), expected_goals(), _home_share(), _solve()

### Community 40 - "GoalToasts.tsx"
Cohesion: 0.42
Nodes (7): GoalToasts(), BallIcon(), StarIcon(), TicketSlipIcon(), blast(), playRefereeWhistle(), scheduleWhistle()

### Community 41 - "multiView.ts"
Cohesion: 0.12
Nodes (15): parlayMatches(), SLOTS, stage(), Track, trackLeg(), LIVE, COLUMN_WON, DECIDED (+7 more)

### Community 42 - "main.py"
Cohesion: 0.13
Nodes (18): api_get(), api_keys(), UpstreamError, _bookmakers(), get_odds(), _quote(), get_details(), _head_to_head() (+10 more)

### Community 43 - "parlays.py"
Cohesion: 0.10
Nodes (17): get_builder(), _mixes(), _picks(), _build(), day_forecasts(), DayForecast, _fresh(), get_parlays() (+9 more)

### Community 44 - "Match"
Cohesion: 0.29
Nodes (8): GoalAlert, newGoals(), Score, goals(), ALERT_MODES, AlertMode, storedMode(), useGoalAlerts()

### Community 45 - "test_bookmakers.py"
Cohesion: 0.32
Nodes (9): api(), bet(), expire(), get(), response(), test_a_match_without_odds_or_without_a_key(), test_each_bookmaker_with_the_markets_it_fully_quotes(), test_odds_are_cached_for_three_hours_and_arrows_show_real_moves() (+1 more)

### Community 47 - "useBetSlip.ts"
Cohesion: 0.35
Nodes (11): settle(), isLeg(), isTicket(), merge(), same(), save(), slipKey(), STATUSES (+3 more)

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

- **Why does `Reglas de arquitectura` connect `builder.py` to `VYROX: contexto del proyecto`, `Sidebar.tsx`, `multiView.ts`, `parlays.py`, `Match`, `useBetSlip.ts`, `useBetSlip.ts`, `ticketSettlement.test.ts`, `Parlays.tsx`?**
  _High betweenness centrality (0.439) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07207207207207207 - nodes in this community are weakly interconnected._
- **Why does `open_rows()` connect `parlays.py` to `radar.py`, `api_football.py`, `builder.py`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Why does `prob_to_market_odd()` connect `builder.py` to `gemini.py`, `radar.py`, `parlays.py`, `test_live.py`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12315270935960591 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._