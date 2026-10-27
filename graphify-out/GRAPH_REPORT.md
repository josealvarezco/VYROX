# Graph Report - VYROX  (2026-10-27)

## Corpus Check
- 21 files · ~4,378 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 165 nodes · 192 edges · 14 communities (11 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ad8af93a`
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
- upstream
- scripts
- tsconfig.json
- triage-labels.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 15 edges
3. `fetch_matches()` - 11 edges
4. `VYROX: contexto del proyecto` - 8 edges
5. `UpstreamError` - 6 edges
6. `Issue tracker: GitHub` - 6 edges
7. `matches()` - 5 edges
8. `scripts` - 5 edges
9. `Domain Docs` - 5 edges
10. `to_match()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `matches()` --uses--> `UpstreamError`  [INFERRED]
  backend/app/main.py → backend/app/api_football.py
- `test_quota_error_serves_stale_cache_and_waits_a_ttl_to_retry()` --calls--> `fetch_matches()`  [EXTRACTED]
  backend/tests/test_matches.py → backend/app/api_football.py
- `test_repeated_requests_within_ttl_hit_upstream_once()` --calls--> `fetch_matches()`  [EXTRACTED]
  backend/tests/test_matches.py → backend/app/api_football.py
- `matches()` --calls--> `fetch_matches()`  [EXTRACTED]
  backend/app/main.py → backend/app/api_football.py
- `matches()` --calls--> `group_by_competition()`  [EXTRACTED]
  backend/app/main.py → backend/app/api_football.py

## Import Cycles
- None detected.

## Communities (14 total, 3 thin omitted)

### Community 0 - "test_matches.py"
Cohesion: 0.10
Nodes (9): fetch_matches(), group_by_competition(), _team(), to_match(), UpstreamError, matches(), test_quota_error_serves_stale_cache_and_waits_a_ttl_to_retry(), test_repeated_requests_within_ttl_hit_upstream_once() (+1 more)

### Community 1 - "package.json"
Cohesion: 0.12
Nodes (23): devDependencies, oxlint@^1.89.0, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, @types/node@^24.19.2, @types/react@^19.3.0, @types/react-dom@^19.3.0, typescript@~7.0.2 (+15 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 3 - "App.tsx"
Cohesion: 0.15
Nodes (14): dependencies, react@^19.3.1, react-dom@^19.3.1, App(), Competition, LIVE, Match, MatchesResponse (+6 more)

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

### Community 11 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `package.json`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `test_matches.py` be split into smaller, more focused modules?**
  _Cohesion score 0.10080645161290322 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11666666666666667 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._