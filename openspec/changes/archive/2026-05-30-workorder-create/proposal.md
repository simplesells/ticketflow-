## Why

用户需要一个入口提交工单，目前系统缺少此功能。

## What Changes

- 新增 POST /api/workorders 端点，接收工单数据，返回创建结果
- 新增工单创建表单页面，包含标题、描述、类型、优先级字段
- 表单提交后跳转到详情页

## Capabilities

### New Capabilities
- `workorder-create`: 用户填写表单、提交工单、看到创建结果

### Modified Capabilities

## Impact

- 后端：`POST /api/workorders` 路由（校验必填、生成工单号、状态默认"待处理"）
- 前端：`WorkOrderForm.tsx` + `/new` 路由
- 数据库：workorders 表（已存在，无需变更）
