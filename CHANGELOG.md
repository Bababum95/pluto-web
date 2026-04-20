# Pluto Web — Changelog

Frontend for the **Pluto** application built with React + TypeScript + Vite.

This document contains all notable changes to the project.
The format follows Conventional Commits. Versions are listed in reverse chronological order.

---

## Unreleased

### ♻️ Refactoring

- integrate AppearanceProvider and update component variants
- implement 'liquid' variant for Dialog and Drawer components
- enhance styling with 'liquid' theme integration

---

## 20.04.2026 — v0.1.24

### ♻️ Refactoring

- enhance Sheet component structure and styling
- update Header and Sheet components for improved styling and functionality
- enhance TabsTrigger and TransactionTypeTabs styling
- improve styling of Header, Sheet, and TransactionTypeTabs components
- update FullScreenLoader class name for improved responsiveness
- increase SWIPE_OFFSET in Tabs for enhanced swipe transitions

---

## 19.04.2026 — v0.1.23

### ✨ Features

- add transaction type label to Russian localization
- enhance CategoriesList and CategoryPicker with entrance animation control

### ♻️ Refactoring

- enhance Tabs and ToggleGroup components with context and animations
- update Tabs and formatBalance for improved functionality and styling
- update header positioning and layout adjustments in AppLayout

---

## 17.04.2026 — v0.1.22

### ✨ Features

- introduce Toggle and ToggleGroup components with stories and tests

### ♻️ Refactoring

- remove LanguageDrawer and LanguageSwitcher components

### 🧹 Chore

- refactor ToggleGroup tests for consistency and clarity
- enhance Header and TransactionTypeTabs components with improved styling

---

## 12.04.2026 — v0.1.21

### ✨ Features

- enhance header and profile components with new features and localization

---

## 10.04.2026 — v0.1.20

### ✨ Features

- enhance profile page with user details and localization support
- add excluded field to AccountForm and enhance MoneyInput component

### 🐛 Fixes

- update icon for transaction link in HomePage component

### 🧹 Chore

- add playwright e2e auth smoke coverage
- raise vitest coverage with core suite
- enhance middlewares integration tests to include transfer fetching

---

## 04.04.2026 — v0.1.19

### ✨ Features

- refactor time range management and UI components
- enhance formatBalance function with fallback for crypto currencies
- fetch transfers on app initialization

---

## 16.03.2026 — v0.1.18

### ✨ Features

- improve icon handling and transfer display
- enhance transfer functionality and UI

---

## 15.03.2026 — v0.1.17

### ✨ Features

- add 'createdAt' field to transaction details and improve UI layout
- enhance routing and UI components
- add integration tests for transaction and transfer functionalities
- add Codecov integration for coverage reporting
- enhance theme support in Storybook and add transaction update functionality

### 🐛 Fixes

- update Codecov badge link in README for accurate coverage reporting
- enhance button loading state handling

---

## 13.03.2026 — v0.1.16

### ✨ Features

- add loading stripes animation to button component and enhance MoneyField functionality

### ♻️ Refactoring

- simplify MoneyField component layout and improve button functionality

---

## 11.03.2026 — v0.1.15

### ✨ Features

- add new icons and update existing icon components for improved visuals
- enhance date-picker and time-range components for improved functionality
- enhance chart and icon components for improved visuals

### 🐛 Fixes

- adjust chart dimensions and balance formatting for improved display
- improve rate handling in RateField component

### ♻️ Refactoring

- reorganize imports and enhance TransferForm functionality

---

## 09.03.2026 — v0.1.14

### ✨ Features

- update transaction handling and types for improved account management

### 🐛 Fixes

- update item class for touch support in transactions page

### ♻️ Refactoring

- update account and transaction handling for consistency

---

## 09.03.2026 — v0.1.13

### ✨ Features

- enhance transaction editing with balance recalculation option
- add new icons to the registry

### ♻️ Refactoring

- update transaction amount format and date handling in tests

---

## 07.03.2026 — v0.1.12

### ✨ Features

- add transaction detail route and enhance transaction form

### ♻️ Refactoring

- update transaction localization and form validation messages

---

## 06.03.2026 — v0.1.11

### 🐛 Fixes

- update transaction creation logic and add order to mock category

### ♻️ Refactoring

- enhance drag-and-drop styling and update pointer activation delay
- update MoneyField component and adjust preset multipliers
- update API base URL in mock handlers and improve component styling

---

## 06.03.2026 — v0.1.10

### ✨ Features

- implement category reordering and enhance button styling
- implement dynamic theme color support based on user preference

---

## 05.03.2026 — v0.1.9

### ✨ Features

- enhance authentication integration tests with registration and logout flows
- integrate MSW for API mocking and enhance testing setup

### 🧹 Chore

- unit tests

---

## 05.03.2026 — v0.1.8

### ✨ Features

- add CloudIcon and SoftwareIcon to the icon registry
- add new icons to the icon registry

### ♻️ Refactoring

- update SVG icons for consistent styling and improved viewBox settings

---

## 01.03.2026 — v0.1.7

### ✨ Features

- add 'today' and 'yesterday' labels to DatePicker in Russian locale
- enhance MoneyField component with multiplier buttons and clear input functionality

### 🐛 Fixes

- Prevented page scroll reset when selecting a category while adding a new transaction in PWA mode

### 🧹 Chore

- update version and enhance DatePicker functionality

---

## 28.02.2026 — v0.1.6

### 🐛 Fixes

- update FullScreenLoader test and component layout

### 🧹 Chore

- update CHANGELOG for v0.1.5 release
- remove body background color and wrap App component
- update CSS and FullScreenLoader component

---

## 28.02.2026 — v0.1.5

### ✨ Features

- enhance TransferForm and DatePicker components

---

## 28.02.2026 — v0.1.4

### 🐛 Fixes

- update button border radius for improved aesthetics

### 🧹 Chore

- add CHANGELOG.md
- update dependencies and enhance date handling
- update UI component sizes and enhance documentation

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
