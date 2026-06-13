## Context

Change A 引入用户登录后，`req.user.displayName` 在中间件 `requireRole` 中已自动注入。但 workorders.ts 中所有历史记录的 operator 字段仍写死为 `'system'`（Line 109, 159），创建工单时不写初始 history。同时 seed 数据中的 assignee 值与 user model 不一致。

## Goals / Non-Goals

**Goals:**
- 创建工单时写入初始 history 记录，operator 为提交者姓名
- 状态变更时 history operator 记录实际操作人姓名
- 分派操作时 history operator 记录调度者姓名
- 用户模型与 seed 数据对齐（张工可登录）

**Non-Goals:**
- 不改变 history 的数据结构（仍为 JSON 数组，字段不变）
- 不改变流转规则
- 不新增数据库字段

## Decisions

| # | 决定 | 理由 | 备选方案 |
|---|------|------|----------|
| 1 | operator 使用 `req.user.displayName`（中文名），而非 `req.user.username`（英文 ID） | 历史记录是给人看的，中文名更可读 | username → 可读性差 |
| 2 | 创建工单时写入初始 history `{status:'待处理', operator:'<name>', time:...}` | 每条工单至少有"谁创建的"历史，完整性一致 | 不写 → 历史少了第一条 |
| 3 | 张工作为第 6 个用户插入 user model（id=6, role=resolver） | 与现有 id 不冲突，无需改其他用户 | 新建独立 users 表 → 过度 |
| 4 | 不改 seed 中已存在的 assignee 值，只确保 user model 覆盖所有 seed 中引用的名字 | seed 中用了张工、李工、王工——李工和王工已在 user model 中，只缺张工 | 改 seed → 破坏现有 Demo 数据 |

## Risks / Trade-offs

- [风险] 如果有人伪造 x-user-id header 以不存在的用户 ID 请求，`req.user` 为 undefined，operator 可能为空 → 中间件 requireRole 已在路由前校验用户存在，此场景不会到达 handler
- [风险] 老工单的 history 中 operator 仍为 'system' → 可接受，不回溯修改历史数据
