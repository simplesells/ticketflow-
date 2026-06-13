## 1. 数据库 & 通知服务

- [ ] 1.1 在 database.ts 新增 notifications 表（id, user_id, workorder_id, type, message, is_read, created_at），含 FOREIGN KEY
- [ ] 1.2 新增 routes/notifications.ts：实现 GET 列表、GET unread-count、PATCH 单条已读、PATCH 全部已读四个端点
- [ ] 1.3 在 main.ts 注册通知路由；在 comments.ts / workorders.ts 的评论、分派、状态变更成功后插入通知创建逻辑

## 2. 后端测试（红 → 绿）

- [ ] 2.1 编写 notifications 路由测试（vitest + supertest）：列表、未读数、已读、全部已读
- [ ] 2.2 运行测试确认通过

## 3. 前端通知 UI

- [ ] 3.1 在 api.ts 新增通知相关 API 函式（fetchNotifications、fetchUnreadCount、markRead、markAllRead）
- [ ] 3.2 新建 NotificationBell.tsx 组件（铃铛图标 + 未读徽标 + 下拉列表）
- [ ] 3.3 在 App.tsx 各页面顶部集成 NotificationBell，点击通知跳转工单详情并标记已读
