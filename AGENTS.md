# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the application code. Key areas: `src/pages` for route-level views, `src/components` for reusable UI, `src/hooks` for custom hooks, `src/lib` for shared utilities, `src/types` for TypeScript types, and `src/movements` for domain-specific modules.
- `public/` contains static assets copied as-is into the build.
- `scripts/` contains Node/TSX scripts for data checks (e.g., transaction parsing and validation).
- `dist/` is the Vite build output (generated; do not edit).
- Path alias: import from `@/...` to reference `src` (configured in `vite.config.ts`).

## Build, Test, and Development Commands
- `npm run dev` (or `bun run dev`): start the Vite dev server on port 8080.
- `npm run build`: production build into `dist/`.
- `npm run build:dev`: development-mode build.
- `npm run preview`: serve the built app locally.
- `npm run lint`: run ESLint on the project.
- `npm run parse-transactions`: process raw transaction data via `scripts/parse-transactions.ts`.
- `npm run check-pending` / `npm run check-invalid-categories`: validate data quality; add `:list` to print details.

## Coding Style & Naming Conventions
- TypeScript + React + Vite. Use 2-space indentation and double quotes as seen in `src/`.
- Prefer functional components and hooks. Co-locate component-specific styles with the component.
- ESLint is configured in `eslint.config.js` (React Hooks rules enforced). Run `npm run lint` before PRs.
- Tailwind CSS is used; keep class lists readable and use `tailwind-merge` patterns where needed.

## Testing Guidelines
- No automated test runner is configured in this repository. Validate changes by running `npm run dev`, exercising relevant flows, and running `npm run lint`.
- If you introduce tests, document the new command(s) and conventions in this file.

## Commit & Pull Request Guidelines
- No commit message convention is discoverable (no Git history in this workspace). Use clear, imperative subjects (e.g., "Add category filters").
- PRs should include: a short summary, testing notes (commands run), and screenshots for UI changes. Link related issues when applicable.

## Configuration & Secrets
- Keep environment-specific values out of source. If you add env vars, document them in `README.md` and use `.env` files locally.
