import { Router, Response } from 'express';
import { requireRole, AuthRequest } from '../middleware/requireRole';
import db, { rowToNotification } from '../db/database';

const router = Router();

// GET /api/notifications
router.get('/', requireRole(['submitter', 'dispatcher', 'resolver']), async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const r = await db.execute({ sql: 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', args: [userId] });
  res.json(r.rows.map(rowToNotification));
});

// GET /api/notifications/unread-count
router.get('/unread-count', requireRole(['submitter', 'dispatcher', 'resolver']), async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const r = await db.execute({ sql: 'SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0', args: [userId] });
  res.json({ count: (r.rows[0] as any).c });
});

// PATCH /api/notifications/read-all（必须在 /:id/read 之前）
router.patch('/read-all', requireRole(['submitter', 'dispatcher', 'resolver']), async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  await db.execute({ sql: 'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', args: [userId] });
  res.json({ ok: true });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireRole(['submitter', 'dispatcher', 'resolver']), async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const result = await db.execute({ sql: 'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', args: [req.params.id, userId] });
  if (result.rowsAffected === 0) { res.status(404).json({ error: '通知不存在' }); return; }
  res.json({ ok: true });
});

export default router;
