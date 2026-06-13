## ADDED Requirements

### Requirement: 通知列表接口
系统 SHALL 提供 `GET /api/notifications` 端点，返回当前用户的全部通知，按时间倒序排列。

#### Scenario: 获取通知列表
- **WHEN** 用户请求 `GET /api/notifications`
- **THEN** 返回该用户的通知数组，每条含 id、workorderId、type、message、isRead、createdAt
- **THEN** 通知按 `createdAt` 倒序排列（最新在上）
- **THEN** HTTP 状态码为 200

#### Scenario: 无通知时返回空数组
- **WHEN** 用户还没有任何通知
- **THEN** 返回空数组 `[]`

### Requirement: 未读数量接口
系统 SHALL 提供 `GET /api/notifications/unread-count` 端点，返回当前用户未读通知数量。

#### Scenario: 获取未读数
- **WHEN** 用户有 3 条未读通知
- **THEN** 返回 `{ "count": 3 }`
- **THEN** HTTP 状态码为 200

### Requirement: 标记已读接口
系统 SHALL 提供 `PATCH /api/notifications/:id/read` 将单条通知标记为已读，以及 `PATCH /api/notifications/read-all` 将当前用户全部通知标记为已读。

#### Scenario: 标记单条已读
- **WHEN** 用户点击某条通知
- **THEN** 该通知 `isRead` 变为 1
- **THEN** HTTP 状态码为 200

#### Scenario: 全部已读
- **WHEN** 用户点击"全部已读"
- **THEN** 该用户所有通知 `isRead` 变为 1
- **THEN** HTTP 状态码为 200

### Requirement: 前端通知入口
系统 SHALL 在各角色工作台页面顶部提供通知铃铛图标和未读数量徽标。

#### Scenario: 未读数显示
- **WHEN** 用户有未读通知
- **THEN** 铃铛图标旁显示红色徽标，数字为未读数量

#### Scenario: 无未读时隐藏徽标
- **WHEN** 用户没有未读通知
- **THEN** 铃铛图标旁不显示数字

#### Scenario: 通知列表弹窗
- **WHEN** 用户点击铃铛图标
- **THEN** 展开通知下拉列表，显示最近通知（消息、时间、已读状态）
- **WHEN** 用户点击某条通知
- **THEN** 跳转到对应工单详情页，并将该通知标记为已读
