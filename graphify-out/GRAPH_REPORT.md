# Graph Report - VYROX  (2026-10-28)

## Corpus Check
- 36 files · ~13,975 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 339 nodes · 637 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a1f1ad99`
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
- App.tsx
- gemini.py

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `get_details()` - 16 edges
3. `fixture()` - 16 edges
4. `compilerOptions` - 15 edges
5. `fetch_matches()` - 14 edges
6. `MatchCenter()` - 14 edges
7. `get()` - 13 edges
8. `App()` - 13 edges
9. `post()` - 12 edges
10. `UpstreamError` - 9 edges

## Surprising Connections (you probably didn't know these)
- `fresh_cache()` --references--> `fixture()`  [EXTRACTED]
  backend/tests/test_matches.py → backend/tests/fake_api_football.py
- `get_details()` --uses--> `UpstreamError`  [INFERRED]
  backend/app/details.py → backend/app/api_football.py
- `match_details()` --uses--> `UpstreamError`  [INFERRED]
  backend/app/main.py → backend/app/api_football.py
- `matches()` --uses--> `UpstreamError`  [INFERRED]
  backend/app/main.py → backend/app/api_football.py
- `fetch()` --calls--> `fetch_matches()`  [EXTRACTED]
  backend/tests/test_matches.py → backend/app/api_football.py

## Import Cycles
- None detected.

## Communities (16 total, 2 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.13
Nodes (13): expire_cache(), fetch(), fresh_cache(), league_fixture(), test_dates_outside_the_free_plan_return_400_without_spending_quota(), test_finished_past_day_is_never_requested_again(), test_future_day_is_not_treated_as_final(), test_past_day_refreshes_after_ttl_until_it_is_final() (+5 more)

### Community 1 - "package.json"
Cohesion: 0.08
Nodes (32): dependencies, react@^19.3.1, react-dom@^19.3.1, devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2 (+24 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 3 - "MatchCenter.tsx"
Cohesion: 0.10
Nodes (34): PredictionCards(), PredictionView(), EventText(), HeadToHead(), Icon(), Lineups(), Marks(), MatchCenter() (+26 more)

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
Cohesion: 0.08
Nodes (30): api_get(), colombia_today(), fetch_matches(), _fresh(), group_by_league(), _league_order(), _team(), to_match() (+22 more)

### Community 11 - "test_details.py"
Cohesion: 0.08
Nodes (33): fixture(), install(), meeting(), team(), api(), expire(), get(), test_finished_match_is_cached_for_six_hours() (+25 more)

### Community 14 - "App.tsx"
Cohesion: 0.14
Nodes (30): App(), DAYS, FILTERS, Message(), shiftDay(), TODAY, Chevron(), FilterIcon() (+22 more)

### Community 15 - "gemini.py"
Cohesion: 0.14
Nodes (8): _context(), _generate(), MatchInfo, predict(), Prediction, Probabilities, Score, predictions()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `package.json`, `MatchCenter.tsx`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.12681159420289856 - nodes in this community are weakly interconnected._
- **Why does `fixture()` connect `test_details.py` to `test_matches.py`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08021390374331551 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `MatchCenter.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10384068278805121 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._