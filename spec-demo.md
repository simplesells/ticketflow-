# TicketFlow Demo - 功能规格说明 (Spec)

## 项目背景
TicketFlow 是一个企业级工单流转系统。此Demo为第一阶段，目标是建立一个可运行的最小产品，包含工单的创建、查看和状态变更功能。

## 技术选型
- **前端**: React 18 + Vite + TypeScript
- **后端**: Node.js + Express + TypeScript
- **数据库**: SQLite（开发环境，无需安装外置数据库）
- **状态管理**: React Context（Demo阶段够用）
- **UI组件**: 原生HTML + 简单CSS（保持简洁，不引入额外框架）

## Demo阶段功能范围

### 1. 工单创建
- 用户可以在表单中填写工单信息
- 必填字段：标题、描述、工单类型（咨询/报修/建议/投诉）
- 可选字段：优先级（低/中/高/紧急）
- 提交流后显示成功提示

### 2. 工单列表
- 以表格形式展示所有工单
- 显示字段：工单号、标题、类型、优先级、状态、创建时间
- 支持按状态筛选（全部/待处理/处理中/已解决/已关闭）

### 3. 工单详情
- 点击列表中的工单可查看详情
- 展示完整工单信息
- 可变更工单状态

### 4. 工单状态流转
- 初始状态：待处理
- 可选状态值：待处理 → 处理中 → 已解决 → 已关闭
- 状态变更时记录变更操作

## Demo阶段不做
- 用户认证系统（MVP阶段实现）
- 多用户权限控制
- 工作流模板管理
- 评论功能
- 通知功能

## 工单数据模型

```typescript
interface WorkOrder {
  id: number;
  code: string;          // 工单号，如 WO-20260527-0001
  title: string;
  description: string;
  type: '咨询' | '报修' | '建议' | '投诉';
  priority: '低' | '中' | '高' | '紧急';
  status: '待处理' | '处理中' | '已解决' | '已关闭';
  history: { status: string; time: string }[];
  createdAt: string;
  updatedAt: string;
}
```

## API设计

### 后端路由
```
GET    /api/workorders       - 获取工单列表（支持状态筛选）
POST   /api/workorders       - 创建工单
GET    /api/workorders/:id   - 获取工单详情
PUT    /api/workorders/:id   - 更新工单
GET    /api/workorders/new   - 获取新建表单（Demo页）
POST   /api/workorders/new   - 提交新工单（Demo页）
```
