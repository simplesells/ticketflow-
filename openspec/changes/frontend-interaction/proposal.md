## Why

工单系统需要完整的用户操作闭环——能创建工单、查看详情、变更状态。完成此步后浏览器能完成从创建到关闭的完整流程。

## What Changes

- 工单创建表单页面 — 填标题、描述、类型、优先级并提交
- 工单详情页面 — 显示完整信息及状态历史记录
- 工单状态变更操作 — 按钮触发状态更新
- 工单删除操作 — 确认后发送删除请求

## Capabilities

### New Capabilities
- `workorder-interaction`: 创建、详情、状态变更、删除的前端操作

### Modified Capabilities

## Impact

- 前端新增创建表单组件、详情页面组件、状态变更按钮
