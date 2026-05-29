## Context

基于 `workorder-api` 已有的 CRUD 功能，需要增加状态流转控制。工单不能随意切换状态，必须遵循预定义的流转规则。

## Goals / Non-Goals

**Goals:**
- 实现 4 状态流转模型（待处理 → 处理中 → 已解决 → 已关闭）
- 非法状态跳转返回 400 错误
- 每次状态变更记录到 history 字段

**Non-Goals:**
- 审批流程（MVP 阶段实现）
- 自定义状态流（MVP 阶段实现）
- 处理人指派（留给后续变更）

## Decisions

| # | Decision | Rationale | Alternatives Considered |
|---|---------|----------|-------------------------|
| 1 | 状态流转用 JS Map 定义合法跳转 | 简单、一目了然 | 数据库状态机表（过重） |
| 2 | 新增 `PATCH /api/workorders/:id/status` 端点 | 与 PUT 区分，语义清晰 | PUT 更新全部字段 |
| 3 | history 存 JSON 数组在 workorders 表 | 简单，不需要额外表 | 独立 status_history 表 |

## Risks / Trade-offs

- [Risk] history 字段随变更持续增长 → Demo 阶段记录数少，可忽略
- [Trade-off] 不支持回退状态 → 根据业务需求，暂不支持
