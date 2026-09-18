# AGENTS.md

Instructions for any AI agent (or human) working in the Explainer Maker codebase. See `README.md` for the product vision and architecture.

## Project shape

Monorepo, npm workspaces:

- `apps/web` — React + TypeScript UI, structured with **Feature-Sliced Design (FSD)**.
- `apps/api` — Node + Express API server.
- `apps/renderer` — `remotion/` and `hyperframes/` renderer adapters.
- `packages/` — shared, framework-agnostic code (`types`, `storyboard`, `components`, `providers`, `prompts`, `research`, `media`, `utils`).
- `workers/` — background job runners (`research-worker`, `tts-worker`, `render-worker`).
- `docs/` — architecture notes, research write-ups, renderer benchmarks.

## Feature-Sliced Design (`apps/web/src`)

Layers, top to bottom (each layer may only import from layers below it):

```
app        → global setup: providers, routing, global styles, entry point
pages      → route-level compositions
widgets    → large composite UI blocks made of features/entities
features   → user-facing actions (e.g. "approve research", "edit scene")
entities   → business objects (e.g. Storyboard, Scene, Source)
shared     → ui kit, generic libs, api client, config — no business logic
```

Rules:

- No upward or same-layer-sideways imports (a `feature` must not import another `feature`; compose them in a `widget` or `page` instead).
- Each slice (e.g. `features/approve-research`) owns its own internals and exposes a single public surface (an `index.ts`) — don't reach into another slice's internals.
- Business logic and types that are reused outside the web app (e.g. by `apps/api` or `workers/`) belong in `packages/`, not in `apps/web/src/entities`.

## Core architectural rules (from README)

1. **Own the intermediate format.** All content flows through **Storyboard JSON** (`packages/storyboard`). Nothing generates renderer-specific code directly.
2. **Providers are swappable.** LLM, research, TTS, and renderer integrations sit behind interfaces in `packages/providers/*`. New providers implement the interface; nothing else changes.
3. **Scenes are independently renderable.** Editing scene N must not require re-rendering scenes 1..N-1.
4. **Audio timing comes from real audio.** LLM output gives semantic scene placement only; final timing comes from TTS/alignment data, never from LLM guesses.
5. **Structured generation only.** AI outputs validated JSON against known schemas and known visual components — never freeform renderer code.
6. **Human approval stays in the loop** for the research step before content generation proceeds.

## AI/LLM development practices

- Never call a provider SDK (OpenAI, Anthropic, Gemini, ElevenLabs, etc.) directly from application code — go through the matching interface in `packages/providers/*`.
- All structured LLM output must be validated against a schema (e.g. zod) before it's trusted downstream; don't assume well-formed JSON.
- Prompts live in `packages/prompts`, versioned and reviewed like code — not inlined in feature code.
- Every scene/element the AI can produce or edit needs a stable, unique ID (see README "Scene & Element IDs") so element-level AI edits stay scoped and idempotent.
- Log LLM inputs/outputs for generation steps that affect final output (research, script, storyboard) to make regressions debuggable.
- Treat cost and latency as first-class: prefer the smallest capable model for a given step, and keep provider calls easy to swap/benchmark (see README "Renderer Benchmark" for the same principle applied to renderers).

## General conventions

- TypeScript everywhere; `strict` mode on.
- No cross-package circular dependencies.
- Keep `apps/api` route handlers thin — orchestration/business logic belongs in `packages/`.
- Don't add a new external provider/dependency without a corresponding interface in `packages/providers/*`.
