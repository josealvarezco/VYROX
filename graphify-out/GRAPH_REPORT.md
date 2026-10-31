# Graph Report - VYROX  (2026-10-31)

## Corpus Check
- 82 files · ~53,918 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 803 nodes · 2112 edges · 39 communities (36 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9e661a13`
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
- parlays.py
- BetSlip.tsx
- test_parlays.py
- useBetSlip.ts
- ticketSettlement.test.ts
- api_football.py
- MatchList.tsx
- types.ts
- Comparator.tsx
- status.ts
- gemini.py
- details.py
- radar.py
- bookmakers.ts
- test_momentum.py
- usePinned.ts
- Parlays.tsx
- icons.tsx
- AiPrediction.tsx
- main.py
- MatchCenter
- ticketSettlement.test.ts
- Sidebar.tsx
- GoalToasts.tsx

## God Nodes (most connected - your core abstractions)
1. `App()` - 40 edges
2. `a11y()` - 36 edges
3. `react` - 27 edges
4. `MatchCenter()` - 26 edges
5. `fixture()` - 23 edges
6. `useBetSlip()` - 22 edges
7. `BetSlip()` - 20 edges
8. `UpstreamError` - 18 edges
9. `compilerOptions` - 18 edges
10. `fetch_matches()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Reglas de arquitectura` --references--> `prob_to_market_odd()`  [INFERRED]
  docs/proyecto.md → backend/app/odds.py
- `Reglas de arquitectura` --references--> `odds_1x2()`  [INFERRED]
  docs/proyecto.md → backend/app/odds.py
- `Reglas de arquitectura` --references--> `pick_odd()`  [INFERRED]
  docs/proyecto.md → backend/app/odds.py
- `Reglas de arquitectura` --references--> `forecast_rows()`  [INFERRED]
  docs/proyecto.md → backend/app/radar.py
- `Reglas de arquitectura` --references--> `VyroxDropdown()`  [INFERRED]
  docs/proyecto.md → frontend/src/VyroxDropdown.tsx

## Import Cycles
- None detected.

## Communities (39 total, 3 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.07
Nodes (31): api(), bet(), expire(), get(), response(), test_a_match_without_odds_or_without_a_key(), test_each_bookmaker_with_the_markets_it_fully_quotes(), test_odds_are_cached_for_three_hours_and_arrows_show_real_moves() (+23 more)

### Community 1 - "package.json"
Cohesion: 0.08
Nodes (33): dependencies, react@^19.3.1, react-dom@^19.3.1, devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2 (+25 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 3 - "App.tsx"
Cohesion: 0.15
Nodes (19): ALERT_ICONS, App(), DAYS, FILTERS, hot(), longDate(), Message(), QUICK_MARKETS (+11 more)

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
Nodes (19): CHIP, Markings(), Pitch(), PlayerCard(), playerEvents(), PlayerSpot(), POSITIONS, SIDE_COLOR (+11 more)

### Community 11 - "test_details.py"
Cohesion: 0.08
Nodes (37): fixture(), install(), meeting(), team(), api(), expire(), get(), test_a_live_match_gets_its_momentum_and_the_list_shows_it() (+29 more)

### Community 14 - "parlays.py"
Cohesion: 0.12
Nodes (19): _mixes(), _picks(), Probabilities, odds_1x2(), pick_odd(), prob_to_market_odd(), _within(), _build() (+11 more)

### Community 15 - "BetSlip.tsx"
Cohesion: 0.08
Nodes (46): Badge(), BankrollAnalytics(), Chart(), Mode, MODES, bankrollAnalytics(), BankrollPoint, day() (+38 more)

### Community 16 - "test_parlays.py"
Cohesion: 0.08
Nodes (35): build(), test_a_day_already_played_builds_a_reference(), test_another_combination_is_another_mix_of_matches_on_target(), test_auto_splits_the_target_into_safe_legs(), test_auto_takes_fewer_legs_when_the_market_pays_more_per_leg(), test_dates_outside_the_free_plan_return_400(), test_one_pick_per_match_with_the_legs_and_market_asked(), test_reads_the_cached_forecast_without_new_calls() (+27 more)

### Community 17 - "useBetSlip.ts"
Cohesion: 0.10
Nodes (42): Reglas de arquitectura, BetBuilder(), pill(), Base, betBuilderMarkets(), byMatch(), calculateCorrelatedOdd(), Chances (+34 more)

### Community 18 - "ticketSettlement.test.ts"
Cohesion: 0.22
Nodes (10): ComparedSide, compareMatches(), likelier(), phrase(), safety(), side(), teams(), ARSENAL (+2 more)

### Community 19 - "api_football.py"
Cohesion: 0.24
Nodes (4): group_by_league(), _league_order(), _team(), to_match()

### Community 20 - "MatchList.tsx"
Cohesion: 0.23
Nodes (13): ActivityPulseIcon(), CompareButton(), LiveMinute(), MatchRow(), Pin, Quick, MomentumPanel(), PressureBar() (+5 more)

### Community 21 - "types.ts"
Cohesion: 0.17
Nodes (12): ForecastPick, ForecastsResponse, Goals, League, MatchDetails, MatchesResponse, Meeting, MomentumStatus (+4 more)

### Community 22 - "Comparator.tsx"
Cohesion: 0.36
Nodes (8): Column(), Comparator(), Crests(), METRICS, Slip, DoubleChevronRightIcon(), ScaleCompareIcon(), SparklesIcon()

### Community 23 - "status.ts"
Cohesion: 0.28
Nodes (9): GoalAlert, newGoals(), Score, goals(), Match, ALERT_MODES, AlertMode, storedMode() (+1 more)

### Community 24 - "gemini.py"
Cohesion: 0.13
Nodes (8): ask_vyrox_ia(), _context(), _generate(), MatchInfo, predict(), Prediction, Score, predictions()

### Community 25 - "details.py"
Cohesion: 0.09
Nodes (26): api_get(), api_keys(), _bookmakers(), get_odds(), _quote(), _build(), _by_side(), _card() (+18 more)

### Community 26 - "radar.py"
Cohesion: 0.14
Nodes (10): colombia_today(), fetch_matches(), _fresh(), get_builder(), day_forecasts(), get_parlays(), upcoming(), forecast_rows() (+2 more)

### Community 27 - "bookmakers.ts"
Cohesion: 0.21
Nodes (7): bestHouse(), quote(), slot(), BookmakerOdds, MatchOdds, OddsMarket, useMatchOdds()

### Community 28 - "test_momentum.py"
Cohesion: 0.18
Nodes (13): measure(), pressure(), attack(), with_momentum(), fresh_measurements(), side(), test_a_side_a_man_down_presses_less(), test_an_average_match_is_balanced() (+5 more)

### Community 29 - "usePinned.ts"
Cohesion: 0.70
Nodes (4): save(), stored(), storedAuto(), usePinned()

### Community 30 - "Parlays.tsx"
Cohesion: 0.16
Nodes (20): DoubleChevronUpIcon(), FlameIcon(), RefreshIcon(), WandSparklesIcon(), choice(), Choices(), Leg(), LEG_COUNTS (+12 more)

### Community 31 - "icons.tsx"
Cohesion: 0.18
Nodes (20): a11y(), ArrowLeftIcon(), BellRingIcon(), CalendarIcon(), CARD, CardIcon(), CollapseAllIcon(), ExpandAllIcon() (+12 more)

### Community 33 - "AiPrediction.tsx"
Cohesion: 0.13
Nodes (23): CONFIDENCE, Thinking(), OddButton(), TrendCorner(), selection(), Compare, COLUMNS, LINES (+15 more)

### Community 34 - "main.py"
Cohesion: 0.32
Nodes (9): UpstreamError, check_available(), forecasts(), match_details(), match_odds(), matches(), parlay_builder(), parlays() (+1 more)

### Community 35 - "MatchCenter"
Cohesion: 0.17
Nodes (19): MarketOdds(), PredictionCards(), PredictionView(), BetSlip(), StakeSimulator(), CopyIcon(), CrossIcon(), DownloadIcon() (+11 more)

### Community 37 - "ticketSettlement.test.ts"
Cohesion: 0.20
Nodes (5): DECIDED, liveResult(), BOTH_SCORE, HOME_WIN, TicketLeg

### Community 38 - "Sidebar.tsx"
Cohesion: 0.21
Nodes (17): Collapse(), CheckIcon(), Chevron(), FilterIcon(), countryLabel(), fold(), leagueLogo(), TOP_LEAGUES (+9 more)

### Community 40 - "GoalToasts.tsx"
Cohesion: 0.39
Nodes (7): GoalToasts(), BallIcon(), StarIcon(), TeamBadge(), blast(), playRefereeWhistle(), scheduleWhistle()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reglas de arquitectura` connect `useBetSlip.ts` to `VYROX: contexto del proyecto`, `Sidebar.tsx`, `parlays.py`, `ticketSettlement.test.ts`, `status.ts`, `radar.py`, `bookmakers.ts`?**
  _High betweenness centrality (0.429) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06826241134751773 - nodes in this community are weakly interconnected._
- **Why does `prob_to_market_odd()` connect `parlays.py` to `gemini.py`, `test_matches.py`, `test_parlays.py`, `useBetSlip.ts`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._
- **Why does `forecast_rows()` connect `radar.py` to `useBetSlip.ts`, `api_football.py`, `parlays.py`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14624505928853754 - nodes in this community are weakly interconnected._