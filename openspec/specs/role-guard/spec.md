# role-guard Specification

## Purpose
TBD - created by archiving change add-minimal-login. Update Purpose after archive.
## Requirements
### Requirement: 后端角色守卫中间件
系统 SHALL 提供 `requireRole(roles: string[])` Express 中间件，根据请求头 `x-user-id` 校验当前用户角色是否在允许列表中。

#### Scenario: 角色匹配放行
- **WHEN** 调度者（role=dispatcher）请求需要 `['dispatcher']` 角色的端点
- **THEN** 中间件调用 next()，请求正常处理

#### Scenario: 角色不匹配拒绝
- **WHEN** 提交者（role=submitter）请求需要 `['dispatcher']` 角色的端点
- **THEN** 返回 `{ "error": "当前角色不允许此操作" }`
- **THEN** HTTP 状态码为 403

#### Scenario: 未登录拒绝
- **WHEN** 请求不带 `x-user-id` header
- **THEN** 返回 `{ "error": "未登录" }`
- **THEN** HTTP 状态码为 401

### Requirement: 分派接口仅调度者可调用
系统 SHALL 限制 `PATCH /api/workorders/:id/assign` 仅调度者角色可调用。

#### Scenario: 调度者分派
- **WHEN** 调度者调用分派接口
- **THEN** 正常处理分派请求

#### Scenario: 提交者尝试分派
- **WHEN** 提交者调用分派接口
- **THEN** 返回 403 "当前角色不允许此操作"

### Requirement: 创建工单仅提交者可调用
系统 SHALL 限制 `POST /api/workorders` 仅提交者角色可调用。

#### Scenario: 提交者创建工单
- **WHEN** 提交者调用创建接口
- **THEN** 正常创建工单

#### Scenario: 调度者尝试创建
- **WHEN** 调度者调用创建接口
- **THEN** 返回 403 "当前角色不允许此操作"

### Requirement: 状态变更三种角色均可调用
系统 SHALL 允许 `PATCH /api/workorders/:id/status` 被提交者、调度者、完成者三种角色调用。具体流转是否合法由流转规则表校验，不与角色绑定。

#### Scenario: 完成者变更状态
- **WHEN** 完成者（role=resolver）调用状态变更接口
- **THEN** 流转规则表校验 from→to 合法性
- **THEN** 合法则正常处理，非法则返回 400

#### Scenario: 提交者变更状态
- **WHEN** 提交者（role=submitter）调用状态变更接口
- **THEN** 流转规则表校验 from→to 合法性
- **THEN** 合法则正常处理，非法则返回 400

#### Scenario: 调度者变更状态
- **WHEN** 调度者（role=dispatcher）调用状态变更接口
- **THEN** 流转规则表校验 from→to 合法性
- **THEN** 合法则正常处理，非法则返回 400

