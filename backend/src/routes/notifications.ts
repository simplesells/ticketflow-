import { Router, Response } from 'express';
import { requireRole, AuthRequest } from '../middleware/requireRole';
import db, { rowToNotification } from '../db/database';

const router = Router();

router.get('/', requireRole(['submitter', 'dispatcher', 'resolver']), async (req: AuthRequest, res: Response) => {
  const r = await db.execute('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.user!.id]);
  res.json(r.rows.map(rowToNotification));
});

router.get('/unread-count', requireRole(['submitter', 'dispatcher', 'resolver']), async (req: AuthRequest, res: Response) => {
  const r = await db.execute('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0', [req.user!.id]);
  res.json({ count: (r.rows[0] as any).c });
});

router.patch('/read-all', requireRole(['submitter', 'dispatcher', 'resolver']), async (req: AuthRequest, res: Response) => {
  await db.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [req.user!.id]);
  res.json({ ok: true });
});

router.patch('/:id/read', requireRole(['submitter', 'dispatcher', 'resolver']), async (req: AuthRequest, res: Response) => {
  const result = await db.execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [String(req.params.id), req.user!.id]);
  if (result.rowsAffected === 0) { res.status(404).json({ error: '通知不存在' }); return; }
  res.json({ ok: true });
});

export default router;
