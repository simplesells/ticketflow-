## Context

已有工单列表页面（frontend-scaffold），现在需要实现创建、详情查看、状态变更操作，完成前后端交互闭环。

## Goals / Non-Goals

**Goals:**
- 工单创建表单 → 提交后跳转到详情
- 工单详情页 → 展示完整信息 + 状态历史
- 详情页直接变更状态
- 列表页通过筛选定位工单

**Non-Goals:**
- 图片/文件上传
- 工单编辑（修改标题、描述等）
- 分页

## Decisions

| # | Decision | Rationale | Alternatives Considered |
|---|---------|----------|-------------------------|
| 1 | 表单验证用原生 HTML required | 无需额外依赖 | react-hook-form, 手动校验 |
| 2 | 详情页新增路由 `/:id` | RESTful 风格 | 模态框弹出 |
| 3 | 状态变更按钮根据当前状态动态显示 | 防止用户操作非法状态 |

## Risks / Trade-offs

- [Risk] 无错误边界 → Mitigation: Demo 阶段容错即可
