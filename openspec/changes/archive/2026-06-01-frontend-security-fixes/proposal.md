## Why

Change A 引入登录后，前端有三处实现与 spec 要求不一致：(1) 首页 `/` 未受路由守卫保护，未登录用户看到空白页而非跳转登录；(2) 创建工单表单仍保留"提交人"输入框，但后端已忽略该字段，且 `form.submitter` 为 `undefined` 导致 React 受控组件警告；(3) 工单详情页的"提交者操作"区块和编辑按钮对所有角色可见，调度者/完成者点击后才被后端 403 拒绝。B1 的用户重命名还导致 DispatcherView 和 ResolverView 中硬编码的 RESOLVERS 名单过时。这些都是安全漏洞及 UI bug，需立即修复。

## What Changes

- `App.tsx`：`/` 路由包裹 `ProtectedRoute`，未登录自动跳转 `/login`
- `WorkOrderForm.tsx`：删除"提交人"输入框（共 7 行）
- `WorkOrderDetail.tsx`：编辑按钮和"提交者操作"区块仅对 `submitter` 角色显示
- `DispatcherView.tsx`：`RESOLVERS` 常量同步 B1 改名后的完成者名单
- `ResolverView.tsx`：同上

## Capabilities

### New Capabilities
<!-- None — 全部是现有 spec 已要求但未正确实现的 bug fix -->

### Modified Capabilities
<!-- None — 行为修正，不改变 spec 级需求 -->

## Impact

- 前端: `App.tsx`、`WorkOrderForm.tsx`、`WorkOrderDetail.tsx`、`DispatcherView.tsx`、`ResolverView.tsx`
- 后端: 无
- 数据库: 无
- 测试: 无新增（回归依赖手动验证）
