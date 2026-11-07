# 后台管理

## Tech Stack

- Vue 3
- Vite 8
- TypeScript
- Pinia
- Vue Router
- Naive UI
- UnoCSS
- pnpm

## Requirements

- Node.js 20.19 or later
- pnpm 10.5 or later

## Install and Run

```bash
pnpm install
pnpm dev
```

The default development command uses test mode.

## Build and Preview

```bash
pnpm dev:prod
pnpm build
pnpm build:test
pnpm preview
```

## Checks and Tests

```bash
pnpm typecheck
pnpm test
pnpm fmt
pnpm lint
```

## Other Commands

```bash
pnpm gen-route
pnpm cleanup
pnpm upkg
```

## Environment Variables

- `.env`: base environment variables
- `.env.test`: test-mode environment variables
- `.env.prod`: production-mode environment variables

Configure the backend service URL with `VITE_SERVICE_BASE_URL`.
