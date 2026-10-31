# Graph Report - VYROX  (2026-10-31)

## Corpus Check
- 81 files · ~52,940 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 798 nodes · 2088 edges · 44 communities (41 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `18d44ca9`
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
- prob_to_market_odd
- Bankroll.tsx
- test_parlays.py
- useBetSlip.ts
- ticketSettlement.test.ts
- api_football.py
- MatchList.tsx
- types.ts
- icons.tsx
- status.ts
- gemini.py
- details.py
- radar.py
- bookmakers.ts
- builder.py
- usePinned.ts
- Parlays.tsx
- BetSlip.tsx
- get_details
- AiPrediction.tsx
- main.py
- a11y
- test_bookmakers.py
- ticketSettlement.test.ts
- Sidebar.tsx
- useBetSlip.ts
- GoalToasts.tsx
- bankrollAnalytics.ts
- FlameIcon

## God Nodes (most connected - your core abstractions)
1. `App()` - 39 edges
2. `a11y()` - 36 edges
3. `react` - 26 edges
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

## Communities (44 total, 3 thin omitted)

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
Nodes (26): App(), DAYS, FILTERS, hot(), longDate(), Message(), QUICK_MARKETS, QuickMarket (+18 more)

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

### Community 11 - "test_details.py"
Cohesion: 0.08
Nodes (37): fixture(), install(), meeting(), team(), api(), expire(), get(), test_a_live_match_gets_its_momentum_and_the_list_shows_it() (+29 more)

### Community 14 - "prob_to_market_odd"
Cohesion: 0.14
Nodes (13): odds_1x2(), pick_odd(), prob_to_market_odd(), _within(), _build(), _options(), _parlay(), test_1x2_keeps_the_draw_and_the_favourite_in_range() (+5 more)

### Community 15 - "Bankroll.tsx"
Cohesion: 0.16
Nodes (24): Badge(), BankrollAnalytics(), Chart(), Mode, MODES, Collapse(), AwardBadgeIcon(), ChartLineUpIcon() (+16 more)

### Community 16 - "test_parlays.py"
Cohesion: 0.08
Nodes (35): build(), test_a_day_already_played_builds_a_reference(), test_another_combination_is_another_mix_of_matches_on_target(), test_auto_splits_the_target_into_safe_legs(), test_auto_takes_fewer_legs_when_the_market_pays_more_per_leg(), test_dates_outside_the_free_plan_return_400(), test_one_pick_per_match_with_the_legs_and_market_asked(), test_reads_the_cached_forecast_without_new_calls() (+27 more)

### Community 17 - "useBetSlip.ts"
Cohesion: 0.14
Nodes (26): BetBuilder(), pill(), LayersCombineIcon(), Base, betBuilderMarkets(), calculateCorrelatedOdd(), Chances, Choice (+18 more)

### Community 18 - "ticketSettlement.test.ts"
Cohesion: 0.20
Nodes (10): ComparedSide, compareMatches(), likelier(), phrase(), safety(), side(), teams(), ARSENAL (+2 more)

### Community 19 - "api_football.py"
Cohesion: 0.16
Nodes (7): fetch_matches(), _fresh(), group_by_league(), _league_order(), _team(), to_match(), DayForecast

### Community 20 - "MatchList.tsx"
Cohesion: 0.22
Nodes (12): Compare, LiveMinute(), MatchRow(), Pin, Quick, kickoffTime(), LIVE, STATUS_LABEL (+4 more)

### Community 21 - "types.ts"
Cohesion: 0.16
Nodes (12): ForecastPick, ForecastsResponse, Goals, League, MatchDetails, MatchesResponse, MatchEvent, Meeting (+4 more)

### Community 22 - "icons.tsx"
Cohesion: 0.13
Nodes (22): Column(), Comparator(), METRICS, Slip, CARD, DoubleChevronRightIcon(), DoubleChevronUpIcon(), Flag() (+14 more)

### Community 23 - "status.ts"
Cohesion: 0.28
Nodes (9): GoalAlert, newGoals(), Score, goals(), Match, ALERT_MODES, AlertMode, storedMode() (+1 more)

### Community 24 - "gemini.py"
Cohesion: 0.16
Nodes (8): ask_vyrox_ia(), _context(), _generate(), MatchInfo, predict(), Prediction, Score, predictions()

### Community 25 - "details.py"
Cohesion: 0.09
Nodes (30): _build(), _by_side(), _card(), _cells(), _events(), _h2h_summary(), _is_goal(), _lineups() (+22 more)

### Community 26 - "radar.py"
Cohesion: 0.15
Nodes (15): colombia_today(), Probabilities, day_forecasts(), get_parlays(), kickoff(), MatchForecast, simulated_forecast(), upcoming() (+7 more)

### Community 27 - "bookmakers.ts"
Cohesion: 0.21
Nodes (9): bestHouse(), quote(), selection(), slot(), BookmakerOdds, MatchOdds, OddsMarket, SlipLeg (+1 more)

### Community 28 - "builder.py"
Cohesion: 0.26
Nodes (4): get_builder(), _mixes(), _picks(), _leg()

### Community 29 - "usePinned.ts"
Cohesion: 0.70
Nodes (4): save(), stored(), storedAuto(), usePinned()

### Community 30 - "Parlays.tsx"
Cohesion: 0.16
Nodes (13): choice(), Choices(), LEG_COUNTS, MARKETS, Props, RIBBON, Slip, Market (+5 more)

### Community 31 - "BetSlip.tsx"
Cohesion: 0.18
Nodes (20): MarketOdds(), BADGES, BetSlip(), CARD, CopInput(), IconButton(), MyBets(), ODD (+12 more)

### Community 32 - "get_details"
Cohesion: 0.18
Nodes (8): api_get(), api_keys(), _bookmakers(), get_odds(), _quote(), get_details(), _head_to_head(), _ttl()

### Community 33 - "AiPrediction.tsx"
Cohesion: 0.13
Nodes (23): CONFIDENCE, Thinking(), OddButton(), TrendCorner(), TrendUpIcon(), CompareButton(), COLUMNS, LINES (+15 more)

### Community 34 - "main.py"
Cohesion: 0.27
Nodes (10): UpstreamError, MatchNotFound, check_available(), forecasts(), match_details(), match_odds(), matches(), parlay_builder() (+2 more)

### Community 35 - "a11y"
Cohesion: 0.29
Nodes (12): PredictionCards(), PredictionView(), TicketCard(), a11y(), CheckIcon(), CopyIcon(), CrossIcon(), DownloadIcon() (+4 more)

### Community 36 - "test_bookmakers.py"
Cohesion: 0.32
Nodes (9): api(), bet(), expire(), get(), response(), test_a_match_without_odds_or_without_a_key(), test_each_bookmaker_with_the_markets_it_fully_quotes(), test_odds_are_cached_for_three_hours_and_arrows_show_real_moves() (+1 more)

### Community 37 - "ticketSettlement.test.ts"
Cohesion: 0.20
Nodes (4): BOTH_SCORE, HOME_WIN, SavedTicket, TicketLeg

### Community 38 - "Sidebar.tsx"
Cohesion: 0.38
Nodes (10): FilterIcon(), countryLabel(), fold(), leagueLogo(), TOP_LEAGUES, WORLD, AllLeagues(), Card() (+2 more)

### Community 39 - "useBetSlip.ts"
Cohesion: 0.35
Nodes (11): settle(), isLeg(), isTicket(), merge(), same(), save(), slipKey(), STATUSES (+3 more)

### Community 40 - "GoalToasts.tsx"
Cohesion: 0.39
Nodes (7): GoalToasts(), BallIcon(), StarIcon(), TeamBadge(), blast(), playRefereeWhistle(), scheduleWhistle()

### Community 41 - "bankrollAnalytics.ts"
Cohesion: 0.32
Nodes (7): bankrollAnalytics(), BankrollPoint, day(), FAMILIES, FAMILY, net(), Settled

### Community 42 - "FlameIcon"
Cohesion: 0.53
Nodes (5): ActivityPulseIcon(), FlameIcon(), MomentumPanel(), PressureBar(), Momentum

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reglas de arquitectura` connect `prob_to_market_odd` to `VYROX: contexto del proyecto`, `useBetSlip.ts`, `useBetSlip.ts`, `ticketSettlement.test.ts`, `status.ts`, `radar.py`, `bookmakers.ts`, `BetSlip.tsx`?**
  _High betweenness centrality (0.429) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11375661375661375 - nodes in this community are weakly interconnected._
- **Why does `totalOdd()` connect `BetSlip.tsx` to `AiPrediction.tsx`, `useBetSlip.ts`, `prob_to_market_odd`, `useBetSlip.ts`, `bookmakers.ts`?**
  _High betweenness centrality (0.168) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._
- **Why does `prob_to_market_odd()` connect `prob_to_market_odd` to `test_parlays.py`, `api_football.py`, `gemini.py`, `radar.py`, `builder.py`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11954022988505747 - nodes in this community are weakly interconnected._