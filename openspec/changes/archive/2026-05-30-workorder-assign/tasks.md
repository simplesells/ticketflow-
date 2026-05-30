## 1. 后端 + 数据库

- [x] 1.1 数据库 workorders 表新增 assignee 列（NOT NULL DEFAULT ''）
- [x] 1.2 创建 PATCH /api/workorders/:id/assign 路由（校验 + 更新 + 记录 history）
- [x] 1.3 扩展 GET /api/workorders 支持 ?assignee= 筛选

## 2. 前端

- [x] 2.1 创建 DispatcherView 组件（待分派/已分派双区域布局）
- [x] 2.2 分派交互（文本输入 + 按钮 + 刷新）
- [x] 2.3 种子数据预设分派关系（张工2条、李工1条、王工1条）
