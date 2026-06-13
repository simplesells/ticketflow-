import { Router, Request, Response } from 'express';
import { requireRole, AuthRequest } from '../middleware/requireRole';
import db, { generateCode, rowToWorkOrder, WorkOrderStatus, createNotification } from '../db/database';
import { findUserByDisplayName } from '../models/user';

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

const RETURN_TARGETS: WorkOrderStatus[] = ['退回待分派', '退回待提交', '退回处理'];
const VALID_TYPES = ['咨询', '报修', '建议', '投诉'];
const VALID_PRIORITIES = ['低', '中', '高', '紧急'];

function ok(from: WorkOrderStatus, to: WorkOrderStatus): boolean { return TRANSITIONS[from]?.includes(to) ?? false; }
function isReturn(t: WorkOrderStatus): boolean { return RETURN_TARGETS.includes(t); }

const router = Router();

router.get('/', requireRole(['submitter', 'dispatcher', 'resolver']), async (req: Request, res: Response) => {
  const { status, assignee } = req.query;
  let q = 'SELECT * FROM workorders WHERE 1=1';
  const args: any[] = [];
  if (status && typeof status === 'string') { q += ' AND status = ?'; args.push(status); }
  if (assignee && typeof assignee === 'string') { q += ' AND assignee = ?'; args.push(assignee); }
  q += ' ORDER BY id DESC';
  const r = await db.execute(q, args);
  res.json(r.rows.map(rowToWorkOrder));
});

router.get('/:id', requireRole(['submitter', 'dispatcher', 'resolver']), async (req: Request, res: Response) => {
  const r = await db.execute('SELECT * FROM workorders WHERE id = ?', [String(req.params.id)]);
  if (!r.rows[0]) { res.status(404).json({ error: '工单不存在' }); return; }
  res.json(rowToWorkOrder(r.rows[0]));
});

router.post('/', requireRole(['submitter']), async (req: AuthRequest, res: Response) => {
  const { title, description, type, priority } = req.body;
  if (!title || !description || !type || !priority) { res.status(400).json({ error: '缺少必填字段：title, description, type, priority' }); return; }
  if (!VALID_TYPES.includes(type)) { res.status(400).json({ error: `无效的工单类型: ${type}` }); return; }
  if (!VALID_PRIORITIES.includes(priority)) { res.status(400).json({ error: `无效的优先级: ${priority}` }); return; }
  const now = new Date().toISOString();
  const code = await generateCode();
  const submitter = req.user?.displayName || '匿名';
  const initialHistory = JSON.stringify([{ status: '待处理', operator: submitter, time: now }]);
  const result = await db.execute(
    'INSERT INTO workorders (code, title, description, type, priority, status, submitter, history, created_at, updated_at) VALUES (?, ?, ?, ?, ?, \'待处理\', ?, ?, ?, ?)',
    [code, title, description, type, priority, submitter, initialHistory, now, now],
  );
  const r = await db.execute('SELECT * FROM workorders WHERE id = ?', [Number(result.lastInsertRowid)]);
  res.status(201).json(rowToWorkOrder(r.rows[0]));
});

