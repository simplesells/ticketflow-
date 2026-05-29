## ADDED Requirements

### Requirement: Express 服务可启动并监听指定端口
系统 SHALL 启动 Express 服务器并在端口 3000 监听 HTTP 请求。

#### Scenario: 服务启动成功
- **WHEN** 执行 `npm run dev`
- **THEN** 服务启动并监听端口 3000
- **THEN** 控制台输出端口信息

### Requirement: 健康检查接口
系统 SHALL 提供 `/health` 端点用于服务可用性检查。

#### Scenario: 访问健康检查
- **WHEN** GET 请求 `/health`
- **THEN** 返回 JSON `{"status": "ok"}`
- **THEN** HTTP 状态码为 200

### Requirement: 环境端口可配置
系统 SHALL 支持通过环境变量 `PORT` 配置监听端口，默认值为 3000。

#### Scenario: 自定义端口
- **WHEN** 设置环境变量 `PORT=4000` 并启动服务
- **THEN** 服务监听端口 4000

### Requirement: CORS 中间件可跨域
系统 SHALL 配置 CORS 中间件，允许前端开发服务器跨域请求。

#### Scenario: 前端跨域访问
- **WHEN** 来自 `http://localhost:5173` 的请求
- **THEN** 响应头包含 `Access-Control-Allow-Origin` 允许该来源

### Requirement: TypeScript 项目配置就绪
系统 SHALL 提供完整的 TypeScript 配置文件及 npm scripts。

#### Scenario: TypeScript 编译
- **WHEN** 执行 `npx tsc --noEmit`
- **THEN** 无编译错误
