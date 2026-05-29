## ADDED Requirements

### Requirement: 工单创建表单
系统 SHALL 提供工单创建页面 `POST /new`，包含 title, description, type, priority 四个字段。

#### Scenario: 创建成功
- **WHEN** 用户填入所有字段并点击提交
- **THEN** 系统创建工单并跳转到详情页

### Requirement: 工单详情页
系统 SHALL 提供工单详情页面，路径为 `/:id`，展示完整工单信息。

#### Scenario: 查看详情
- **WHEN** 用户访问 `/:id`
- **THEN** 页面展示标题、描述、类型、优先级、状态、状态历史

### Requirement: 详情页状态变更
系统 SHALL 在工单详情页提供状态变更操作，根据当前状态显示允许跳转的下一步状态。

#### Scenario: 合法状态变更
- **WHEN** 当前状态为"待处理"
- **THEN** 页面显示"标记为处理中"按钮
- **WHEN** 用户点击按钮
- **THEN** 状态更新，页面刷新显示最新状态和历史
