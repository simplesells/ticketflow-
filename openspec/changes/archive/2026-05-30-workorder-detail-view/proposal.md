## Why

用户从列表点击工单后，需要查看完整信息。当前缺少详情页。

## What Changes

- 新增 GET /api/workorders/:id 端点，返回工单完整信息
- 新增工单详情页面，展示标题、描述、类型、优先级、状态标签、处理人、状态历史

## Capabilities

### New Capabilities
- `workorder-detail-view`: 用户可查看单个工单的完整信息

### Modified Capabilities

## Impact

- 后端：`GET /api/workorders/:id` 路由（含 404 处理）
- 前端：`WorkOrderDetail.tsx` + `/:id` 路由
