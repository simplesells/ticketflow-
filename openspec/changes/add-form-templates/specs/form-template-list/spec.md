## ADDED Requirements

### Requirement: 模板列表接口
系统 SHALL 提供 `GET /api/templates` 端点，所有已登录角色均可调用。

#### Scenario: 获取模板列表
- **WHEN** 用户请求 `GET /api/templates`
- **THEN** 返回所有模板数组，每条含 id、name、titleHint、descriptionHint、type、priority
- **THEN** HTTP 状态码为 200

### Requirement: 前端模板选择
系统 SHALL 在创建工单页面提供模板下拉选择器。

#### Scenario: 选择模板填充表单
- **WHEN** 用户选择"打印机故障"模板
- **THEN** 标题自动填充为"打印机无法打印"
- **THEN** 类型自动选为"报修"
- **THEN** 优先级自动选为"高"
- **THEN** 用户仍可手动修改任意字段

#### Scenario: 不选模板正常填写
- **WHEN** 用户不选模板直接填写
- **THEN** 表单行为与之前完全一致
