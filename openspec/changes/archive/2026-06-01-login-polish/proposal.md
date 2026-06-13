## Why

B1 和 B2 修了数据和安全的硬伤，系统已正确可用。但前端仍有两处硬编码（完成者列表、登录 fetch URL），三视图缺少登出按钮，两份 spec 与代码实际行为不一致（状态变更权限声明、流转规则描述）。最后一个打磨阶段，把这些零散问题一并收掉。

## What Changes

- 完成者列表从前端硬编码改为调 `GET /api/auth?role=resolver` 动态获取
- 三视图（提交者列表、调度者工作台、完成者工作台）各加退出登录按钮
- LoginPage 的 fetch 调用统一走 `api.ts` 封装，不再直接写 URL
- `role-guard` spec：状态变更端点权限声明从"仅完成者"修正为"三种角色均可"
- `workorder-resolve` spec：权限修正 + 流转规则从 3 状态升级到完整 8 状态
- `config.yaml`：后端端口号从 5678 修正为 5680

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `role-guard`: 状态变更接口的角色要求从"仅完成者"改为"三种角色均可"，补充三个角色的正向场景
- `workorder-resolve`: 权限修正为三种角色；流转规则从 demo 阶段 3 状态升级到完整 8 状态，与 `demo-flow-complete` 对齐

## Impact

- 前端: `api.ts`（新 `loginUser`/`fetchResolvers`）、`LoginPage.tsx`（用封装函数）、`WorkOrderList.tsx`（+登出按钮）、`DispatcherView.tsx`（API 化 + 登出）、`ResolverView.tsx`（API 化 + 登出）
- 后端: 无代码改动
- Spec: `role-guard/spec.md`（MODIFIED）、`workorder-resolve/spec.md`（MODIFIED）
- 配置: `openspec/config.yaml`（端口号修正）
