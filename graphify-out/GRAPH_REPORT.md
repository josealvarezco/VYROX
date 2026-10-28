# Graph Report - VYROX  (2026-10-28)

## Corpus Check
- 23 files · ~6,784 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 221 nodes · 301 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2d56c62d`
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
- api_football.py
- tsconfig.json
- triage-labels.md
- test_predictions.py

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 15 edges
3. `fetch_matches()` - 13 edges
4. `post()` - 9 edges
5. `VYROX: contexto del proyecto` - 8 edges
6. `matches()` - 7 edges
7. `fetch()` - 7 edges
8. `UpstreamError` - 6 edges
9. `predict()` - 6 edges
10. `Issue tracker: GitHub` - 6 edges

## Surprising Connections (you probably didn't know these)
- `matches()` --uses--> `UpstreamError`  [INFERRED]
  backend/app/main.py → backend/app/api_football.py
- `fetch()` --calls--> `fetch_matches()`  [EXTRACTED]
  backend/tests/test_matches.py → backend/app/api_football.py
- `predictions()` --uses--> `MatchInfo`  [INFERRED]
  backend/app/main.py → backend/app/gemini.py
- `predictions()` --references--> `post()`  [EXTRACTED]
  backend/app/main.py → backend/tests/test_predictions.py
- `matches()` --calls--> `colombia_today()`  [EXTRACTED]
  backend/app/main.py → backend/app/api_football.py

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.15
Nodes (11): expire_cache(), fetch(), fresh_cache(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_finished_past_day_is_never_requested_again(), test_future_day_is_not_treated_as_final(), test_past_day_refreshes_after_ttl_until_it_is_final(), test_quota_error_serves_stale_cache_and_waits_a_ttl_to_retry() (+3 more)

### Community 1 - "package.json"
Cohesion: 0.09
Nodes (28): devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@~7.0.2 (+20 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 3 - "App.tsx"
Cohesion: 0.11
Nodes (23): dependencies, react@^19.3.1, react-dom@^19.3.1, AiPrediction(), App(), Competition, FIRST_DAY, Goals (+15 more)

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

### Community 10 - "api_football.py"
Cohesion: 0.09
Nodes (15): colombia_today(), fetch_matches(), _fresh(), group_by_competition(), _team(), to_match(), UpstreamError, _generate() (+7 more)

### Community 14 - "test_predictions.py"
Cohesion: 0.15
Nodes (12): fresh_cache(), gemini_body(), post(), test_gemini_failure_returns_fallback_and_is_not_cached(), test_overloaded_flash_falls_back_to_flash_lite(), test_probabilities_are_rescaled_to_sum_100(), test_rejects_oversized_fields(), test_returns_gemini_prediction() (+4 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `package.json`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09195402298850575 - nodes in this community are weakly interconnected._
- **Why does `fetch_matches()` connect `api_football.py` to `test_matches.py`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10541310541310542 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `api_football.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08710801393728224 - nodes in this community are weakly interconnected._