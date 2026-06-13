## 1. 数据修复

- [x] 1.1 在 `backend/src/models/user.ts` 中将所有用户名重命名为正式人名（赵明/钱勇/孙强/李刚/陈芳/周伟），seed 数据 assignee 同步更新

## 2. History operator 实现

- [x] 2.1 `POST /api/workorders` 创建工单时写入初始 history 记录 `{status:'待处理', operator: req.user.displayName, time: now}`
- [x] 2.2 `PATCH /api/workorders/:id/status` 状态变更时 history operator 使用 `req.user.displayName`（替换写死的 `'system'`）
- [x] 2.3 `PATCH /api/workorders/:id/assign` 分派操作时 history operator 使用 `req.user.displayName`（替换写死的 `'system'`）

## 3. 验证

- [x] 3.1 运行 `npx vitest run` 确认现有测试无回归
- [x] 3.2 手动冒烟测试：不同角色登录后操作工单，确认 history 中 operator 为实际操作人姓名
