## Why

当前流转只有简单的线性路径，缺少退回、拒绝、撤回、重开等异常流程。Demo 阶段需补全完整的工单生命周期。

## What Changes

- 8 状态完整流转（新增退回待分派/退回待提交/退回处理/已撤回）
- 3 条退回路径各有不同目标和接收方
- 退回/拒绝/重开均需必填原因
- 分派时自动变更为处理中

## Capabilities

### Modified Capabilities
- `workorder-assign`: 分派时自动变更状态
- `workorder-resolve`: 新增退回操作

## Impact

- 后端: TRANSITIONS 扩展为 8 状态 17 条规则
- 前端: 三工作台适配新状态
- 数据库: 新增 return_reason、submitter 列
