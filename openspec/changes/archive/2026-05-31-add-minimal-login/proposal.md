## Why

当前角色切换靠 UI 标签页按钮，没有任何身份识别。任何人都可以随意切换角色，提交者可以冒充调度者分派工单，调度者可以伪装完成者修改状态。Demo 阶段这条线能跑通，但不符合老师蓝图中 MVP 的硬性要求："角色身份开始真实影响入口和动作"。

最小登录是 Demo → MVP 的第一步：有了登录才有真正的权限区分基础。

## What Changes

- 新增后端用户目录（3-5个硬编码用户，绑定角色），无需完整账号体系
- 新增 POST /api/auth/login 端点（用户名+密码 → 返回用户信息）
- 新增 GET /api/auth/me 端点（当前会话用户）
- 新增登录页面（前端第一入口，未登录自动跳转）
- 登录后按角色自动进入对应工作台（提交者/调度者/完成者）
- 移除首页的角色切换标签栏（角色不再靠按钮切换）
- 后端 API 按角色权限拦截（提交者不能调分派接口，调度者不能创建工单等）
- 创建工单时提交人自动从登录用户获取，前端去掉提交人手填输入框
- 完成者工作台默认显示登录用户的工单（不再默认显示张工）

## Capabilities

### New Capabilities
- `user-auth`: 最小登录与身份识别，支持用户名+密码登录，按角色分流到不同工作台
- `role-guard`: 角色权限守卫，后端 API 根据登录角色拦截非法操作

### Modified Capabilities
- `workorder-create`: 创建工单需要登录为提交者
- `workorder-assign`: 分派操作需要登录为调度者
- `workorder-resolve`: 处理操作需要登录为完成者
- `workorder-list-browse`: 列表按登录角色过滤可见内容

## Impact

- 后端: 新增 src/routes/auth.ts、src/models/user.ts；现有路由加角色校验中间件
- 前端: 新增 LoginPage.tsx、AuthContext.tsx；App.tsx 路由重构（加登录守卫，去角色切换标签栏）；WorkOrderForm 去提交人输入框；ResolverView 初始值用登录用户
- 数据库: 无需新表（用户硬编码），现有工单表不变
- 测试: 新增后端测试用例（登录/权限/非法操作拦截）
