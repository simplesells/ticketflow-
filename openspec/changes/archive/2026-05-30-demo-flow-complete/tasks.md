# Tasks

## 1. 后端数据库 + 类型

- [x] 1.1 新增3个状态：退回待提交、退回处理、已撤回
- [x] 1.2 workorders 表新增 return_reason 列
- [x] 1.3 TypeScript WorkOrderStatus 和 WorkOrder 接口同步更新

## 2. 后端路由

- [x] 2.1 完整流转规则（8状态，12条合法路径）
- [x] 2.2 退回操作校验 returnReason 必填
- [x] 2.3 调度者拒绝(待处理→已关闭)校验原因必填
- [x] 2.4 重开(已关闭→待处理)校验原因/证明材料必填
- [x] 2.5 分派时自动清理 returnReason 并变更状态

## 3. 前端组件

- [x] 3.1 types.ts 同步新状态和 returnReason 字段
- [x] 3.2 ResolverView: 新流转规则 + 退回原因输入列 + 退回待提交
- [x] 3.3 DispatcherView: 待分派/退回待提交/已分派三区域 + 拒绝按钮 + 退回按钮
- [x] 3.4 WorkOrderList: 新增3个状态筛选Tab
- [x] 3.5 WorkOrderDetail: 全流转操作按钮 + 原因输入 + 历史展示原因
