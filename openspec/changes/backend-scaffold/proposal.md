## Why

从零开始，需要搭建后端项目骨架和 SQLite 数据库。完成此步后能启动 Express 服务，为后续 API 开发提供基础。

## What Changes

- 初始化 TypeScript + Express 项目 (package.json, tsconfig.json)
- 创建目录结构 (src/routes, src/db)
- 安装 Express, better-sqlite3, 及开发依赖
- 配置热重载 (tsx 开发 runner)
- 创建主入口文件启动 HTTP 服务在端口 3000

## Capabilities

### New Capabilities
- `backend-project`: 可启动的 Express + TS 项目基础

### Modified Capabilities

## Impact

- 新增 `backend/` 目录及基础 TS/Express 项目结构
- 安装 Express, better-sqlite3, tsx, 类型定义等 npm 依赖
