## ADDED Requirements

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
系统 SHALL 以表格展示工单列表，提供状态 Tab 切换筛选。

#### Scenario: 默认展示全部
- **WHEN** 用户访问首页
- **THEN** 表格展示所有工单

#### Scenario: 切换状态筛选
- **WHEN** 用户点击"处理中"Tab
- **THEN** 表格仅展示该状态的工单，选中 Tab 高亮

#### Scenario: 点击跳转
- **WHEN** 用户点击工单号
- **THEN** 跳转到该工单详情页