router.patch('/:id/status', requireRole(['submitter', 'resolver', 'dispatcher']), async (req: AuthRequest, res: Response) => {
  const r = await db.execute('SELECT * FROM workorders WHERE id = ?', [String(req.params.id)]);
  const row = r.rows[0] as any;
  if (!row) { res.status(404).json({ error: '工单不存在' }); return; }

  const { status: newStatus, returnReason } = req.body;
  if (!newStatus) { res.status(400).json({ error: '缺少 status 字段' }); return; }
  const cur = row.status as WorkOrderStatus;
  if (!ok(cur, newStatus)) { res.status(400).json({ error: `不允许的状态变更：${cur} → ${newStatus}`, allowed: TRANSITIONS[cur] }); return; }
  if (isReturn(newStatus) && (!returnReason || !returnReason.trim())) { res.status(400).json({ error: '退回操作必须填写原因（returnReason）' }); return; }
  if (newStatus === '已解决' && (!returnReason || !returnReason.trim())) { res.status(400).json({ error: '标记已解决必须填写处理说明（returnReason）' }); return; }
  if ((cur === '待处理' || cur === '退回待分派') && newStatus === '已关闭' && (!returnReason || !returnReason.trim())) { res.status(400).json({ error: '拒绝工单必须填写原因（returnReason）' }); return; }
  if (cur === '已关闭' && newStatus === '待处理' && (!returnReason || !returnReason.trim())) { res.status(400).json({ error: '重开工单必须填写证明材料/原因（returnReason）' }); return; }

  const w = rowToWorkOrder(row);
  const he: any = { status: newStatus, operator: req.user?.displayName || 'system', time: new Date().toISOString() };
  if (returnReason) he.reason = returnReason;
  const nh = JSON.stringify([...w.history, he]);
  const now = new Date().toISOString();
  const rv = returnReason || '';

  await db.execute('UPDATE workorders SET status = ?, return_reason = ?, history = ?, updated_at = ? WHERE id = ?', [newStatus, rv, nh, now, String(req.params.id)]);

  const uid = req.user!.id;
  const recips = new Set<number>();
  const sub = findUserByDisplayName(w.submitter);
  if (sub && sub.id !== uid) recips.add(sub.id);
  const asn = findUserByDisplayName(w.assignee);
  if (asn && asn.id !== uid) recips.add(asn.id);
  for (const ri of recips) await createNotification({ userId: ri, workorderId: w.id, type: 'status_change', message: `工单 ${w.code} 状态变更为"${newStatus}"` });

  const upd = (await db.execute('SELECT * FROM workorders WHERE id = ?', [String(req.params.id)])).rows[0] as any;
  res.json(rowToWorkOrder(upd));
});

router.patch('/:id/edit', requireRole(['submitter']), async (req: Request, res: Response) => {
  const r = await db.execute('SELECT * FROM workorders WHERE id = ?', [String(req.params.id)]);
  const row = r.rows[0] as any;
  if (!row) { res.status(404).json({ error: '工单不存在' }); return; }
  if (row.status !== '退回待提交' && row.status !== '待处理') { res.status(400).json({ error: `当前状态"${row.status}"不允许编辑` }); return; }
  const { title, description } = req.body;
  if (!title || !description) { res.status(400).json({ error: '标题和描述不能为空' }); return; }
  const now = new Date().toISOString();
  await db.execute('UPDATE workorders SET title = ?, description = ?, updated_at = ? WHERE id = ?', [title, description, now, String(req.params.id)]);
  const upd = (await db.execute('SELECT * FROM workorders WHERE id = ?', [String(req.params.id)])).rows[0] as any;
  res.json(rowToWorkOrder(upd));
});

router.patch('/:id/assign', requireRole(['dispatcher']), async (req: AuthRequest, res: Response) => {
  const r = await db.execute('SELECT * FROM workorders WHERE id = ?', [String(req.params.id)]);
  const row = r.rows[0] as any;
  if (!row) { res.status(404).json({ error: '工单不存在' }); return; }
  const { assignee } = req.body;
  if (!assignee || typeof assignee !== 'string') { res.status(400).json({ error: '缺少 assignee 字段' }); return; }
  const ALLOW = ['待处理', '退回待分派', '退回待提交', '退回处理', '处理中'];
  if (!ALLOW.includes(row.status)) { res.status(400).json({ error: `当前状态"${row.status}"不允许分派操作` }); return; }

  const w = rowToWorkOrder(row);
  const he: any = { status: '处理中', operator: req.user?.displayName || 'system', time: new Date().toISOString() };
  const nh = JSON.stringify([...w.history, he]);
  const now = new Date().toISOString();

  await db.execute('UPDATE workorders SET assignee = ?, status = ?, history = ?, return_reason = \'\', updated_at = ? WHERE id = ?', [assignee, '处理中', nh, now, String(req.params.id)]);

  const asnUser = findUserByDisplayName(assignee);
  if (asnUser) await createNotification({ userId: asnUser.id, workorderId: w.id, type: 'assign', message: `工单 ${w.code} 已分派给你` });

  const upd = (await db.execute('SELECT * FROM workorders WHERE id = ?', [String(req.params.id)])).rows[0] as any;
  res.json(rowToWorkOrder(upd));
});

export default router;
