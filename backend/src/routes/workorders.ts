import { Router, Request, Response } from 'express';
import db, { generateCode, rowToWorkOrder, WorkOrderStatus } from '../db/database';


const TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  '待处理': ['处理中'],
  '处理中': ['已解决'],
  '已解决': ['已关闭'],
  '已关闭': [],
};

function isValidTransition(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
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
  if (!row) {
    res.status(404).json({ error: '工单不存在' });
    return;
  }
  res.json(rowToWorkOrder(row));
});

router.post('/', (req: Request, res: Response) => {
  const { title, description, type, priority } = req.body;
  if (!title || !description || !type || !priority) {
    res.status(400).json({ error: '缺少必填字段：title, description, type, priority' });
    return;
  }
  const now = new Date().toISOString();
  const code = generateCode();
  const result = db.prepare(`
    INSERT INTO workorders (code, title, description, type, priority, status, history, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, '待处理', '[]', ?, ?)
  `).run(code, title, description, type, priority, now, now);
  const row = db.prepare('SELECT * FROM workorders WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(rowToWorkOrder(row));
});

router.delete('/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM workorders WHERE id = ?').get(req.params.id);
  if (!row) {
    res.status(404).json({ error: '工单不存在' });
    return;
  }
  db.prepare('DELETE FROM workorders WHERE id = ?').run(req.params.id);
  res.json({ message: '删除成功' });
});

router.patch('/:id/status', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM workorders WHERE id = ?').get(req.params.id) as any;
  if (!row) {
    res.status(404).json({ error: '工单不存在' });
    return;
  }
  const { status: newStatus } = req.body;
  if (!newStatus) {
    res.status(400).json({ error: '缺少 status 字段' });
    return;
  }
  const currentStatus = row.status as WorkOrderStatus;
  if (!isValidTransition(currentStatus, newStatus)) {
    res.status(400).json({
      error: `不允许的状态变更：${currentStatus} → ${newStatus}`,
      allowed: TRANSITIONS[currentStatus],
    });
    return;
  }
  const w = rowToWorkOrder(row);
  const historyEntry = { status: newStatus, operator: 'system', time: new Date().toISOString() };
  const newHistory = JSON.stringify([...w.history, historyEntry]);
  const now = new Date().toISOString();
  db.prepare('UPDATE workorders SET status = ?, history = ?, updated_at = ? WHERE id = ?')
    .run(newStatus, newHistory, now, req.params.id);
  const updated = db.prepare('SELECT * FROM workorders WHERE id = ?').get(req.params.id) as any;
  res.json(rowToWorkOrder(updated));
});

router.patch('/:id/assign', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM workorders WHERE id = ?').get(req.params.id) as any;
  if (!row) { res.status(404).json({ error: '工单不存在' }); return; }
  const { assignee } = req.body;
  if (!assignee || typeof assignee !== 'string') {
    res.status(400).json({ error: '缺少 assignee 字段' });
    return;
  }
  const w = rowToWorkOrder(row);
  const historyEntry = { status: w.status, operator: `指派: ${assignee}`, time: new Date().toISOString() };
  const newHistory = JSON.stringify([...w.history, historyEntry]);
  const now = new Date().toISOString();
  db.prepare('UPDATE workorders SET assignee = ?, history = ?, updated_at = ? WHERE id = ?')
    .run(assignee, newHistory, now, req.params.id);
  const updated = db.prepare('SELECT * FROM workorders WHERE id = ?').get(req.params.id) as any;
  res.json(rowToWorkOrder(updated));
});

export default router;
