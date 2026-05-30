export type WorkOrderType = '咨询' | '报修' | '建议' | '投诉';
export type WorkOrderPriority = '低' | '中' | '高' | '紧急';
export type WorkOrderStatus = '待处理' | '处理中' | '已解决' | '已关闭' | '退回待分派' | '退回待提交' | '退回处理' | '已撤回';

export interface WorkOrderHistory {
  status: string;
  operator: string;
  time: string;
  reason?: string;
}

export interface WorkOrder {
  id: number;
  code: string;
  title: string;
  description: string;
  type: WorkOrderType;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignee: string;
  returnReason: string;
  submitter: string;
  history: WorkOrderHistory[];
  createdAt: string;
  updatedAt: string;
}
