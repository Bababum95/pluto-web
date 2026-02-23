# Pluto Web

[![CI](https://github.com/Bababum95/pluto-web/actions/workflows/ci.yml/badge.svg)](https://github.com/Bababum95/pluto-web/actions/workflows/ci.yml)

Frontend for the **Pluto** application: React + TypeScript + Vite with shadcn/ui-style components and a full-featured app stack.

## Tech stack

- **React 19** + **TypeScript** (strict mode)
- **Vite 7** — build tool and dev server
- **TanStack Router** — file-based routing with code splitting
- **TanStack React Query** — server state and caching
- **TanStack Form** — form state and validation
- **Redux Toolkit** — client state (accounts, transactions, categories, settings)
- **Tailwind CSS 4** — styling
- **Radix UI / Base UI / Shadcn UI** — accessible primitives (shadcn-style)
- **i18next** — internationalization
- **Zod** — validation (forms and API)
- **Motion** — animations
- **Vitest** — unit and integration tests
- **Storybook** — component development and documentation
- **PWA** — offline support via Vite PWA (Workbox)

## Prerequisites

- **Node.js** 18+
- **pnpm** 10.x (see `packageManager` in `package.json`)

## Setup

```bash
pnpm install
```

## Scripts

| Command                | Description                                                                      |
| ---------------------- | -------------------------------------------------------------------------------- |
| `pnpm dev`             | Start dev server (Vite)                                                          |
| `pnpm build`           | Type-check and production build                                                  |
| `pnpm preview`         | Serve production build locally                                                   |
| `pnpm lint`            | Run ESLint                                                                       |
| `pnpm test`            | Run tests (Vitest)                                                               |
| `pnpm test:watch`      | Run tests in watch mode                                                          |
| `pnpm test:coverage`   | Run tests with coverage report                                                   |
| `pnpm storybook`       | Start Storybook dev server (port 6006)                                           |
| `pnpm build-storybook` | Build Storybook for static export                                                |
| `pnpm generate:api`    | Generate API types from OpenAPI (API must be running at `http://localhost:3000`) |
| `pnpm icons:generate`  | Generate icon components from SVG registry                                       |
| `pnpm patch`           | Bump patch version                                                               |

## Project structure

- `src/routes/` — TanStack Router file-based routes
- `src/features/` — feature modules (account, home, category, tag, settings, theme, etc.)
- `src/components/` — shared UI components and Storybook stories
- `src/store/` — Redux slices and async thunks
- `src/lib/` — API client, i18n, icons, utilities
- `src/lib/api/types.ts` — generated OpenAPI types (run `generate:api` when API schema changes)
- `scripts/` — build scripts (e.g. icon component generation)

## Environment

The app expects the backend API to be available. Configure the API base URL as needed (e.g. via env or app config). The OpenAPI schema is fetched from `http://localhost:3000/api-docs-json` when running `pnpm generate:api`.

## Version

Current version is defined in `package.json` (`version`). Build injects `__APP_VERSION__` and `__BUILD_DATE__` (see `vite.config.ts`).
