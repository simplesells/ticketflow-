import { Router, Request, Response } from 'express';
import { requireRole } from '../middleware/requireRole';
import db, { rowToTemplate } from '../db/database';

const router = Router();
const VALID_TYPES = ['咨询', '报修', '建议', '投诉'];
const VALID_PRIORITIES = ['低', '中', '高', '紧急'];

router.get('/', requireRole(['submitter', 'dispatcher', 'resolver']), async (_req: Request, res: Response) => {
  const r = await db.execute('SELECT * FROM form_templates ORDER BY id ASC');
  res.json(r.rows.map(rowToTemplate));
});

router.post('/', requireRole(['dispatcher']), async (req: Request, res: Response) => {
  const { name, titleHint, descriptionHint, type, priority } = req.body;
  if (!name || !type || !priority) { res.status(400).json({ error: '缺少必填字段：name, type, priority' }); return; }
  if (!VALID_TYPES.includes(type)) { res.status(400).json({ error: `无效的工单类型: ${type}` }); return; }
  if (!VALID_PRIORITIES.includes(priority)) { res.status(400).json({ error: `无效的优先级: ${priority}` }); return; }
  const result = await db.execute(
    'INSERT INTO form_templates (name, title_hint, description_hint, type, priority) VALUES (?, ?, ?, ?, ?)',
    [name, titleHint || '', descriptionHint || '', type, priority],
  );
  const r = await db.execute('SELECT * FROM form_templates WHERE id = ?', [Number(result.lastInsertRowid)]);
  res.status(201).json(rowToTemplate(r.rows[0]));
});

router.put('/:id', requireRole(['dispatcher']), async (req: Request, res: Response) => {
  const existing = await db.execute('SELECT * FROM form_templates WHERE id = ?', [String(req.params.id)]);
  if (!existing.rows[0]) { res.status(404).json({ error: '模板不存在' }); return; }
  const { name, titleHint, descriptionHint, type, priority } = req.body;
  if (!name || !type || !priority) { res.status(400).json({ error: '缺少必填字段：name, type, priority' }); return; }
  if (!VALID_TYPES.includes(type)) { res.status(400).json({ error: `无效的工单类型: ${type}` }); return; }
  if (!VALID_PRIORITIES.includes(priority)) { res.status(400).json({ error: `无效的优先级: ${priority}` }); return; }
  await db.execute(
    'UPDATE form_templates SET name = ?, title_hint = ?, description_hint = ?, type = ?, priority = ? WHERE id = ?',
    [name, titleHint || '', descriptionHint || '', type, priority, String(req.params.id)],
  );
  const r = await db.execute('SELECT * FROM form_templates WHERE id = ?', [String(req.params.id)]);
  res.json(rowToTemplate(r.rows[0]));
});

router.delete('/:id', requireRole(['dispatcher']), async (req: Request, res: Response) => {
  const existing = await db.execute('SELECT * FROM form_templates WHERE id = ?', [String(req.params.id)]);
  if (!existing.rows[0]) { res.status(404).json({ error: '模板不存在' }); return; }
  await db.execute('DELETE FROM form_templates WHERE id = ?', [String(req.params.id)]);
  res.json({ ok: true });
});

export default router;
