## 1. 后端

- [x] 1.1 创建 POST /api/workorders 路由，校验必填字段（title、description、type、priority），生成工单号，默认状态"待处理"，返回 201
- [x] 1.2 数据库 workorders 表已有，确认 seed 数据覆盖

## 2. 前端

- [x] 2.1 创建 WorkOrderForm 组件，表单包含标题、描述、类型下拉、优先级下拉
- [x] 2.2 注册 /new 路由，提交成功后跳转到 /:id 详情页
