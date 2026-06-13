# user-auth Specification

## Purpose
TBD - created by archiving change add-minimal-login. Update Purpose after archive.
## Requirements
### Requirement: 用户登录
系统 SHALL 提供 `POST /api/auth/login` 端点，接受用户名和密码，验证后返回用户信息（含角色）。

#### Scenario: 登录成功
- **WHEN** 提交正确的 `{ "username": "xiaoming", "password": "123456" }`
- **THEN** 返回 `{ "id": 1, "username": "xiaoming", "role": "submitter", "displayName": "小明" }`
- **THEN** HTTP 状态码为 200

#### Scenario: 密码错误
- **WHEN** 提交错误的密码
- **THEN** 返回 `{ "error": "用户名或密码错误" }`
- **THEN** HTTP 状态码为 401

#### Scenario: 用户不存在
- **WHEN** 提交不存在的用户名
- **THEN** 返回 `{ "error": "用户名或密码错误" }`
- **THEN** HTTP 状态码为 401

### Requirement: 获取当前用户
系统 SHALL 提供 `GET /api/auth/me` 端点，根据请求头 `x-user-id` 返回当前用户信息。

#### Scenario: 已登录用户
- **WHEN** 请求带 `x-user-id: 1` header
- **THEN** 返回对应用户的 id、username、role、displayName
- **THEN** HTTP 状态码为 200

#### Scenario: 未登录
- **WHEN** 请求不带 `x-user-id` header 或值为无效 id
- **THEN** 返回 `{ "error": "未登录" }`
- **THEN** HTTP 状态码为 401

### Requirement: 前端登录页面
系统 SHALL 提供 `/login` 路由，显示登录表单（用户名输入框 + 密码输入框 + 登录按钮）。

#### Scenario: 登录成功跳转
- **WHEN** 用户输入正确凭据并点击登录
- **THEN** 用户信息存入 localStorage
- **THEN** 页面跳转到对应角色工作台首页

#### Scenario: 未登录访问工作台
- **WHEN** 未登录用户访问 `/` 或其他非 `/login` 路径
- **THEN** 自动重定向到 `/login`

#### Scenario: 登录失败提示
- **WHEN** 用户输入错误凭据
- **THEN** 页面显示错误提示
- **THEN** 不跳转

### Requirement: 登录后按角色进入工作台
系统 SHALL 在登录后根据用户角色自动显示对应工作台首页。

#### Scenario: 提交者登录
- **WHEN** 角色为 submitter 的用户登录
- **THEN** 首页展示提交者工作台（工单列表），不显示调度者/完成者操作入口

#### Scenario: 调度者登录
- **WHEN** 角色为 dispatcher 的用户登录
- **THEN** 首页展示调度者工作台

#### Scenario: 完成者登录
- **WHEN** 角色为 resolver 的用户登录
- **THEN** 首页展示完成者工作台，显示该完成者的工单列表

