import { Router, Request, Response } from 'express';
import { requireRole } from '../middleware/requireRole';
import db, { rowToTemplate } from '../db/database';

const router = Router();

const VALID_TYPES = ['咨询', '报修', '建议', '投诉'];
const VALID_PRIORITIES = ['低', '中', '高', '紧急'];

// GET /api/templates — 所有角色均可查看
router.get('/', requireRole(['submitter', 'dispatcher', 'resolver']), (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM form_templates ORDER BY id ASC').all();
  res.json(rows.map(rowToTemplate));
});

// POST /api/templates — 仅调度者可创建
router.post('/', requireRole(['dispatcher']), (req: Request, res: Response) => {
  const { name, titleHint, descriptionHint, type, priority } = req.body;
  if (!name || !type || !priority) {
    res.status(400).json({ error: '缺少必填字段：name, type, priority' });
    return;
  }
  if (!VALID_TYPES.includes(type)) { res.status(400).json({ error: `无效的工单类型: ${type}` }); return; }
  if (!VALID_PRIORITIES.includes(priority)) { res.status(400).json({ error: `无效的优先级: ${priority}` }); return; }
  const result = db.prepare(
    'INSERT INTO form_templates (name, title_hint, description_hint, type, priority) VALUES (?, ?, ?, ?, ?)'
  ).run(name, titleHint || '', descriptionHint || '', type, priority);
  const row = db.prepare('SELECT * FROM form_templates WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(rowToTemplate(row));
});

// PUT /api/templates/:id — 仅调度者可编辑
router.put('/:id', requireRole(['dispatcher']), (req: Request, res: Response) => {
  const existing = db.prepare('SELECT * FROM form_templates WHERE id = ?').get(req.params.id);
  if (!existing) { res.status(404).json({ error: '模板不存在' }); return; }
  const { name, titleHint, descriptionHint, type, priority } = req.body;
  if (!name || !type || !priority) {
    res.status(400).json({ error: '缺少必填字段：name, type, priority' });
    return;
  }
  if (!VALID_TYPES.includes(type)) { res.status(400).json({ error: `无效的工单类型: ${type}` }); return; }
  if (!VALID_PRIORITIES.includes(priority)) { res.status(400).json({ error: `无效的优先级: ${priority}` }); return; }
  db.prepare(
    'UPDATE form_templates SET name = ?, title_hint = ?, description_hint = ?, type = ?, priority = ? WHERE id = ?'
  ).run(name, titleHint || '', descriptionHint || '', type, priority, req.params.id);
  const row = db.prepare('SELECT * FROM form_templates WHERE id = ?').get(req.params.id);
  res.json(rowToTemplate(row));
});

// DELETE /api/templates/:id — 仅调度者可删除
router.delete('/:id', requireRole(['dispatcher']), (req: Request, res: Response) => {
  const existing = db.prepare('SELECT * FROM form_templates WHERE id = ?').get(req.params.id);
  if (!existing) { res.status(404).json({ error: '模板不存在' }); return; }
  db.prepare('DELETE FROM form_templates WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
