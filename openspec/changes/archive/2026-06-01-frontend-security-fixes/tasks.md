## 1. 路由守卫修复

- [x] 1.1 `App.tsx`：`/` 路由包裹 `ProtectedRoute`，允许三种角色，未登录自动跳转 `/login`

## 2. 表单修复

- [x] 2.1 `WorkOrderForm.tsx`：删除"提交人"输入框（第 79-86 行）

## 3. 详情页角色 gate

- [x] 3.1 `WorkOrderDetail.tsx`：导入 `useAuth`，编辑按钮仅 `submitter` 可见
- [x] 3.2 `WorkOrderDetail.tsx`："提交者操作"区块（含状态变更下拉和理由输入）仅 `submitter` 可见

## 4. B1 回归修复

- [x] 4.1 `DispatcherView.tsx`：`RESOLVERS` 常量更新为 `['孙强', '李刚', '周伟']`
- [x] 4.2 `ResolverView.tsx`：`RESOLVERS` 常量更新为 `['孙强', '李刚', '周伟']`

## 5. 验证

- [x] 5.1 手动验证：三种角色分别登录，确认首页正常显示、创建表单无提交人输入框、详情页操作区仅提交者可见、分派人员列表正确
