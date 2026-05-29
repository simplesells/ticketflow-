## ADDED Requirements

### Requirement: 状态变更接口
系统 SHALL 提供 `PATCH /api/workorders/:id/status` 端点，接受 `{ status: "newStatus" }` 变更工单状态。

#### Scenario: 合法状态变更
- **WHEN** PATCH 请求 `/api/workorders/1/status`，body 为 `{ "status": "处理中" }` 且当前状态为 "待处理"
- **THEN** 状态更新为 "处理中"
- **THEN** history 数组新增一条记录
- **THEN** HTTP 状态码为 200

#### Scenario: 非法状态跳转
- **WHEN** PATCH 请求将工单从 "待处理" 直接改为 "已关闭"
- **THEN** 返回错误信息 "不允许的状态变更"
- **THEN** HTTP 状态码为 400

### Requirement: 状态流转规则
系统 SHALL 仅允许以下状态流转：待处理 → 处理中，处理中 → 已解决，已解决 → 已关闭。

#### Scenario: 完整合法流转路径
- **WHEN** 工单依次从 待处理 → 处理中 → 已解决 → 已关闭
- **THEN** 每次变更均成功
- **THEN** history 数组包含每次变更记录

### Requirement: 状态变更历史
系统 SHALL 在每次状态变更时记录操作状态、操作人和时间到 history 字段。

#### Scenario: 历史记录包含变更信息
- **WHEN** 状态变更成功
- **THEN** history 数组末尾新增 `{ "status": "新状态", "operator": "system", "time": "ISO时间" }` 格式的记录
