## ADDED Requirements

### Requirement: 工单创建接口
系统 SHALL 提供 `POST /api/workorders` 端点，接收 JSON 请求体，校验必填字段，创建工单并返回。

#### Scenario: 创建成功
- **WHEN** 提交 title、description、type、priority 均为有效值
- **THEN** 生成唯一工单号，状态设为"待处理"
- **THEN** HTTP 状态码为 201

#### Scenario: 缺少必填字段
- **WHEN** 提交时 title 或 description 为空
- **THEN** 返回错误信息
- **THEN** HTTP 状态码为 400

### Requirement: 工单创建表单
系统 SHALL 提供工单创建页面，包含标题、描述、类型、优先级四个输入字段。

#### Scenario: 表单提交成功
- **WHEN** 用户填写所有必填字段并点击提交
- **THEN** 调用创建接口
- **THEN** 页面跳转到工单详情页

#### Scenario: 表单校验失败
- **WHEN** 用户未填写标题直接提交
- **THEN** 页面显示"标题和描述为必填项"错误提示
- **THEN** 不发送网络请求
