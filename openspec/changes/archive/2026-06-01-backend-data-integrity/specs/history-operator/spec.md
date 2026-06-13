## ADDED Requirements

### Requirement: 历史记录操作人实名
系统 SHALL 在每次状态变更、分派操作、创建工单时，将实际操作人的 displayName 写入 history 的 operator 字段，而非使用占位值。

#### Scenario: 创建工单记录操作人
- **WHEN** 赵明（displayName="赵明"）创建工单
- **THEN** 工单 history 包含一条初始记录
- **THEN** 该记录的 operator 为 "赵明"
- **THEN** 该记录的 status 为 "待处理"

#### Scenario: 分派操作记录操作人
- **WHEN** 钱勇（displayName="钱勇"）将工单分派给孙强
- **THEN** history 新增记录的 operator 为 "钱勇"

#### Scenario: 状态变更记录操作人
- **WHEN** 孙强（displayName="孙强"）将工单状态变更为 "已解决"
- **THEN** history 新增记录的 operator 为 "孙强"

#### Scenario: 老工单 operator 不回溯修改
- **WHEN** 查询创建于此变更之前的工单历史
- **THEN** 旧记录 operator 保持原值（'system' 或其他），不做迁移修改
