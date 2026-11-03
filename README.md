# 景区导游预约平台后台管理系统

景区导游预约平台的 PC 管理后台，当前用于维护后台账号、角色、权限、菜单和审计记录，并提供统一工作台入口。

## 当前已实现

- 管理员登录与管理员账号管理
- 角色管理
- 权限管理
- 菜单管理
- 审计记录查询
- 工作台统计

## 后续规划

以下能力属于原型需求规划，当前版本不宣称已经实现：

- 景区资料
- 景点内容
- 音频资源
- 导游管理
- 讲解场次
- 预约管理

## 技术栈

- Vue 3
- Vite 8
- TypeScript
- Pinia
- Vue Router
- Naive UI
- UnoCSS
- pnpm

## 开发命令

```bash
pnpm install
pnpm dev
```

## 检查与构建

```bash
pnpm fmt
pnpm typecheck
pnpm lint
pnpm build
```

## 目录说明

- `src/views`：后台页面入口
- `src/service/api`：接口请求定义
- `src/store`：全局状态
- `src/locales`：中英文文案
