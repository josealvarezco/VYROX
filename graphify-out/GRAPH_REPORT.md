# Graph Report - VYROX  (2026-11-03)

## Corpus Check
- 84 files · ~56,368 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 818 nodes · 2174 edges · 42 communities (38 shown, 4 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 57 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `32036f21`
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
- MatchList.tsx
- types.ts
- Comparator.tsx
- status.ts
- gemini.py
- details.py
- radar.py
- test_bookmakers.py
- fake_api_football.py
- usePinned.ts
- Parlays.tsx
- icons.tsx
- get_builder
- AiPrediction.tsx
- main.py
- keys
- upstream
- Momentum.tsx
- Sidebar.tsx
- ThemeToggle.tsx
- GoalToasts.tsx
- parlays.py

## God Nodes (most connected - your core abstractions)
1. `App()` - 44 edges
2. `a11y()` - 39 edges
3. `react` - 27 edges
4. `MatchCenter()` - 26 edges
5. `fixture()` - 23 edges
6. `useBetSlip()` - 22 edges
7. `BetSlip()` - 20 edges
8. `UpstreamError` - 18 edges
9. `compilerOptions` - 18 edges
10. `fetch_matches()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Reglas de arquitectura` --references--> `forecast_rows()`  [INFERRED]
  docs/proyecto.md → backend/app/radar.py
- `Reglas de arquitectura` --references--> `VyroxDropdown()`  [INFERRED]
  docs/proyecto.md → frontend/src/VyroxDropdown.tsx
- `Reglas de arquitectura` --references--> `bestHouse()`  [INFERRED]
  docs/proyecto.md → frontend/src/bookmakers.ts
- `Reglas de arquitectura` --references--> `goals()`  [INFERRED]
  docs/proyecto.md → frontend/src/goals.test.ts
- `Reglas de arquitectura` --references--> `newGoals()`  [INFERRED]
  docs/proyecto.md → frontend/src/goals.ts

## Import Cycles
- None detected.

## Communities (42 total, 4 thin omitted)

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
Nodes (29): ALERT_ICONS, App(), DAYS, FILTERS, hot(), longDate(), Message(), QUICK_MARKETS (+21 more)

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
Cohesion: 0.15
Nodes (22): CHIP, HeadToHead(), Lineups(), Markings(), MatchCenter(), Note(), Pitch(), PlayerCard() (+14 more)

### Community 11 - "test_predictions.py"
Cohesion: 0.16
Nodes (16): install(), fresh_cache(), post(), sent_prompt(), test_gemini_failure_returns_fallback_and_is_not_cached(), test_market_odds_follow_the_rescaled_probabilities_and_skip_zero(), test_missing_market_probability_is_outside_schema(), test_overloaded_flash_falls_back_to_flash_lite() (+8 more)

### Community 14 - "builder.py"
Cohesion: 0.12
Nodes (13): _picks(), odds_1x2(), pick_odd(), prob_to_market_odd(), _within(), _forecast(), _markets(), test_1x2_keeps_the_draw_and_the_favourite_in_range() (+5 more)

### Community 15 - "BetSlip.tsx"
Cohesion: 0.06
Nodes (58): MarketOdds(), Badge(), BankrollAnalytics(), Chart(), Mode, MODES, bankrollAnalytics(), BankrollPoint (+50 more)

### Community 16 - "test_parlays.py"
Cohesion: 0.08
Nodes (35): build(), test_a_day_already_played_builds_a_reference(), test_another_combination_is_another_mix_of_matches_on_target(), test_auto_splits_the_target_into_safe_legs(), test_auto_takes_fewer_legs_when_the_market_pays_more_per_leg(), test_dates_outside_the_free_plan_return_400(), test_one_pick_per_match_with_the_legs_and_market_asked(), test_reads_the_cached_forecast_without_new_calls() (+27 more)

### Community 17 - "useBetSlip.ts"
Cohesion: 0.07
Nodes (51): BetBuilder(), pill(), bestHouse(), quote(), selection(), slot(), Base, betBuilderMarkets() (+43 more)

### Community 18 - "ticketSettlement.test.ts"
Cohesion: 0.20
Nodes (11): ComparedSide, compareMatches(), likelier(), phrase(), safety(), side(), teams(), ARSENAL (+3 more)

### Community 19 - "test_details.py"
Cohesion: 0.24
Nodes (16): fixture(), api(), expire(), get(), test_a_live_match_gets_its_momentum_and_the_list_shows_it(), test_finished_match_is_cached_for_six_hours(), test_finished_or_simulated_statistics_get_no_momentum(), test_h2h_failure_keeps_the_rest_of_the_match_center() (+8 more)

### Community 20 - "MatchList.tsx"
Cohesion: 0.26
Nodes (11): Collapse(), CompareButton(), LiveMinute(), MatchCard(), MatchRow(), Pin, Quick, kickoffTime() (+3 more)

### Community 21 - "types.ts"
Cohesion: 0.10
Nodes (21): Compare, Card(), Market, MARKETS, Props, RadarGrid(), ForecastsResponse, Goals (+13 more)

### Community 22 - "Comparator.tsx"
Cohesion: 0.36
Nodes (9): BetSlip(), Column(), Comparator(), Crests(), METRICS, Slip, CrossIcon(), ScaleCompareIcon() (+1 more)

### Community 23 - "status.ts"
Cohesion: 0.28
Nodes (9): GoalAlert, newGoals(), Score, goals(), Match, ALERT_MODES, AlertMode, storedMode() (+1 more)

### Community 24 - "gemini.py"
Cohesion: 0.16
Nodes (8): ask_vyrox_ia(), _context(), _generate(), MatchInfo, predict(), Prediction, Score, predictions()

### Community 25 - "details.py"
Cohesion: 0.07
Nodes (38): api_get(), api_keys(), _bookmakers(), get_odds(), _quote(), _build(), _by_side(), _card() (+30 more)

### Community 26 - "radar.py"
Cohesion: 0.14
Nodes (11): colombia_today(), fetch_matches(), _fresh(), group_by_league(), _league_order(), _team(), to_match(), upcoming() (+3 more)

### Community 27 - "test_bookmakers.py"
Cohesion: 0.32
Nodes (9): api(), bet(), expire(), get(), response(), test_a_match_without_odds_or_without_a_key(), test_each_bookmaker_with_the_markets_it_fully_quotes(), test_odds_are_cached_for_three_hours_and_arrows_show_real_moves() (+1 more)

### Community 29 - "usePinned.ts"
Cohesion: 0.70
Nodes (4): save(), stored(), storedAuto(), usePinned()

### Community 30 - "Parlays.tsx"
Cohesion: 0.16
Nodes (21): DoubleChevronRightIcon(), DoubleChevronUpIcon(), FlameIcon(), RefreshIcon(), WandSparklesIcon(), choice(), Choices(), Leg() (+13 more)

### Community 31 - "icons.tsx"
Cohesion: 0.17
Nodes (21): a11y(), CARD, CardIcon(), CopyIcon(), DownloadIcon(), GlobeIcon(), IconProps, JerseyIcon() (+13 more)

### Community 33 - "AiPrediction.tsx"
Cohesion: 0.20
Nodes (14): CONFIDENCE, PredictionCards(), PredictionView(), Thinking(), OddButton(), TrendCorner(), COLUMNS, LINES (+6 more)

### Community 34 - "main.py"
Cohesion: 0.27
Nodes (10): UpstreamError, MatchNotFound, check_available(), forecasts(), match_details(), match_odds(), matches(), parlay_builder() (+2 more)

### Community 35 - "keys"
Cohesion: 0.33
Nodes (3): keys(), upstream(), fake_get()

### Community 36 - "upstream"
Cohesion: 0.40
Nodes (3): gemini_body(), upstream(), fake_post()

### Community 37 - "Momentum.tsx"
Cohesion: 0.60
Nodes (4): ActivityPulseIcon(), MomentumPanel(), PressureBar(), Momentum

### Community 38 - "Sidebar.tsx"
Cohesion: 0.24
Nodes (16): CheckIcon(), Chevron(), FilterIcon(), Flag(), countryLabel(), fold(), leagueLogo(), TOP_LEAGUES (+8 more)

### Community 39 - "ThemeToggle.tsx"
Cohesion: 0.83
Nodes (3): MoonIcon(), SunIcon(), ThemeToggle()

### Community 40 - "GoalToasts.tsx"
Cohesion: 0.42
Nodes (7): GoalToasts(), BallIcon(), StarIcon(), TicketSlipIcon(), blast(), playRefereeWhistle(), scheduleWhistle()

### Community 43 - "parlays.py"
Cohesion: 0.14
Nodes (13): Probabilities, _build(), day_forecasts(), DayForecast, get_parlays(), kickoff(), _leg(), MatchForecast (+5 more)

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reglas de arquitectura` connect `builder.py` to `VYROX: contexto del proyecto`, `Sidebar.tsx`, `useBetSlip.ts`, `ticketSettlement.test.ts`, `status.ts`, `radar.py`?**
  _High betweenness centrality (0.429) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._
- **Why does `prob_to_market_odd()` connect `builder.py` to `gemini.py`, `test_parlays.py`, `radar.py`, `parlays.py`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Why does `VyroxDropdown()` connect `Sidebar.tsx` to `App.tsx`, `builder.py`, `Comparator.tsx`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10873440285204991 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._