## Why

当前工单系统只记录状态变更历史，三角色之间缺乏沟通渠道。提交者无法追问进度，调度者无法在工单上直接给出处理意见，完成者无法在处理后补充说明。评论功能是工单协作的基础，也是从 Demo 迈向 MVP 的第一步。

## What Changes

- 新增 `comments` 数据库表，存储评论（关联工单、作者、内容、时间）
- 新增评论 API：`GET /api/workorders/:id/comments`（列表）、`POST /api/workorders/:id/comments`（新增）
- 评论列表按时间正序展示（最早在上），新评论追加到末尾
- 前端工单详情页新增评论区，所有角色均可查看和发表评论

## Capabilities

### New Capabilities

- `comment-create`: 任何角色（提交者、调度者、完成者）可以在工单详情页发表评论，后端校验角色权限并记录评论人和时间
- `comment-list`: 工单详情页展示评论列表，按时间正序排列，包含作者、内容、时间

### Modified Capabilities

<!-- No existing spec requirements are changing -->

## Impact

- **数据库**: `workorders` 表无变更；新增 `comments` 表
- **后端**: 新增路由 `routes/comments.ts`，注册到 `main.ts`
- **前端**: `WorkOrderDetail.tsx` 新增评论区区域；`api.ts` 新增评论相关函式
- **无 BREAKING 变更**：现有 API 和页面不受影响
