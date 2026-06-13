## MODIFIED Requirements

### Requirement: 状态流转接口
系统 SHALL 提供 `PATCH /api/workorders/:id/status` 端点，仅完成者角色可调用。变更工单状态并校验流转规则。

#### Scenario: 完成者合法变更
- **WHEN** 完成者将处理中→已解决
- **THEN** 状态更新，history 新增记录
- **THEN** HTTP 200

#### Scenario: 完成者非法跳转
- **WHEN** 完成者将待处理→已关闭（跳过中间状态）
- **THEN** 返回 400，错误信息含允许的下一步

#### Scenario: 非完成者变更状态被拒
- **WHEN** 提交者或调度者调用状态变更接口
- **THEN** 返回 "当前角色不允许此操作"
- **THEN** HTTP 状态码为 403
