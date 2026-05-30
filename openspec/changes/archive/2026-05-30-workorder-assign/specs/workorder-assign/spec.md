## ADDED Requirements

### Requirement: 分派接口
系统 SHALL 提供 `PATCH /api/workorders/:id/assign` 端点，接受 assignee 更新。

#### Scenario: 分派成功
- **WHEN** 提交 `{ "assignee": "张工" }`
- **THEN** 工单 assignee 更新，history 新增分派记录
- **THEN** HTTP 状态码为 200

#### Scenario: 缺少字段
- **WHEN** body 无 assignee
- **THEN** 返回 400 错误

### Requirement: 调度者工作台
系统 SHALL 提供调度者视图，区分待分派和已分派工单。

#### Scenario: 待分派列表
- **WHEN** 打开调度者工作台
- **THEN** 上半部列出无处理人的工单

#### Scenario: 分派操作
- **WHEN** 输入姓名点击分派
- **THEN** 工单移至已分派区域

## MODIFIED Requirements

### Requirement: 工单列表接口
系统 SHALL 扩展 GET /api/workorders 支持 ?assignee= 筛选。

#### Scenario: 按处理人筛选
- **WHEN** GET `/api/workorders?assignee=张工`
- **THEN** 仅返回该处理人工单
