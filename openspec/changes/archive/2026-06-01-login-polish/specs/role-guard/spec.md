## MODIFIED Requirements

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
