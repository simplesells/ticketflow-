## Why

刚做完评论功能，但用户必须手动刷新才能看到新评论，状态变更和分派也没有通知。三角色之间缺少"被动感知"能力，协作效率低。通知功能让相关人员自动知道发生了什么，是协作系统从"能用"到"好用"的关键一步。

## What Changes

- 新增 `notifications` 数据库表，存储通知（用户、工单、类型、消息、已读状态）
- 在评论、状态变更、分派操作时自动创建通知
- 新增通知 API：列表查询、未读数、单条已读、全部已读
- 前端全局导航栏显示未读通知徽标，点击展开列表，点击跳转工单详情

## Capabilities

### New Capabilities

- `notification-create`: 系统在评论、状态变更、分派时自动创建通知，记录接收用户、关联工单、消息文本
- `notification-list`: 用户可以查看通知列表、未读数量、标记已读

### Modified Capabilities

- `comment-create`: 发表评论后，自动通知工单的提交者和处理人（如有）
- `workorder-assign`: 分派后，自动通知被分派的处理人
- `workorder-resolve`: 状态变更后，自动通知工单的提交者和处理人（如有）

## Impact

- **数据库**: 新增 `notifications` 表
- **后端**: 新增 `routes/notifications.ts`；修改 `routes/comments.ts`、`routes/workorders.ts`（加通知创建逻辑）
- **前端**: 新增 `NotificationBell` 组件；修改 `App.tsx`（全局导航）、`api.ts`（新增 API 函式）
- **无 BREAKING 变更**
