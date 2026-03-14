# Repository Guidelines

## Project Structure & Module Organization

Lifeplan Simulator is a Vite + React + TypeScript app. Application code sits in `src/`; UI is split into `components/` (charts, forms, results, ai), reusable hooks in `hooks/`, simulation math and formatters in `services/` and `utils/`, and shared shapes in `types/`. Store fixtures or browser-mocking helpers in `src/tests/` and heavier test doubles inside the top-level `__mocks__/`. Static assets belong to `public/`, while production bundles land in `dist/`. Update datasets such as `historicalData.ts` whenever market ranges change so calculations stay in sync.

## Build, Test, and Development Commands

Use `npm install` once per clone. `npm run dev` starts the Vite dev server at http://localhost:5173. `npm run build` runs TypeScript project references then creates the production bundle. `npm run preview` serves that bundle, which is the fastest way to vet Tailwind styles and charts before shipping. `npm run lint` executes the shared ESLint profile, and `npm run test` runs Vitest in jsdom (append `--watch` or `--coverage` as needed).

## Coding Style & Naming Conventions

Stick to 2-space indentation, semicolons, and single quotes for strings/imports. Components and files are `PascalCase`, hooks follow the `useCamelCase` prefix, and helper utilities use `camelCase`. Favor functional React components with explicit prop interfaces, React Hooks for state, and Tailwind utility classes for styling. Run ESLint before committing; it enforces TypeScript recommendations plus the React Hooks rules configured in `eslint.config.js`.

## Testing Guidelines

Vitest with Testing Library powers all automated tests. Preferred naming is `*.test.tsx` (UI) or `*.test.ts` (logic) placed near the feature folder or in `src/tests/`. When adjusting core simulations, cover both Monte Carlo and historical flows and include representative parameters so regressions surface quickly. Generate coverage locally with `npm run test -- --coverage`; the `coverage/` directory is already gitignored.

## Commit & Pull Request Guidelines

Recent history favors short imperative messages such as `update historical 2025` or `fix/text`; follow that voice and reference issues/PRs when applicable. Each PR should summarize scope, list the commands you ran, and attach screenshots or GIFs whenever charts, tables, or copy change. Keep branches focused on one fix or feature so reviewers can trace the simulation impact easily.

## Configuration Tips

Never commit personal financial inputs; rely on anonymized defaults or sample fixtures. If you introduce environment switches, wire them through Vite’s `import.meta.env` and document expected values in `README.md` so saved preset behavior remains predictable.

## Reference Documentation

Before proposing architecture or implementation changes, review the canonical references under `docs/`:

- `docs/feature-overview.md` — 機能概要とシミュレーション手法
- `docs/specification.md` — 入力項目、運用ルール、表示仕様
- `docs/architecture.md` — 技術スタック、モジュール分割、データフロー
Keep these files updated alongside code; AI agents are expected to consult and synchronize them when designing or modifying features.
