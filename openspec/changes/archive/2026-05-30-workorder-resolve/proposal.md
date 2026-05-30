## Why

处理人被分派工单后，需要推进状态直至关闭。当前缺少状态流转功能。

## What Changes

- 新增 PATCH /api/workorders/:id/status 端点
- 实现 4 状态流转：待处理→处理中→已解决→已关闭
- 非法跳转被拒绝（如待处理→已关闭）
- 状态变更记录到 history
- 新增完成者工作台，按处理人筛选工单

## Capabilities

### New Capabilities
- `workorder-resolve`: 处理人查看自己的工单并推进状态

### Modified Capabilities

## Impact

- 后端：`PATCH /api/workorders/:id/status` 路由 + TRANSITIONS 规则
- 前端：`ResolverView.tsx`
