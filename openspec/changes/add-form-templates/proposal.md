## Why

当前创建工单时，用户每次都要手动填写标题、类型、优先级。常见工单（打印机故障、设备申请等）翻来覆去就那几种，重复输入效率低、容易选错。表单模板让用户一键套用预设，减少重复劳动。

## What Changes

- 新增 `form_templates` 数据库表，存储模板（名称、标题提示、描述提示、类型、优先级）
- 种子数据预设 4 个常用模板
- 新增 `GET /api/templates` 端点
- 调度者可增删改模板（管理页面）
- 前端 `WorkOrderForm` 新增模板选择器，选模板后自动填充字段

## Capabilities

### New Capabilities

- `form-template-list`: 创建工单时可选择预设模板，自动填充字段
- `form-template-manage`: 调度者可以管理模板（新增、编辑、删除）

## Impact

- **数据库**: 新增 `form_templates` 表
- **后端**: 新增 `routes/templates.ts`
- **前端**: 修改 `WorkOrderForm.tsx`；新增 `TemplateManager.tsx`
- **无 BREAKING 变更**
