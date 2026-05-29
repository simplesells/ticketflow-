## Context

基于 `backend-scaffold` 的成功搭建，现在需要实现工单 CRUD API。使用 SQLite 存储工单数据，通过 `better-sqlite3` 作为同步数据库驱动。

## Goals / Non-Goals

**Goals:**
- 创建 `workorders` 表，字段完整
- 实现 GET（列表+详情）、POST（创建）、DELETE（删除）四个端点
- 每个端点返回正确的 HTTP 状态码和 JSON 响应
- 工单号自动生成（WO-YYYYMMDD-NNNN 格式）

**Non-Goals:**
- 状态流转校验（留给 status-flow）
- 分页、搜索、排序（Demo 阶段不需要）
- 用户认证（MVP 阶段实现）
- 更新、编辑功能（留给之后的变更）

## Decisions

| # | Decision | Rationale | Alternatives Considered |
|---|---------|----------|-------------------------|
| 1 | better-sqlite3 同步 API | 代码简洁，无需 async/await 嵌套 | sqlite3 异步 API，Prisma |
| 2 | 数据库文件放在 `backend/data.db` | 与源码分离，不纳入 git | 内存数据库（重启丢失数据） |
| 3 | API 前缀 `/api/workorders` | RESTful 命名，统一前缀便于区分前后端路由 | 直接 `/workorders` |

## Risks / Trade-offs

- [Risk] SQLite 在高并发下写入性能有限 → Demo 阶段无并发问题
- [Trade-off] 不做数据校验（如标题长度限制）→ Demo 阶段容错，MVP 再加
