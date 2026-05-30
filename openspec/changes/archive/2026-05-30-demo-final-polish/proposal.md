## Why

explore 发现全部 6 个问题：退回不能编辑内容、UI入口错位、列表无高亮、缺已撤回Tab、完成者看未分派工单、API非法值返回500。集中修复。

## What Changes

- 新增 PATCH /edit 端点支持退回后编辑工单内容
- 修正处理中→退回待提交UI入口(完成者→调度者)
- 提交者列表退回高亮+已撤回Tab
- 完成者去待处理Tab
- POST /workorders 加type/priority枚举校验

## Capabilities

### Modified Capabilities
- `workorder-create`: 退回后可编辑内容
- `workorder-assign`: 调度者可直接退处理中工单
- `workorder-list-browse`: 退回高亮+已撤回Tab
- `workorder-resolve`: 去待处理Tab

## Impact

- 后端: `PATCH /edit`、POST type/priority校验
- 前端: WorkOrderDetail(编辑模式)、DispatcherView/ResolverView/WorkOrderList(UI修正)
