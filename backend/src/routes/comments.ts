import { Router, Request, Response } from 'express';
import { requireRole, AuthRequest } from '../middleware/requireRole';
import db, { rowToComment, createNotification } from '../db/database';
import { findUserByDisplayName } from '../models/user';

const MAX_CONTENT_LENGTH = 2000;

const router = Router();

// GET /api/workorders/:id/comments — 获取评论列表
router.get('/:id/comments', requireRole(['submitter', 'dispatcher', 'resolver']), (req: Request, res: Response) => {
  const wo = db.prepare('SELECT id FROM workorders WHERE id = ?').get(req.params.id);
  if (!wo) { res.status(404).json({ error: '工单不存在' }); return; }

  const rows = db.prepare('SELECT * FROM comments WHERE workorder_id = ? ORDER BY created_at ASC').all(req.params.id);
  res.json(rows.map(rowToComment));
});

// POST /api/workorders/:id/comments — 发表评论
router.post('/:id/comments', requireRole(['submitter', 'dispatcher', 'resolver']), (req: AuthRequest, res: Response) => {
  const wo = db.prepare('SELECT id FROM workorders WHERE id = ?').get(req.params.id);
  if (!wo) { res.status(404).json({ error: '工单不存在' }); return; }

  const { content } = req.body;
  if (!content || !String(content).trim()) {
    res.status(400).json({ error: '评论内容不能为空' });
    return;
  }

  if (String(content).length > MAX_CONTENT_LENGTH) {
    res.status(400).json({ error: `评论内容不能超过${MAX_CONTENT_LENGTH}字` });
    return;
  }

  const author = req.user?.displayName || '匿名';
  const now = new Date().toISOString();
  const result = db.prepare(
    'INSERT INTO comments (workorder_id, content, author, created_at) VALUES (?, ?, ?, ?)'
  ).run(req.params.id, String(content).trim(), author, now);

  const row = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);

  // 通知工单相关人员（排除评论者自己）
  const currentUserId = req.user!.id;
  const woRow = db.prepare('SELECT submitter, assignee, code FROM workorders WHERE id = ?').get(req.params.id) as any;
  if (woRow) {
    const recipients = new Set<number>();
    // 提交者
    const sub = findUserByDisplayName(woRow.submitter);
    if (sub && sub.id !== currentUserId) recipients.add(sub.id);
    // 处理人
    const asn = findUserByDisplayName(woRow.assignee);
    if (asn && asn.id !== currentUserId) recipients.add(asn.id);
    // 创建通知
    const msg = `${author} 评论了工单 ${woRow.code}`;
    recipients.forEach(uid => createNotification({ userId: uid, workorderId: Number(req.params.id), type: 'comment', message: msg }));
  }

  res.status(201).json(rowToComment(row));
});

export default router;
