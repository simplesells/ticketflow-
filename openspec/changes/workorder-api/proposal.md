## Why

在 `backend-scaffold` 基础上，需要实现工单 CRUD API，支持增删改查四个基本操作。完成此步后能用 `curl` 完整 CRUD。

## What Changes

- 设计并创建 `workorders` 表 (SQLite schema)
- 初始化 SQLite 数据库连接（连接时自动建表）
- 实现4个 API 端点：
  - `GET /api/workorders` — 工单列表
  - `GET /api/workorders/:id` — 工单详情
  - `POST /api/workorders` — 创建新工单
  - `DELETE /api/workorders/:id` — 删除工单

## Capabilities

### New Capabilities
- `workorder-crud`: 工单增删改查 API 及数据库操作

### Modified Capabilities

## Impact

- 后端 `backend/src/db/` — SQLite 数据库连接和初始化
- 后端 `backend/src/routes/` — 工单路由和控制器
