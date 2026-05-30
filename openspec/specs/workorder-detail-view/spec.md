## ADDED Requirements

### Requirement: 工单详情接口
系统 SHALL 提供 `GET /api/workorders/:id` 端点，返回指定工单完整信息。

#### Scenario: 获取已有工单
- **WHEN** GET 请求 `/api/workorders/1`
- **THEN** 返回工单完整 JSON（含 history 和 assignee）
- **THEN** HTTP 状态码为 200

#### Scenario: 工单不存在
- **WHEN** GET 请求 `/api/workorders/999`
- **THEN** 返回 404 错误

### Requirement: 工单详情页面
系统 SHALL 提供详情页，展示工单完整信息及状态历史。

#### Scenario: 查看详情
- **WHEN** 用户访问 `/:id`
- **THEN** 展示标题、描述、类型、优先级、状态标签、处理人
- **THEN** 展示状态变更历史时间线

#### Scenario: 返回列表
- **WHEN** 用户点击"返回列表"
- **THEN** 导航回首页
