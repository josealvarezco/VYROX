# Graph Report - VYROX  (2026-10-28)

## Corpus Check
- 31 files · ~11,689 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 312 nodes · 550 edges · 15 communities (13 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9609ed7b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_matches.py
- package.json
- compilerOptions
- MatchCenter.tsx
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
- test_predictions.py

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `get_details()` - 16 edges
3. `fixture()` - 16 edges
4. `compilerOptions` - 15 edges
5. `fetch_matches()` - 14 edges
6. `get()` - 13 edges
7. `MatchCenter()` - 13 edges
8. `post()` - 12 edges
9. `UpstreamError` - 9 edges
10. `install()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `fresh_cache()` --references--> `fixture()`  [EXTRACTED]
  backend/tests/test_matches.py → backend/tests/fake_api_football.py
- `fresh_cache()` --references--> `fixture()`  [EXTRACTED]
  backend/tests/test_predictions.py → backend/tests/fake_api_football.py
- `get_details()` --uses--> `UpstreamError`  [INFERRED]
  backend/app/details.py → backend/app/api_football.py
- `match_details()` --uses--> `UpstreamError`  [INFERRED]
  backend/app/main.py → backend/app/api_football.py
- `matches()` --uses--> `UpstreamError`  [INFERRED]
  backend/app/main.py → backend/app/api_football.py

## Import Cycles
- None detected.

## Communities (15 total, 2 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.13
Nodes (11): expire_cache(), fetch(), fresh_cache(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_finished_past_day_is_never_requested_again(), test_future_day_is_not_treated_as_final(), test_past_day_refreshes_after_ttl_until_it_is_final(), test_quota_error_serves_stale_cache_and_waits_a_ttl_to_retry() (+3 more)

### Community 1 - "package.json"
Cohesion: 0.08
Nodes (32): dependencies, react@^19.3.1, react-dom@^19.3.1, devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2 (+24 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 3 - "MatchCenter.tsx"
Cohesion: 0.08
Nodes (45): AiPrediction(), PredictionCards(), PredictionView(), App(), FIRST_DAY, LAST_DAY, MatchRow(), TODAY (+37 more)

### Community 4 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 5 - "VYROX: contexto del proyecto"
Cohesion: 0.15
Nodes (11): Etapa actual, Fuera de alcance, Hitos, Idioma, Qué es, Reglas de arquitectura, Stack, VYROX: contexto del proyecto (+3 more)

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
Cohesion: 0.06
Nodes (37): api_get(), colombia_today(), fetch_matches(), _fresh(), group_by_competition(), _team(), to_match(), UpstreamError (+29 more)

### Community 11 - "test_details.py"
Cohesion: 0.15
Nodes (16): fixture(), meeting(), team(), api(), expire(), get(), test_finished_match_is_cached_for_six_hours(), test_h2h_failure_keeps_the_rest_of_the_match_center() (+8 more)

### Community 14 - "test_predictions.py"
Cohesion: 0.15
Nodes (17): install(), fresh_cache(), gemini_body(), post(), sent_prompt(), test_gemini_failure_returns_fallback_and_is_not_cached(), test_overloaded_flash_falls_back_to_flash_lite(), test_prediction_without_match_data_still_works() (+9 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `MatchCenter.tsx` to `package.json`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.13043478260869565 - nodes in this community are weakly interconnected._
- **Why does `fixture()` connect `test_details.py` to `test_matches.py`, `test_predictions.py`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08021390374331551 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `MatchCenter.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08245981830887492 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._