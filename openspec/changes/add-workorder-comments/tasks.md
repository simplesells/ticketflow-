## 1. 数据库 & 后端路由

- [ ] 1.1 在 database.ts 新增 comments 表（id, workorder_id, content, author, created_at），加入建表 SQL 和迁移语句
- [ ] 1.2 新增 routes/comments.ts：实现 GET 和 POST 两个端点，含角色守卫和参数校验
- [ ] 1.3 在 main.ts 注册评论路由到 /api/workorders/:id/comments

## 2. 后端测试（红 → 绿）

- [ ] 2.1 编写 comments 路由测试（supertest + vitest），覆盖创建成功、空内容拒绝、工单不存在、列表查询、空列表
- [ ] 2.2 运行测试确认通过

## 3. 前端评论功能

- [ ] 3.1 在 api.ts 新增 fetchComments 和 createComment 两个 API 函式
- [ ] 3.2 在 WorkOrderDetail.tsx 新增评论区：评论列表展示 + 评论输入表单
