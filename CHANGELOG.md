# Pluto Web — Changelog

Frontend for the **Pluto** application built with React + TypeScript + Vite.

This document contains all notable changes to the project.
The format follows Conventional Commits. Versions are listed in reverse chronological order.

---

## 25.02.2026 — v0.1.3

### ✨ Features

- unify form element sizing grid (sm=h-8, default=h-9, lg=h-10)
- enhance button and layout styles for improved usability

### 🐛 Fixes

- adjust form element sizes and improve layout consistency
- update button border radius for improved aesthetics

### ♻️ Refactoring

- rename FullScreenLoader and remove unused components

### 📚 Documentation

- add AGENTS.md for repository agents
- update README (Storybook link and badge)

---

## 24.02.2026 — v0.1.2

### ✨ Features

- restructure UI components into folder-based architecture
- add Storybook stories for all UI components
- add comprehensive tests for all UI components
- disable i18next no-literal-string rule for test files
- add transfer domain, store slice, pages, routes, and i18n
- redesign TransferForm with From/To cards, rate and fee fields
- enhance ExchangeRateList component and update API types

### 🐛 Fixes

- standardize route paths and improve navigation

### ♻️ Refactoring

- streamline TransferForm layout and code
- remove unused DrawerDescription and enhance accessibility

### 📚 Documentation

- update README with new features and scripts

---

## 23.02.2026 — v0.1.1

### ✨ Features

- add Storybook, CI tests, and coverage
- disable i18next no-literal-string rule for Storybook stories

### 🐛 Fixes

- add aria-describedby to SheetContent for improved accessibility

---

## 23.02.2026 — v0.1.0

### ✨ Features

- add exchange rates page (Redux slice, API, i18n, route)
- add Vitest with locale comparison tests
- add eslint-plugin-i18next with no-literal-string rule
- integrate i18n across UI components
- add exchange rates translation keys (EN/RU)

### ♻️ Refactoring

- update ExchangeRate type to use API schema
- enhance formatRate implementation

### 🧹 Chore

- bump version to 0.1.0 in package.json

---

## 23.02.2026 — v0.0.26

### ✨ Features

- add HomeIcon to icon registry and update categories
- implement Dialog component and related subcomponents
- integrate TagPicker into transaction form

### 🐛 Fixes

- make time range bounds timezone-aware
- update SVG attributes to camelCase in HeartCardiogramIcon
- fix padding inconsistencies in DrawerContent components

### ♻️ Refactoring

- optimize CategoryPicker visible categories logic

### 🧹 Chore

- update pnpm to v10 in CI
- update Node.js to v24 in CI
- disable automatic pnpm install in CI

---

## 20.02.2026 — v0.0.25

### ✨ Features

- integrate AccountDrawer and update SelectAccount logic

---

## 20.02.2026 — v0.0.24

### ✨ Features

- enhance Header and Button components
- refactor SettingsPage with new Item components and drawers

### 🐛 Fixes

- add delay to FullScreenLoader animation

### 📚 Documentation

- update README with project details

---

## 20.02.2026 — v0.0.23

### ✨ Features

- add new icons (HeartCardiogramIcon, Yen)
- add account reorder functionality (dnd-kit)
- enhance account balance structure (original + converted)

### 🐛 Fixes

- improve dropdown width and account loading UI
- fix icon rendering issues
- set minimumFractionDigits to 0 in formatBalance

### ♻️ Refactoring

- streamline transaction slice and balance calculation logic

---

## 18–19.02.2026 — v0.0.17 → v0.0.22

### ✨ Features

- add account visibility toggle
- improve button and TimeRangeSwitcher active states
- add description field to account
- add new icons and registry updates

### 🐛 Fixes

- adjust layout spacing and z-index issues
- improve loading and animation behavior

### ♻️ Refactoring

- improve transaction fetching with time bounds
- simplify chart components and remove unused icons

---

## 14–16.02.2026 — v0.0.10 → v0.0.16

### ✨ Features

- enhance ChartPieDonutText with loading state
- integrate transactionTypeListener middleware
- improve transaction form (MoneyInput, validation, category selection)

### ♻️ Refactoring

- simplify chart and layout logic
- improve API filtering and balance formatting

---

## 10–13.02.2026 — v0.0.1 → v0.0.9

### ✨ Features

- implement routing with TanStack Router
- integrate Redux for state management
- add authentication (login, registration, logout)
- add category and account CRUD functionality
- integrate i18next for localization
- implement view transitions and layout improvements
- add SelectCurrency and enhanced form components

### ♻️ Refactoring

- improve API types and authentication context
- refactor layout and animation logic
- enhance type safety across forms and store

### 🧹 Chore

- add ESLint, Prettier, CI, image optimization tools
- update PWA and Vite configuration

---

## 06.01.2026 — v0.0.0

- Initial commit
