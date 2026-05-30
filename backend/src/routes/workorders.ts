import { Router, Request, Response } from 'express';
import db, { generateCode, rowToWorkOrder, WorkOrderStatus } from '../db/database';

// 流转规则: from → 可到达的 to
const TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  '待处理':   ['处理中', '已撤回', '已关闭', '退回待提交'],
  '处理中':   ['已解决', '退回待分派', '退回待提交'],
  '已解决':   ['已关闭', '退回处理'],
  '已关闭':   ['待处理'],
  '退回待分派': ['处理中', '已关闭', '退回待提交'],
  '退回待提交': ['待处理', '已撤回'],
  '退回处理':  ['已解决', '退回待分派'],
  '已撤回':   [],
};

// 哪些流转属于"退回"操作——必须填 returnReason
const RETURN_TARGETS: WorkOrderStatus[] = ['退回待分派', '退回待提交', '退回处理'];

// 调度者可直接拒绝（待处理→已关闭），也必须填原因
const REJECT_REQUIRES_REASON = true;

function isValidTransition(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

function isReturn(target: WorkOrderStatus): boolean {
  return RETURN_TARGETS.includes(target);
}

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { status, assignee } = req.query;
  let q = 'SELECT * FROM workorders WHERE 1=1';
  const params: any[] = [];
  if (status && typeof status === 'string') { q += ' AND status = ?'; params.push(status); }
  if (assignee && typeof assignee === 'string') { q += ' AND assignee = ?'; params.push(assignee); }
  q += ' ORDER BY id DESC';
  const rows = db.prepare(q).all(...params);
  res.json(rows.map(rowToWorkOrder));
});

router.get('/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM workorders WHERE id = ?').get(req.params.id);
  if (!row) { res.status(404).json({ error: '工单不存在' }); return; }
  res.json(rowToWorkOrder(row));
});

router.post('/', (req: Request, res: Response) => {
  const { title, description, type, priority, submitter } = req.body;
  if (!title || !description || !type || !priority) {
    res.status(400).json({ error: '缺少必填字段：title, description, type, priority' });
    return;
  }
  const VALID_TYPES = ['咨询', '报修', '建议', '投诉'];
  const VALID_PRIORITIES = ['低', '中', '高', '紧急'];
  if (!VALID_TYPES.includes(type)) { res.status(400).json({ error: `无效的工单类型: ${type}` }); return; }
  if (!VALID_PRIORITIES.includes(priority)) { res.status(400).json({ error: `无效的优先级: ${priority}` }); return; }
  const now = new Date().toISOString();
  const code = generateCode();
  const result = db.prepare(`
    INSERT INTO workorders (code, title, description, type, priority, status, submitter, history, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, '待处理', ?, '[]', ?, ?)
  `).run(code, title, description, type, priority, submitter || '匿名', now, now);
  const row = db.prepare('SELECT * FROM workorders WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(rowToWorkOrder(row));
});

router.patch('/:id/status', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM workorders WHERE id = ?').get(req.params.id) as any;
  if (!row) { res.status(404).json({ error: '工单不存在' }); return; }

  const { status: newStatus, returnReason } = req.body;
  if (!newStatus) { res.status(400).json({ error: '缺少 status 字段' }); return; }

  const currentStatus = row.status as WorkOrderStatus;
  if (!isValidTransition(currentStatus, newStatus)) {
    res.status(400).json({ error: `不允许的状态变更：${currentStatus} → ${newStatus}`, allowed: TRANSITIONS[currentStatus] });
    return;
  }

  // 退回操作必须填原因
  if (isReturn(newStatus) && (!returnReason || !returnReason.trim())) {
    res.status(400).json({ error: '退回操作必须填写原因（returnReason）' });
    return;
  }

  // 标记已解决必须填处理说明
  if (newStatus === '已解决' && (!returnReason || !returnReason.trim())) {
    res.status(400).json({ error: '标记已解决必须填写处理说明（returnReason）' });
    return;
  }

  // 调度者拒绝（待处理→已关闭 / 退回待分派→已关闭）
  if ((currentStatus === '待处理' || currentStatus === '退回待分派') && newStatus === '已关闭' && (!returnReason || !returnReason.trim())) {
    res.status(400).json({ error: '拒绝工单必须填写原因（returnReason）' });
    return;
  }

  // 重开(已关闭→待处理)必须附带原因
  if (currentStatus === '已关闭' && newStatus === '待处理' && (!returnReason || !returnReason.trim())) {
    res.status(400).json({ error: '重开工单必须填写证明材料/原因（returnReason）' });
    return;
  }

  const w = rowToWorkOrder(row);
  const historyEntry: any = { status: newStatus, operator: 'system', time: new Date().toISOString() };
  if (returnReason) historyEntry.reason = returnReason;

  const newHistory = JSON.stringify([...w.history, historyEntry]);
  const now = new Date().toISOString();
  const reasonVal = returnReason || '';

  db.prepare('UPDATE workorders SET status = ?, return_reason = ?, history = ?, updated_at = ? WHERE id = ?')
    .run(newStatus, reasonVal, newHistory, now, req.params.id);

  const updated = db.prepare('SELECT * FROM workorders WHERE id = ?').get(req.params.id) as any;
  res.json(rowToWorkOrder(updated));
});

