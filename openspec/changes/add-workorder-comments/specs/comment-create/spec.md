## ADDED Requirements

### Requirement: 发表评论接口
系统 SHALL 提供 `POST /api/workorders/:id/comments` 端点，允许已登录的任意角色发表评论。评论内容为纯文本，系统自动记录作者和发表时间。

#### Scenario: 提交者发表评论成功
- **WHEN** 提交者向 `POST /api/workorders/1/comments` 发送 `{ "content": "请问大概什么时候能处理？" }`
- **THEN** 评论保存到数据库，`author` 自动设为登录用户的 displayName
- **THEN** HTTP 状态码为 201
- **THEN** 返回包含 id、content、author、createdAt 的评论对象

#### Scenario: 调度者发表评论成功
- **WHEN** 调度者向 `POST /api/workorders/1/comments` 发送 `{ "content": "已分派给孙强处理" }`
- **THEN** 评论成功创建
- **THEN** HTTP 状态码为 201

#### Scenario: 内容为空被拒绝
- **WHEN** 用户发送 `{ "content": "" }` 或 `{ }`
- **THEN** 返回错误 `{ "error": "评论内容不能为空" }`
- **THEN** HTTP 状态码为 400

#### Scenario: 内容过长被拒绝
- **WHEN** 用户发送 `content` 超过 2000 字符
- **THEN** 返回错误 `{ "error": "评论内容不能超过2000字" }`
- **THEN** HTTP 状态码为 400

#### Scenario: 工单不存在被拒绝
- **WHEN** 用户向 `POST /api/workorders/999/comments` 发送评论
- **THEN** 返回错误 `{ "error": "工单不存在" }`
- **THEN** HTTP 状态码为 404

#### Scenario: 未登录被拒绝
- **WHEN** 请求不带 `x-user-id` header
- **THEN** 返回错误 `{ "error": "未登录" }`
- **THEN** HTTP 状态码为 401

### Requirement: 前端评论发表表单
系统 SHALL 在工单详情页底部提供评论输入区，所有角色用户均可使用。

#### Scenario: 发表评论后列表刷新
- **WHEN** 用户在输入框填写内容并点击"发表评论"
- **THEN** 评论发送到后端，成功后评论列表自动刷新显示新评论
- **THEN** 输入框清空

#### Scenario: 空内容提交被前端拦截
- **WHEN** 用户输入空白内容并点击发表
- **THEN** 前端阻止提交，提示"评论内容不能为空"
