import { Router, Response } from 'express';
import { requireRole, AuthRequest } from '../middleware/requireRole';
import db, { rowToComment, createNotification } from '../db/database';
import { findUserByDisplayName } from '../models/user';

const MAX_CONTENT_LENGTH = 2000;
const router = Router();

// GET /api/workorders/:id/comments
router.get('/:id/comments', requireRole(['submitter', 'dispatcher', 'resolver']), async (req, res: Response) => {
  const wid = String(req.params.id);
  const r = await db.execute('SELECT id FROM workorders WHERE id = ?', [wid]);
  if (!r.rows[0]) { res.status(404).json({ error: '工单不存在' }); return; }
  const rows = await db.execute('SELECT * FROM comments WHERE workorder_id = ? ORDER BY created_at ASC', [wid]);
  res.json(rows.rows.map(rowToComment));
});

// POST /api/workorders/:id/comments
router.post('/:id/comments', requireRole(['submitter', 'dispatcher', 'resolver']), async (req: AuthRequest, res: Response) => {
  const wid = String(req.params.id);
  const r = await db.execute('SELECT id FROM workorders WHERE id = ?', [wid]);
  if (!r.rows[0]) { res.status(404).json({ error: '工单不存在' }); return; }

  const { content } = req.body;
  if (!content || !String(content).trim()) { res.status(400).json({ error: '评论内容不能为空' }); return; }
  if (String(content).length > MAX_CONTENT_LENGTH) { res.status(400).json({ error: `评论内容不能超过${MAX_CONTENT_LENGTH}字` }); return; }

  const author = req.user?.displayName || '匿名';
  const now = new Date().toISOString();
  const result = await db.execute(
    'INSERT INTO comments (workorder_id, content, author, created_at) VALUES (?, ?, ?, ?)',
    [wid, String(content).trim(), author, now],
  );
  const row = (await db.execute('SELECT * FROM comments WHERE id = ?', [Number(result.lastInsertRowid)])).rows[0];

  // 通知工单相关人员
  const currentUserId = req.user!.id;
  const woR = await db.execute('SELECT submitter, assignee, code FROM workorders WHERE id = ?', [wid]);
  const woRow = woR.rows[0] as any;
  if (woRow) {
    const recipients = new Set<number>();
    const sub = findUserByDisplayName(woRow.submitter);
    if (sub && sub.id !== currentUserId) recipients.add(sub.id);
    const asn = findUserByDisplayName(woRow.assignee);
    if (asn && asn.id !== currentUserId) recipients.add(asn.id);
    const msg = `${author} 评论了工单 ${woRow.code}`;
    for (const uid of recipients) {
      await createNotification({ userId: uid, workorderId: Number(wid), type: 'comment', message: msg });
    }
  }

  res.status(201).json(rowToComment(row));
});

export default router;
