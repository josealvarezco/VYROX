# Graph Report - VYROX  (2026-10-29)

## Corpus Check
- 52 files · ~30,001 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 577 nodes · 1307 edges · 19 communities (17 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2dfa8434`
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
- details.py
- test_details.py
- tsconfig.json
- triage-labels.md
- BetSlip.tsx
- test_standings.py
- test_parlays.py
- types.ts
- parlays.py

## God Nodes (most connected - your core abstractions)
1. `App()` - 23 edges
2. `a11y()` - 22 edges
3. `fixture()` - 20 edges
4. `MatchCenter()` - 20 edges
5. `useBetSlip()` - 18 edges
6. `compilerOptions` - 18 edges
7. `fetch_matches()` - 17 edges
8. `get_details()` - 17 edges
9. `react` - 17 edges
10. `compilerOptions` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Reglas de arquitectura` --references--> `settle()`  [INFERRED]
  docs/proyecto.md → frontend/src/ticketSettlement.ts
- `Reglas de arquitectura` --references--> `goals()`  [INFERRED]
  docs/proyecto.md → backend/app/standings.py
- `api()` --indirect_call--> `parlays()`  [INFERRED]
  backend/tests/test_parlays.py → backend/app/main.py
- `radar_api()` --indirect_call--> `radar()`  [INFERRED]
  backend/tests/test_radar.py → backend/app/main.py
- `fresh_cache()` --references--> `fixture()`  [EXTRACTED]
  backend/tests/test_matches.py → backend/tests/fake_api_football.py

## Import Cycles
- None detected.

## Communities (19 total, 2 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.12
Nodes (17): expire_cache(), fetch(), fresh_cache(), keys(), league_fixture(), test_a_spent_key_hands_the_same_request_to_the_next_one(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_errors_that_no_other_key_fixes_reach_the_caller() (+9 more)

### Community 1 - "package.json"
Cohesion: 0.08
Nodes (33): dependencies, react@^19.3.1, react-dom@^19.3.1, devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2 (+25 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 3 - "App.tsx"
Cohesion: 0.08
Nodes (56): App(), DAYS, FILTERS, longDate(), Message(), shiftDay(), shortWeekday(), TODAY (+48 more)

### Community 4 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 5 - "VYROX: contexto del proyecto"
Cohesion: 0.14
Nodes (12): goals(), Etapa actual, Fuera de alcance, Hitos, Idioma, Qué es, Reglas de arquitectura, Stack (+4 more)

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

### Community 10 - "details.py"
Cohesion: 0.07
Nodes (38): api_get(), api_keys(), fetch_matches(), _fresh(), _team(), to_match(), UpstreamError, _build() (+30 more)

### Community 11 - "test_details.py"
Cohesion: 0.08
Nodes (35): fixture(), install(), meeting(), team(), api(), expire(), get(), test_finished_match_is_cached_for_six_hours() (+27 more)

### Community 14 - "BetSlip.tsx"
Cohesion: 0.09
Nodes (49): CONFIDENCE, FairOdds(), PredictionCards(), PredictionView(), Thinking(), BADGES, BetSlip(), CopInput() (+41 more)

### Community 15 - "test_standings.py"
Cohesion: 0.18
Nodes (10): age(), api(), check_simulated(), get(), row(), test_keeps_the_last_table_when_a_refresh_fails(), test_maps_the_current_table_of_the_match_with_the_form_in_spanish(), test_one_request_per_league_and_season_for_12_hours() (+2 more)

### Community 16 - "test_parlays.py"
Cohesion: 0.11
Nodes (24): colombia_today(), age(), api(), check_slips(), get(), match(), matches(), test_dates_outside_the_free_plan_return_400() (+16 more)

### Community 17 - "types.ts"
Cohesion: 0.05
Nodes (63): BallIcon(), CardIcon(), JerseyIcon(), PitchIcon(), SparklesIcon(), StandingsIcon(), SubIcon(), WhistleIcon() (+55 more)

### Community 19 - "parlays.py"
Cohesion: 0.06
Nodes (26): group_by_league(), _league_order(), ask_vyrox_ia(), _context(), _generate(), MatchInfo, predict(), Prediction (+18 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Reglas de arquitectura` connect `VYROX: contexto del proyecto` to `types.ts`?**
  _High betweenness centrality (0.404) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useBetSlip()` (e.g. with `isLeg()` and `isTicket()`) actually correct?**
  _`useBetSlip()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11965811965811966 - nodes in this community are weakly interconnected._
- **Why does `_simulated()` connect `details.py` to `VYROX: contexto del proyecto`?**
  _High betweenness centrality (0.389) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._
- **Why does `goals()` connect `VYROX: contexto del proyecto` to `details.py`?**
  _High betweenness centrality (0.388) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._