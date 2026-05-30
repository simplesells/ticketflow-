## ADDED Requirements

### Requirement: 状态流转接口
系统 SHALL 提供 `PATCH /api/workorders/:id/status` 端点变更工单状态。

#### Scenario: 合法变更
- **WHEN** 待处理→处理中
- **THEN** 状态更新，history 新增记录
- **THEN** HTTP 200

#### Scenario: 非法跳转
- **WHEN** 待处理→已关闭
- **THEN** 返回 400，错误信息含允许的下一步

### Requirement: 状态流转规则
系统 SHALL 仅允许：待处理→处理中、处理中→已解决、已解决→已关闭。

#### Scenario: 完整路径
- **WHEN** 依次执行合法流转
- **THEN** 路径通过，history 累计 3 条

### Requirement: 完成者工作台
系统 SHALL 提供完成者视图，按处理人切换，操作工单状态。

#### Scenario: 处理人切换
- **WHEN** 点击"张工"
- **THEN** 展示该处理人工单

#### Scenario: 可用操作
- **WHEN** 工单"处理中"
- **THEN** 显示"标记'已解决'"按钮

#### Scenario: 已完成
- **WHEN** 工单"已关闭"
- **THEN** 无按钮，显示"已完成"