router.patch('/:id/edit', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM workorders WHERE id = ?').get(req.params.id) as any;
  if (!row) { res.status(404).json({ error: '工单不存在' }); return; }
  // Only allow editing when in 退回待提交 or 待处理
  if (row.status !== '退回待提交' && row.status !== '待处理') {
    res.status(400).json({ error: `当前状态"${row.status}"不允许编辑` });
    return;
  }
  const { title, description } = req.body;
  if (!title || !description) { res.status(400).json({ error: '标题和描述不能为空' }); return; }
  const now = new Date().toISOString();
  db.prepare('UPDATE workorders SET title = ?, description = ?, updated_at = ? WHERE id = ?')
    .run(title, description, now, req.params.id);
  const updated = db.prepare('SELECT * FROM workorders WHERE id = ?').get(req.params.id) as any;
  res.json(rowToWorkOrder(updated));
});

router.patch('/:id/assign', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM workorders WHERE id = ?').get(req.params.id) as any;
  if (!row) { res.status(404).json({ error: '工单不存在' }); return; }
  const { assignee } = req.body;
  if (!assignee || typeof assignee !== 'string') { res.status(400).json({ error: '缺少 assignee 字段' }); return; }

  const ALLOW_ASSIGN: WorkOrderStatus[] = ['待处理', '退回待分派', '退回待提交', '退回处理', '处理中'];
  if (!ALLOW_ASSIGN.includes(row.status)) {
    res.status(400).json({ error: `当前状态"${row.status}"不允许分派操作` });
    return;
  }

  const w = rowToWorkOrder(row);
  // 处理中转交：状态不变只换人
  const isTransfer = row.status === '处理中';
  const newStatus: WorkOrderStatus = isTransfer ? '处理中'
    : '处理中';

  const actionLabel = isTransfer ? `转交: ${row.assignee || '无人'} → ${assignee}` : `指派: ${assignee}`;
  const historyEntry: any = { status: newStatus, operator: actionLabel, time: new Date().toISOString() };
  const newHistory = JSON.stringify([...w.history, historyEntry]);
  const now = new Date().toISOString();

  db.prepare('UPDATE workorders SET assignee = ?, status = ?, history = ?, return_reason = \'\', updated_at = ? WHERE id = ?')
    .run(assignee, newStatus, newHistory, now, req.params.id);

  const updated = db.prepare('SELECT * FROM workorders WHERE id = ?').get(req.params.id) as any;
  res.json(rowToWorkOrder(updated));
});

export default router;
