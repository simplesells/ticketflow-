import { Router, Response } from 'express';
import { requireRole, AuthRequest } from '../middleware/requireRole';
import db, { rowToNotification } from '../db/database';

const router = Router();

// GET /api/notifications — 获取当前用户的通知列表
router.get('/', requireRole(['submitter', 'dispatcher', 'resolver']), (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const rows = db.prepare(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC'
  ).all(userId);
  res.json(rows.map(rowToNotification));
});

// GET /api/notifications/unread-count — 未读数量
router.get('/unread-count', requireRole(['submitter', 'dispatcher', 'resolver']), (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const row = db.prepare(
    'SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0'
  ).get(userId) as { c: number };
  res.json({ count: row.c });
});

// PATCH /api/notifications/read-all — 全部已读（必须在 /:id/read 之前注册，否则 /:id 会拦截 "read-all"）
router.patch('/read-all', requireRole(['submitter', 'dispatcher', 'resolver']), (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(userId);
  res.json({ ok: true });
});

// PATCH /api/notifications/:id/read — 标记单条已读
router.patch('/:id/read', requireRole(['submitter', 'dispatcher', 'resolver']), (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const result = db.prepare(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?'
  ).run(req.params.id, userId);
  if (result.changes === 0) {
    res.status(404).json({ error: '通知不存在' });
    return;
  }
  res.json({ ok: true });
});

export default router;
