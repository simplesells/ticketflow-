## ADDED Requirements

### Requirement: 数据库建表
系统 SHALL 在启动时自动创建 `workorders` 表，包含以下字段：id, code, title, description, type, priority, status, history, created_at, updated_at。

#### Scenario: 首次启动自动建表
- **WHEN** 数据库文件不存在且服务首次启动
- **THEN** 自动创建 `workorders` 表
- **THEN** 表包含完整的工单字段和约束

### Requirement: 获取工单列表
系统 SHALL 提供 `GET /api/workorders` 端点，返回所有工单的 JSON 数组，支持按 status 查询参数筛选。

#### Scenario: 获取全部工单
- **WHEN** GET 请求 `/api/workorders`
- **THEN** 返回所有工单的 JSON 数组
- **THEN** HTTP 状态码为 200

#### Scenario: 按状态筛选
- **WHEN** GET 请求 `/api/workorders?status=待处理`
- **THEN** 仅返回状态为"待处理"的工单
- **THEN** HTTP 状态码为 200

### Requirement: 获取工单详情
系统 SHALL 提供 `GET /api/workorders/:id` 端点，返回指定工单的完整信息。

#### Scenario: 查看已有工单
- **WHEN** GET 请求 `/api/workorders/1`
- **THEN** 返回 id 为 1 的工单完整 JSON 对象
- **THEN** HTTP 状态码为 200

#### Scenario: 查看不存在的工单
- **WHEN** GET 请求 `/api/workorders/999`
- **THEN** 返回 404 错误
- **THEN** HTTP 状态码为 404

### Requirement: 创建工单
系统 SHALL 提供 `POST /api/workorders` 端点，接收 JSON body 创建新工单。

#### Scenario: 创建成功
- **WHEN** POST 请求 `/api/workorders`，body 包含 title, description, type, priority
- **THEN** 创建工单并返回完整对象
- **THEN** 工单号自动生成（格式 WO-YYYYMMDD-NNNN）
- **THEN** HTTP 状态码为 201

#### Scenario: 缺少必填字段
- **WHEN** POST 请求 `/api/workorders`，body 缺少 title
- **THEN** 返回错误信息
- **THEN** HTTP 状态码为 400

### Requirement: 删除工单
系统 SHALL 提供 `DELETE /api/workorders/:id` 端点，删除指定工单。

#### Scenario: 删除已有工单
- **WHEN** DELETE 请求 `/api/workorders/1`
- **THEN** 删除成功
- **THEN** HTTP 状态码为 200

#### Scenario: 删除不存在的工单
- **WHEN** DELETE 请求 `/api/workorders/999`
- **THEN** 返回 404 错误
- **THEN** HTTP 状态码为 404
