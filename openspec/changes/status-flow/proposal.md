## Why

工单系统需要状态流转控制——只允许合法跳转，拒绝非法操作，并记录每次状态变化。完成此步后能用 `curl` 验证流转规则和非法拦截。

## What Changes

- 工单状态变更规则（待处理 → 处理中 → 已解决 → 已关闭）
- `PATCH /api/workorders/:id/status` — 变更状态，校验合法性
- 工单状态变更记录表 `status_history`
- 查询工单时返回状态历史记录

## Capabilities

### New Capabilities
- `status-flow`: 状态流转规则校验及历史记录

### Modified Capabilities

## Impact

- 后端新增状态机校验逻辑
- 数据库新增 `status_history` 表
