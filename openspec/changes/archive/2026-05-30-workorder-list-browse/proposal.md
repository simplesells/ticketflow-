## Why

用户创建工单后，需要一个页面浏览所有工单并按状态快速筛选。目前缺少统一的列表视图。

## What Changes

- 新增 GET /api/workorders 端点，支持 ?status= 查询参数
- 新增工单列表页面，表格展示工单号、标题、类型、优先级、状态、创建时间
- 新增状态 Tab 筛选栏（全部/待处理/处理中/已解决/已关闭）

## Capabilities

### New Capabilities
- `workorder-list-browse`: 用户可浏览并筛选工单列表

### Modified Capabilities

## Impact

- 后端：`GET /api/workorders` 路由（含 status 筛选）
- 前端：`WorkOrderList.tsx` + `/` 路由
