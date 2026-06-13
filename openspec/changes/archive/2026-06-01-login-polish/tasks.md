## 1. API 层

- [x] 1.1 `api.ts`：新增 `loginUser(username, password)` 函数和 `LoginResponse` 接口，新增 `fetchResolvers()` 函数

## 2. 前端接入

- [x] 2.1 `LoginPage.tsx`：用 `loginUser` 替换原始 `fetch`，删除本地 `LoginResponse` 接口
- [x] 2.2 `DispatcherView.tsx`：`RESOLVERS` 硬编码替换为 `fetchResolvers()` 动态获取；标题右侧加退出登录按钮
- [x] 2.3 `ResolverView.tsx`：同上，`RESOLVERS` 替换为 `fetchResolvers()`；标题右侧加退出登录按钮（注意 default resolver 的闭包陷阱用 functional setState）
- [x] 2.4 `WorkOrderList.tsx`：标题右侧加退出登录按钮

## 3. 文档修正

- [x] 3.1 `config.yaml`：后端端口号从 5678 修正为 5680

## 4. 验证

- [x] 4.1 跑后端 vitest 确认无回归
- [x] 4.2 手动验证：三种角色登录后退出、切换账号；调度者/完成者工作台完成者列表从 API 加载；登录页调用走 api.ts 封装
