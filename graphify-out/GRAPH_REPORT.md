# Graph Report - VYROX  (2026-10-31)

## Corpus Check
- 80 files · ~51,527 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 793 nodes · 2072 edges · 33 communities (31 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0b193f7f`
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
- test_momentum.py
- MatchList.tsx
- types.ts
- icons.tsx
- status.ts
- test_bookmakers.py
- details.py
- Sidebar.tsx
- OddsTable.tsx
- TicketSlipIcon
- usePinned.ts
- Parlays.tsx
- AiPrediction.tsx
- Comparator.tsx

## God Nodes (most connected - your core abstractions)
1. `App()` - 38 edges
2. `a11y()` - 38 edges
3. `react` - 26 edges
4. `MatchCenter()` - 25 edges
5. `fixture()` - 23 edges
6. `useBetSlip()` - 22 edges
7. `BetSlip()` - 20 edges
8. `UpstreamError` - 18 edges
9. `compilerOptions` - 18 edges
10. `fetch_matches()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Reglas de arquitectura` --references--> `bestHouse()`  [INFERRED]
  docs/proyecto.md → frontend/src/bookmakers.ts
- `Reglas de arquitectura` --references--> `goals()`  [INFERRED]
  docs/proyecto.md → frontend/src/goals.test.ts
- `Reglas de arquitectura` --references--> `newGoals()`  [INFERRED]
  docs/proyecto.md → frontend/src/goals.ts
- `Reglas de arquitectura` --references--> `compareMatches()`  [INFERRED]
  docs/proyecto.md → frontend/src/matchComparator.ts
- `Reglas de arquitectura` --references--> `legs()`  [INFERRED]
  docs/proyecto.md → frontend/src/sameGameParlay.test.ts

## Import Cycles
- None detected.

## Communities (33 total, 2 thin omitted)

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
Nodes (25): App(), DAYS, FILTERS, hot(), longDate(), Message(), QUICK_MARKETS, QuickMarket (+17 more)

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
Nodes (22): PredictionView(), HeadToHead(), Lineups(), MatchCenter(), Note(), Pitch(), SIDE_COLOR, SIDE_RING (+14 more)

### Community 11 - "test_details.py"
Cohesion: 0.08
Nodes (37): fixture(), install(), meeting(), team(), api(), expire(), get(), test_a_live_match_gets_its_momentum_and_the_list_shows_it() (+29 more)

### Community 14 - "parlays.py"
Cohesion: 0.05
Nodes (43): group_by_league(), _mixes(), _picks(), ask_vyrox_ia(), _generate(), Prediction, Probabilities, Score (+35 more)

### Community 15 - "BetSlip.tsx"
Cohesion: 0.13
Nodes (31): Badge(), BankrollAnalytics(), Chart(), Mode, MODES, BADGES, CARD, CopInput() (+23 more)

### Community 16 - "test_parlays.py"
Cohesion: 0.10
Nodes (26): build(), test_a_day_already_played_builds_a_reference(), test_another_combination_is_another_mix_of_matches_on_target(), test_auto_splits_the_target_into_safe_legs(), test_auto_takes_fewer_legs_when_the_market_pays_more_per_leg(), test_dates_outside_the_free_plan_return_400(), test_one_pick_per_match_with_the_legs_and_market_asked(), test_reads_the_cached_forecast_without_new_calls() (+18 more)

### Community 17 - "useBetSlip.ts"
Cohesion: 0.10
Nodes (42): BetBuilder(), pill(), Base, betBuilderMarkets(), byMatch(), calculateCorrelatedOdd(), Chances, Choice (+34 more)

### Community 18 - "ticketSettlement.test.ts"
Cohesion: 0.08
Nodes (22): bankrollAnalytics(), BankrollPoint, day(), FAMILIES, FAMILY, net(), Settled, ComparedSide (+14 more)

### Community 19 - "test_momentum.py"
Cohesion: 0.18
Nodes (13): measure(), pressure(), attack(), with_momentum(), fresh_measurements(), side(), test_a_side_a_man_down_presses_less(), test_an_average_match_is_balanced() (+5 more)

### Community 20 - "MatchList.tsx"
Cohesion: 0.14
Nodes (19): ActivityPulseIcon(), Compare, CompareButton(), MatchRow(), Pin, Quick, MomentumPanel(), PressureBar() (+11 more)

### Community 21 - "types.ts"
Cohesion: 0.12
Nodes (19): bestHouse(), quote(), slot(), BookmakerOdds, Competition, ForecastsResponse, Goals, League (+11 more)

### Community 22 - "icons.tsx"
Cohesion: 0.17
Nodes (24): PredictionCards(), TicketCard(), a11y(), ArrowLeftIcon(), CalendarIcon(), CARD, CheckIcon(), CollapseAllIcon() (+16 more)

### Community 23 - "status.ts"
Cohesion: 0.23
Nodes (11): GoalAlert, newGoals(), Score, goals(), LIVE, STATUS_LABEL, Match, ALERT_MODES (+3 more)

### Community 24 - "test_bookmakers.py"
Cohesion: 0.32
Nodes (9): api(), bet(), expire(), get(), response(), test_a_match_without_odds_or_without_a_key(), test_each_bookmaker_with_the_markets_it_fully_quotes(), test_odds_are_cached_for_three_hours_and_arrows_show_real_moves() (+1 more)

### Community 25 - "details.py"
Cohesion: 0.05
Nodes (48): api_get(), api_keys(), colombia_today(), fetch_matches(), _fresh(), _league_order(), _team(), to_match() (+40 more)

### Community 26 - "Sidebar.tsx"
Cohesion: 0.35
Nodes (11): FilterIcon(), Flag(), countryLabel(), fold(), leagueLogo(), TOP_LEAGUES, WORLD, AllLeagues() (+3 more)

### Community 27 - "OddsTable.tsx"
Cohesion: 0.27
Nodes (10): selection(), TrendDownArrowIcon(), TrendUpArrowIcon(), COLUMNS, LINES, OddsTable(), pill(), TABS (+2 more)

### Community 28 - "TicketSlipIcon"
Cohesion: 0.29
Nodes (10): GoalToasts(), NOTES, playGoal(), BallIcon(), CardIcon(), StarIcon(), SubIcon(), TicketSlipIcon() (+2 more)

### Community 29 - "usePinned.ts"
Cohesion: 0.70
Nodes (4): save(), stored(), storedAuto(), usePinned()

### Community 30 - "Parlays.tsx"
Cohesion: 0.15
Nodes (24): Thinking(), Collapse(), DoubleChevronRightIcon(), DoubleChevronUpIcon(), FlameIcon(), RefreshIcon(), WandSparklesIcon(), choice() (+16 more)

### Community 33 - "AiPrediction.tsx"
Cohesion: 0.33
Nodes (8): CONFIDENCE, MarketOdds(), OddButton(), StakeSimulator(), TrendUpIcon(), kickoffLabel(), Prediction, usePrediction()

### Community 34 - "Comparator.tsx"
Cohesion: 0.29
Nodes (9): BetSlip(), IconButton(), Column(), Comparator(), METRICS, Slip, LayersCombineIcon(), ScaleCompareIcon() (+1 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reglas de arquitectura` connect `parlays.py` to `VYROX: contexto del proyecto`, `useBetSlip.ts`, `ticketSettlement.test.ts`, `types.ts`, `status.ts`?**
  _High betweenness centrality (0.429) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.10837438423645321 - nodes in this community are weakly interconnected._
- **Why does `totalOdd()` connect `useBetSlip.ts` to `AiPrediction.tsx`, `Comparator.tsx`, `parlays.py`, `BetSlip.tsx`, `types.ts`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._
- **Why does `prob_to_market_odd()` connect `parlays.py` to `test_parlays.py`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12473118279569892 - nodes in this community are weakly interconnected._