## Why

当前工单流转历史（history）的 operator 字段全部写死为 `'system'`，无法区分谁做了什么操作。Change A 已引入用户登录与身份识别，但操作人信息未被写入历史记录。同时创建工单时不写初始 history，seed 数据中的"张工"不在用户模型中，导致完成者登录后查询不到自己名下的工单。

## What Changes

- 所有历史记录操作的 operator 从 `'system'` 改为 `req.user.displayName`（创建/分派/状态变更）
- 创建工单时写入初始 history 记录（`{status: '待处理', operator: '<提交者名>', time: ...}`）
- 用户模型中补加张工（resolver 角色），共 6 个硬编码用户
- Seed 数据中 assignee 与实际完成者对应关系修复

## Capabilities

### New Capabilities
- `history-operator`: 历史记录的 operator 字段记录实际操作人姓名，不再使用占位值

### Modified Capabilities
<!-- None — existing specs already require history recording; this change makes the operator value accurate without changing spec-level requirements -->

## Impact

- 后端: `src/routes/workorders.ts` — POST /、PATCH /:id/status、PATCH /:id/assign 三处 operator 赋值修改，POST / 增加初始 history 写入
- 后端: `src/models/user.ts` — 新增张工用户
- 后端: `src/db/seed.ts` — assignee 值与用户模型对齐
- 数据库: 无需迁移（字段结构不变）
- 测试: 现有 vitest 测试应无回归
