## Context

Change A 完成后，前端有四处实现与 spec 不一致：
- `/` 路由无登录保护（`user-auth` spec: 未登录 SHALL 跳转 `/login`）
- 创建表单仍显示提交人输入框（`workorder-create` spec: 不显示提交人输入框）
- 工单详情页操作区对所有角色可见（`role-guard` spec: 仅对应角色可操作）
- B1 用户重命名后，前端 RESOLVERS 硬编码过时

## Goals / Non-Goals

**Goals:**
- `/` 路由受 ProtectedRoute 保护，支持三种角色
- 创建工单表单不包含提交人输入字段
- 工单详情页仅向提交者显示编辑按钮和操作区
- DispatcherView / ResolverView 的 RESOLVERS 与 B1 用户模型一致

**Non-Goals:**
- 不将 RESOLVERS 改为 API 动态获取（那是 B3 的范围）
- 不改后端任何代码
- 不改现有 spec（当前行为是修复到 spec 已有要求）

## Decisions

| # | 决定 | 理由 |
|---|------|------|
| 1 | `/` 路由用已有 `ProtectedRoute` 包裹，allRoles 三种角色全放行 | 复用现有组件，不改 HomePage 内部逻辑 |
| 2 | WorkOrderDetail 通过 `useAuth()` 获取当前用户 `role`，仅 `submitter` 看到操作区 | 最小改动，与后端 `requireRole` 形成前后双重守卫 |
| 3 | RESOLVERS 手动同步为 `['孙强', '李刚', '周伟']` | 临时方案，B3 会改为 API 动态获取 |

## Risks / Trade-offs

- [无] 所有改动都是 1-7 行的前端条件判断，无破坏性
