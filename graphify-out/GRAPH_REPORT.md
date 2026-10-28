# Graph Report - VYROX  (2026-10-27)

## Corpus Check
- 23 files · ~5,698 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 201 nodes · 258 edges · 15 communities (13 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `27dcd651`
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
- gemini.py
- scripts
- tsconfig.json
- triage-labels.md
- test_predictions.py

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 15 edges
3. `fetch_matches()` - 11 edges
4. `post()` - 9 edges
5. `VYROX: contexto del proyecto` - 8 edges
6. `UpstreamError` - 6 edges
7. `predict()` - 6 edges
8. `Issue tracker: GitHub` - 6 edges
9. `MatchInfo` - 5 edges
10. `matches()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `matches()` --uses--> `UpstreamError`  [INFERRED]
  backend/app/main.py → backend/app/api_football.py
- `test_quota_error_serves_stale_cache_and_waits_a_ttl_to_retry()` --calls--> `fetch_matches()`  [EXTRACTED]
  backend/tests/test_matches.py → backend/app/api_football.py
- `test_repeated_requests_within_ttl_hit_upstream_once()` --calls--> `fetch_matches()`  [EXTRACTED]
  backend/tests/test_matches.py → backend/app/api_football.py
- `predictions()` --uses--> `MatchInfo`  [INFERRED]
  backend/app/main.py → backend/app/gemini.py
- `predictions()` --references--> `post()`  [EXTRACTED]
  backend/app/main.py → backend/tests/test_predictions.py

## Import Cycles
- None detected.

## Communities (15 total, 2 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.09
Nodes (11): fetch_matches(), group_by_competition(), _team(), to_match(), UpstreamError, matches(), fresh_cache(), test_quota_error_serves_stale_cache_and_waits_a_ttl_to_retry() (+3 more)

### Community 1 - "package.json"
Cohesion: 0.12
Nodes (23): devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@~7.0.2 (+15 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 3 - "App.tsx"
Cohesion: 0.14
Nodes (16): dependencies, react@^19.3.1, react-dom@^19.3.1, App(), Competition, LIVE, Match, MatchesResponse (+8 more)

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

### Community 10 - "gemini.py"
Cohesion: 0.14
Nodes (7): _generate(), MatchInfo, predict(), Prediction, Probabilities, Score, predictions()

### Community 11 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 14 - "test_predictions.py"
Cohesion: 0.18
Nodes (12): fresh_cache(), gemini_body(), post(), test_gemini_failure_returns_fallback_and_is_not_cached(), test_overloaded_flash_falls_back_to_flash_lite(), test_probabilities_are_rescaled_to_sum_100(), test_rejects_oversized_fields(), test_returns_gemini_prediction() (+4 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `package.json`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08522727272727272 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11666666666666667 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14035087719298245 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `gemini.py` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._