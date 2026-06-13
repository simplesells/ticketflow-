## Purpose
定义工单创建的能力：提交者可以录入并提交工单，系统校验字段并返回结果。
## Requirements
### Requirement: 工单创建接口
系统 SHALL 提供 `POST /api/workorders` 端点，仅提交者角色可调用。接收 JSON 请求体，校验必填字段，创建工单并返回。工单的提交人 SHALL 从登录用户的 displayName 自动获取，不信任前端传入的 submitter 字段。

#### Scenario: 创建成功
- **WHEN** 提交者提交 title、description、type、priority 均为有效值
- **THEN** 生成唯一工单号，状态设为"待处理"，提交人自动设为登录用户 displayName
- **THEN** HTTP 状态码为 201

#### Scenario: 提交人自动取自登录用户
- **WHEN** 小明(displayName="小明")创建工单，前端传 submitter="张三"
- **THEN** 工单的 submitter 字段仍为"小明"，忽略前端传的值

#### Scenario: 缺少必填字段
- **WHEN** 提交时 title 或 description 为空
- **THEN** 返回错误信息
- **THEN** HTTP 状态码为 400

#### Scenario: 非提交者创建被拒
- **WHEN** 调度者或完成者调用创建接口
- **THEN** 返回 "当前角色不允许此操作"
- **THEN** HTTP 状态码为 403

### Requirement: 工单创建表单
系统 SHALL 提供工单创建页面，包含标题、描述、类型、优先级四个输入字段。提交人不再作为输入字段（由后端自动获取）。

#### Scenario: 表单提交成功
- **WHEN** 用户填写所有必填字段并点击提交
- **THEN** 调用创建接口，提交人由后端自动取登录用户
- **THEN** 页面跳转到工单详情页

#### Scenario: 表单不包含提交人输入框
- **WHEN** 提交者用户打开创建工单页面
- **THEN** 页面显示标题、描述、类型、优先级四个字段
- **THEN** 不显示"提交人"输入框

