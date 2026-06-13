## Purpose
定义工单列表浏览的能力：用户可以看到工单列表并按状态筛选。
## Requirements
### Requirement: 工单列表接口
系统 SHALL 提供 `GET /api/workorders` 端点，返回所有工单，支持按 status 参数筛选。

#### Scenario: 获取全部工单
- **WHEN** GET 请求 `/api/workorders`
- **THEN** 返回所有工单 JSON 数组
- **THEN** HTTP 状态码为 200

#### Scenario: 按状态筛选
- **WHEN** GET 请求 `/api/workorders?status=待处理`
- **THEN** 仅返回状态为"待处理"的工单

### Requirement: 工单列表页面
系统 SHALL 根据登录用户角色展示对应工作台，提交者看到工单列表，调度者看到待分派/已分派，完成者看到自己的工单。

#### Scenario: 提交者登录后展示列表
- **WHEN** 提交者登录后访问首页
- **THEN** 表格展示所有工单，可筛选状态

#### Scenario: 调度者登录后展示调度台
- **WHEN** 调度者登录后访问首页
- **THEN** 展示待分派工单和已分派工单两区

#### Scenario: 完成者登录后展示处理台
- **WHEN** 完成者登录后访问首页
- **THEN** 展示该完成者名下的工单

#### Scenario: 角色切换 Tab 已移除
- **WHEN** 任何角色登录后查看首页
- **THEN** 页面不显示提交者/调度者/完成者的角色切换 Tab

