# Scenic Guide Reservation Platform Admin

A desktop administration system for a scenic guide reservation platform. The current implementation manages administrators, roles, permissions, menus, and audit records through a unified dashboard.

## Implemented

- Administrator login and account management
- Role management
- Permission management
- Menu management
- Audit record queries
- Dashboard statistics

## Planned

The following capabilities are defined in the prototype requirements and are not claimed as implemented in the current version:

- Scenic site information
- Attraction content
- Audio resources
- Guide management
- Guide sessions
- Reservation management

## Tech stack

- Vue 3
- Vite 8
- TypeScript
- Pinia
- Vue Router
- Naive UI
- UnoCSS
- pnpm

## Development

```bash
pnpm install
pnpm dev
```

## Check and build

```bash
pnpm fmt
pnpm typecheck
pnpm lint
pnpm build
```

## Directory overview

- `src/views`: administration page entries
- `src/service/api`: API request definitions
- `src/store`: global state
- `src/locales`: Chinese and English text
