## Why

工单提交后处于"待处理"状态，需要调度者分派给处理人。当前缺少分派功能。

## What Changes

- 新增 PATCH /api/workorders/:id/assign 端点，接受 assignee 字段
- 新增调度者工作台，展示待分派/已分派区域
- 扩展列表接口支持 ?assignee= 筛选参数

## Capabilities

### New Capabilities
- `workorder-assign`: 调度者可分派工单给处理人

### Modified Capabilities
- `workorder-list-browse`: 列表接口新增 assignee 筛选参数

## Impact

- 后端：`PATCH /api/workorders/:id/assign` 路由
- 数据库：workorders 表新增 assignee 列
- 后端：`GET /api/workorders` 新增 ?assignee= 支持
- 前端：`DispatcherView.tsx`
