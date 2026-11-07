# 后台管理

## 技术栈

- Vue 3
- Vite 8
- TypeScript
- Pinia
- Vue Router
- Naive UI
- UnoCSS
- pnpm

## 环境要求

- Node.js 20.19 或更高版本
- pnpm 10.5 或更高版本

## 安装依赖

```bash
pnpm install
```

## 启动开发环境

```bash
pnpm dev
```

默认使用 test 模式启动开发服务。

## 启动生产模式开发服务

```bash
pnpm dev:prod
```

## 构建与预览

```bash
pnpm build
pnpm build:test
pnpm preview
```

## 检查与测试

```bash
pnpm typecheck
pnpm test
pnpm fmt
pnpm lint
```

## 其他命令

```bash
pnpm gen-route
pnpm cleanup
pnpm upkg
```

## 环境变量

- `.env`：基础环境变量
- `.env.test`：test 模式环境变量
- `.env.prod`：prod 模式环境变量

后端服务地址通过 `VITE_SERVICE_BASE_URL` 配置。
