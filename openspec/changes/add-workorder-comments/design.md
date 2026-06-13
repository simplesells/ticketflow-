## Context

TicketFlow 当前只有状态变更历史（`history` 字段），没有自由文本评论能力。三个角色需要一个在工单上直接沟通的渠道。现有架构是单表 `workorders`，评论是新实体，需要独立表和相关 API。

## Goals / Non-Goals

**Goals:**
- 所有角色都能在工单详情页查看评论列表
- 所有角色都能发表评论（纯文本，无需富文本）
- 评论按时间正序展示，新评论追加在末尾
- 评论记录作者 displayName 和时间戳

**Non-Goals:**
- 不支持编辑/删除评论（MVP 阶段先保持简单）
- 不支持 @提及、文件附件、富文本
- 不在列表页展示评论数（避免额外查询开销）
- 不发送评论通知（通知功能是独立变更）

## Decisions

1. **独立 `comments` 表而非复用 `history`**
   - `history` 是 JSON 字段存状态变更，结构固定；评论是自由文本，字段不同
   - 独立表查询更清晰，扩展更方便
   - 继续使用 SQLite CHECK 约束校验 role

2. **API 路径 `GET/POST /api/workorders/:id/comments`**
   - 嵌套在工单资源下，语义清晰
   - 与现有路由风格一致（现有 `PATCH /:id/status`、`PATCH /:id/edit` 等）

3. **评论列表在详情页接口不嵌入，独立请求**
   - `GET /api/workorders/:id` 保持轻量，不加评论嵌套
   - 前端详情页单独请求评论列表，加载状态独立

4. **免删除/编辑**
   - Demo→MVP 过渡期，减少 API 设计复杂度
   - 后续可按需补充

5. **author 存 displayName 而非 userId**
   - 评论是历史记录，应保留发表时的用户名（即使将来用户名变更）
   - 当前 displayName 唯一，无重名风险

6. **路由注册方式**
   - comments.ts 定义路径为 `/:id/comments`
   - main.ts 注册为 `app.use('/api/workorders', commentRoutes)`
   - 实际匹配路径：`/api/workorders/:id/comments`

## Risks / Trade-offs

- [性能] 评论量大时无分页 → MVP 阶段工单量小，暂不处理；后续可加 `?limit=&offset=`
- [一致性] 无软删除 → 内容发布即持久，误发无法撤回；MVP 阶段可接受
- [安全] 内容长度限制 → 后端校验 content 不超过 2000 字符，防滥用
- [完整性] FOREIGN KEY → comments.workorder_id 引用 workorders.id，ON DELETE CASCADE
