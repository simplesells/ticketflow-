## Context

B1/B2 修完数据和安全的硬伤后，系统代码正确可用。但前端有临时代码（硬编码名单、直接写 URL），两份 spec 与代码实际行为不一致。这些都是 Demo → MVP 最后一公里的打磨工作。

## Goals / Non-Goals

**Goals:**
- 完成者列表从前端硬编码改为从 `GET /api/auth?role=resolver` 动态获取
- 三视图各加退出登录按钮
- LoginPage 的 HTTP 调用走 `api.ts` 封装
- `role-guard` spec 状态变更权限声明与代码对齐
- `workorder-resolve` spec 完整重写（权限 + 流转规则）
- `config.yaml` 端口号修正

**Non-Goals:**
- 不做全局 Layout 组件（三视图已有各自结构，抽象为时过早）
- 不改流转规则本身（与 `demo-flow-complete` 对齐即可）
- 不新增后端代码

## Decisions

| # | 决定 | 理由 |
|---|------|------|
| 1 | `fetchResolvers` 返回 `{id, displayName}` 数组，不做缓存 | 数据量小（<10），每次挂载取最新即可 |
| 2 | ResolverView 初始值用 functional setState 避免闭包陷阱 | `setResolver(prev => prev \|\| data[0]?.displayName \|\| '')` |
| 3 | 登出按钮不抽 Layout 组件，三视图各加一个按钮 | 三个页面结构不同，抽象一次需要改三个调用点，收益为零 |
| 4 | `loginUser` 函数放在 `api.ts`，`LoginResponse` 接口移入 api.ts | 与现有 API 封装风格一致 |
| 5 | `workorder-resolve` spec 重写时，流转规则照抄 `demo-flow-complete` spec（已正确的版本） | 避免重新设计，且确保两份 spec 一致 |
| 6 | `role-guard` status 端点要求改为三种角色，用 MODIFIED 而非 REMOVED+ADDED | requirement 名称不变，只是 role 列表和 scenario 变化 |

## Risks / Trade-offs

- [风险] `fetchResolvers` 失败 → `useEffect` 中 catch 后不更新 resolvers，列表为空但不崩溃。用户刷新页面即可重试
- [无] 登出按钮、LoginPage 封装、spec 修正 → 均为零风险改动
