## ADDED Requirements

### Requirement: 模板管理接口
系统 SHALL 提供 `POST /api/templates`、`PUT /api/templates/:id`、`DELETE /api/templates/:id` 端点，仅调度者角色可调用。

#### Scenario: 创建模板
- **WHEN** 调度者 POST 新模板数据
- **THEN** 模板保存到数据库
- **THEN** HTTP 状态码为 201

#### Scenario: 编辑模板
- **WHEN** 调度者 PUT 更新模板
- **THEN** 模板更新
- **THEN** HTTP 状态码为 200

#### Scenario: 删除模板
- **WHEN** 调度者 DELETE 模板
- **THEN** 模板删除
- **THEN** HTTP 状态码为 200

#### Scenario: 非调度者管理被拒
- **WHEN** 提交者尝试管理模板
- **THEN** 返回 403

### Requirement: 模板管理页面
系统 SHALL 在调度者工作台提供模板管理入口。

#### Scenario: 管理模板
- **WHEN** 调度者点击"管理模板"
- **THEN** 展示模板列表，可新增、编辑、删除
