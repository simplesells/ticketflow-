## MODIFIED Requirements

### Requirement: 分派接口
系统 SHALL 提供 `PATCH /api/workorders/:id/assign` 端点，仅调度者角色可调用。接受 assignee 更新。

#### Scenario: 分派成功
- **WHEN** 调度者提交 `{ "assignee": "张工" }`
- **THEN** 工单 assignee 更新，history 新增分派记录
- **THEN** HTTP 状态码为 200

#### Scenario: 缺少字段
- **WHEN** body 无 assignee
- **THEN** 返回 400 错误

#### Scenario: 非调度者分派被拒
- **WHEN** 提交者或完成者调用分派接口
- **THEN** 返回 "当前角色不允许此操作"
- **THEN** HTTP 状态码为 403
