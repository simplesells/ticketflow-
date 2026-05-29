## Context

从零搭建后端。需要 TypeScript + Express 项目 + SQLite 数据库，作为后续工单 API 的基础设施。目标是 `npm run dev` 启动后，端口 3000 HTTP 服务可访问。

## Goals / Non-Goals

**Goals:**
- Express 服务能启动在端口 3000
- 请求 `GET /health` 返回 JSON 响应
- `package.json` scripts 配置正确 (dev/start)
- TypeScript 配置文件就绪，tsx 热重载可用

**Non-Goals:**
- 数据库表创建（留给 workorder-api）
- 路由/API 实现（留给后续变更）
- 日志、错误处理、中间件（后续按需添加）

## Decisions

| # | Decision | Rationale | Alternatives Considered |
|---|---------|----------|-------------------------|
| 1 | tsx 作为 TS runner | 零配置，开发热重载支持好 | ts-node (慢), tsc + node (无热重载) |
| 2 | 目录结构 src/main.ts (入口) + src/db/ + src/routes/ | 清晰职责分离 | 直接在根目录 (扩展性差) |
| 3 | cors 中间件 | 前后端分离，前端 localhost:5173 跨域访问 | 反向代理 (DevServer 配置复杂) |

## Risks / Trade-offs

- [Risk] 无 lint/format 配置可能导致代码风格不一致 → Mitigation: Demo 阶段暂不引入，上线前再统一
