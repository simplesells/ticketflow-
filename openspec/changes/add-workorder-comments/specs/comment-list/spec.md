## ADDED Requirements

### Requirement: 评论列表接口
系统 SHALL 提供 `GET /api/workorders/:id/comments` 端点，返回指定工单的所有评论，按时间正序排列。

#### Scenario: 获取评论列表
- **WHEN** 用户向 `GET /api/workorders/1/comments` 发送请求
- **THEN** 返回该工单的评论数组，每条含 id、content、author、createdAt
- **THEN** 评论按 `createdAt` 正序排列（最早在上）
- **THEN** HTTP 状态码为 200

#### Scenario: 无评论时返回空数组
- **WHEN** 工单还没有任何评论
- **THEN** 返回空数组 `[]`
- **THEN** HTTP 状态码为 200

#### Scenario: 工单不存在返回 404
- **WHEN** 请求 `/api/workorders/999/comments`
- **THEN** 返回 `{ "error": "工单不存在" }`
- **THEN** HTTP 状态码为 404

### Requirement: 前端评论列表展示
系统 SHALL 在工单详情页的状态历史下方展示评论列表。

#### Scenario: 查看评论列表
- **WHEN** 用户打开工单详情页
- **THEN** 在状态历史区域下方展示评论列表
- **THEN** 每条评论显示作者姓名、内容文本、发表时间（格式化为本地时间）

#### Scenario: 无评论时显示提示
- **WHEN** 工单没有任何评论
- **THEN** 评论区显示"暂无评论"

#### Scenario: 多角色评论展示
- **WHEN** 工单有来自不同角色的评论
- **THEN** 所有评论按时间顺序展示，每条标注作者
