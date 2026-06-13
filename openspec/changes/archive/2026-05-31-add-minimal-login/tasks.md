按照蓝图 TDD 原则排列：先写测试（红），再写代码（绿）。

## 1. 搭建测试基础设施

- [x] 1.1 后端安装 vitest + supertest，配置 `backend/vitest.config.ts`
- [x] 1.2 创建测试辅助文件 `backend/src/test/helpers.ts`（启动 express app、清数据）

## 2. 认证接口 —— 先写失败的测试（红）

- [x] 2.1 写 `backend/src/test/auth.test.ts`：登录成功 / 密码错误 / 用户不存在 / 获取当前用户 / 未登录 共 6 条用例
- [x] 2.2 运行测试，确认全部失败（红阶段）

## 3. 认证接口 —— 实现代码（绿）

- [x] 3.1 创建 `backend/src/models/user.ts`（5个硬编码用户，三种角色各至少1人）
- [x] 3.2 创建 `backend/src/routes/auth.ts`（POST /api/auth/login + GET /api/auth/me）
- [x] 3.3 在 `backend/src/main.ts` 注册 auth 路由
- [x] 3.4 运行 `npx vitest run`，确认 2.1 的测试全部通过（绿阶段）

## 4. 角色守卫 —— 先写失败的测试（红）

- [x] 4.1 写 `backend/src/test/role-guard.test.ts`：放行正确角色 / 拒绝错误角色 / 拒绝未登录 / 分派仅调度者 / 创建仅提交者 / 状态变更三种角色均可 / 取列表三种角色均可 共 7 条用例
- [x] 4.2 运行测试，确认全部失败（红阶段）

## 5. 角色守卫 —— 实现代码（绿）

- [x] 5.1 创建 `backend/src/middleware/requireRole.ts`（中间件 + 用户信息挂到 req.user）
- [x] 5.2 在 workorder 路由加 requireRole：POST 仅 submitter，PATCH assign 仅 dispatcher，PATCH status 三种角色，PATCH edit 仅 submitter，GET 三种角色。POST 时 submitter 自动取 req.user.displayName
- [x] 5.3 运行全部测试，确认 4.1 的测试全部通过，且之前所有测试仍通过（无回归）

## 6. 前端登录与路由守卫

- [x] 6.1 创建 `frontend/src/AuthContext.tsx`（用户状态管理 + localStorage 持久化）
- [x] 6.2 创建 `frontend/src/LoginPage.tsx`（登录表单 + 错误提示）
- [x] 6.3 重构 `frontend/src/App.tsx`：加 /login 路由，加 ProtectedRoute 登录守卫，登录后按角色进工作台，移除 TabNav 角色切换
- [x] 6.4 WorkOrderForm 去掉"提交人"输入框（submitter 由后端自动从登录用户取）

## 7. 前端 API 层适配身份

- [x] 7.1 前端 api.ts 所有请求加 `x-user-id` header（从 localStorage 取）
- [x] 7.2 ResolverView 初始 resolver 值改为登录用户 displayName（按钮保留不删，只改默认选中）

## 8. 端到端验证

- [x] 8.1 三种角色分别登录 → 验证进入不同首页
- [x] 8.2 未登录访问 / → 验证自动跳 /login
- [x] 8.3 提交者尝试调分派 API → 验证 403 拒绝
- [x] 8.4 小明(提交者)创建工单 → 验证提交人自动为"小明"，无手填输入框
