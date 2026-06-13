import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../main';
import db from '../db/database';

function clearData() {
  db.exec('DELETE FROM notifications');
  db.exec('DELETE FROM comments');
  db.exec('DELETE FROM workorders');
}

function seedWorkOrder(submitter?: string): number {
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO workorders (code, title, description, type, priority, status, submitter, history, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, '待处理', ?, '[]', ?, ?)
  `).run('WO-NTF-TEST', '通知测试', '描述', '咨询', '中', submitter || '', now, now);
  return Number(result.lastInsertRowid);
}

describe('GET /api/notifications', () => {
  let woId: number;

  beforeEach(() => {
    clearData();
    woId = seedWorkOrder();
  });

  it('无通知时返回空数组', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('x-user-id', '1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('返回当前用户的通知按时间倒序', async () => {
    db.prepare('INSERT INTO notifications (user_id, workorder_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(1, woId, 'comment', '早的消息', '2026-06-10T10:00:00.000Z');
    db.prepare('INSERT INTO notifications (user_id, workorder_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(1, woId, 'status_change', '晚的消息', '2026-06-10T11:00:00.000Z');

    const res = await request(app)
      .get('/api/notifications')
      .set('x-user-id', '1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].message).toBe('晚的消息');
    expect(res.body[1].message).toBe('早的消息');
  });

  it('只返回当前用户的通知', async () => {
    db.prepare('INSERT INTO notifications (user_id, workorder_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(1, woId, 'comment', '用户1的通知', new Date().toISOString());
    db.prepare('INSERT INTO notifications (user_id, workorder_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(2, woId, 'comment', '用户2的通知', new Date().toISOString());

    const res = await request(app)
      .get('/api/notifications')
      .set('x-user-id', '1');

    expect(res.body).toHaveLength(1);
    expect(res.body[0].message).toBe('用户1的通知');
  });

  it('未登录返回 401', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/notifications/unread-count', () => {
  let woId: number;

  beforeEach(() => {
    clearData();
    woId = seedWorkOrder();
  });

  it('返回未读数量', async () => {
    db.prepare('INSERT INTO notifications (user_id, workorder_id, type, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)')
      .run(1, woId, 'comment', 'a', new Date().toISOString());
    db.prepare('INSERT INTO notifications (user_id, workorder_id, type, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)')
      .run(1, woId, 'comment', 'b', new Date().toISOString());
    db.prepare('INSERT INTO notifications (user_id, workorder_id, type, message, is_read, created_at) VALUES (?, ?, ?, ?, 1, ?)')
      .run(1, woId, 'comment', 'c', new Date().toISOString());

    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('x-user-id', '1');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });
});

describe('PATCH /api/notifications/:id/read', () => {
  let woId: number;

  beforeEach(() => {
    clearData();
    woId = seedWorkOrder();
  });

  it('标记单条已读', async () => {
    const r = db.prepare('INSERT INTO notifications (user_id, workorder_id, type, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)')
      .run(1, woId, 'comment', 'test', new Date().toISOString());
    const nid = Number(r.lastInsertRowid);

    const res = await request(app)
      .patch(`/api/notifications/${nid}/read`)
      .set('x-user-id', '1');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const countRes = await request(app)
      .get('/api/notifications/unread-count')
      .set('x-user-id', '1');
    expect(countRes.body.count).toBe(0);
  });

  it('通知不存在返回 404', async () => {
    const res = await request(app)
      .patch('/api/notifications/999/read')
      .set('x-user-id', '1');
    expect(res.status).toBe(404);
  });

  it('不能标记别人的通知', async () => {
    const r = db.prepare('INSERT INTO notifications (user_id, workorder_id, type, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)')
      .run(2, woId, 'comment', '用户2的通知', new Date().toISOString());
    const nid = Number(r.lastInsertRowid);

    const res = await request(app)
      .patch(`/api/notifications/${nid}/read`)
      .set('x-user-id', '1');

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/notifications/read-all', () => {
  let woId: number;

  beforeEach(() => {
    clearData();
    woId = seedWorkOrder();
  });

  it('全部已读', async () => {
    db.prepare('INSERT INTO notifications (user_id, workorder_id, type, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)')
      .run(1, woId, 'comment', 'a', new Date().toISOString());
    db.prepare('INSERT INTO notifications (user_id, workorder_id, type, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)')
      .run(1, woId, 'comment', 'b', new Date().toISOString());

    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('x-user-id', '1');

    expect(res.status).toBe(200);

    const countRes = await request(app)
      .get('/api/notifications/unread-count')
      .set('x-user-id', '1');
    expect(countRes.body.count).toBe(0);
  });

  it('只标记当前用户的通知', async () => {
    db.prepare('INSERT INTO notifications (user_id, workorder_id, type, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)')
      .run(1, woId, 'comment', '用户1', new Date().toISOString());
    db.prepare('INSERT INTO notifications (user_id, workorder_id, type, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)')
      .run(2, woId, 'comment', '用户2', new Date().toISOString());

    await request(app)
      .patch('/api/notifications/read-all')
      .set('x-user-id', '1');

    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('x-user-id', '2');
    expect(res.body.count).toBe(1);
  });
});

describe('通知创建（集成测试）', () => {
  beforeEach(() => clearData());

  it('评论后创建通知给提交者', async () => {
    // 赵明（id=1）创建工单
    const now = new Date().toISOString();
    const r = db.prepare(`
      INSERT INTO workorders (code, title, description, type, priority, status, submitter, history, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, '待处理', ?, '[]', ?, ?)
    `).run('WO-NTF-0002', '测试', 'desc', '咨询', '中', '赵明', now, now);
    const wid = Number(r.lastInsertRowid);

    // 钱勇（id=2）发表评论
    await request(app)
      .post(`/api/workorders/${wid}/comments`)
      .set('x-user-id', '2')
      .send({ content: '你好' });

    // 赵明应该收到通知
    const res = await request(app)
      .get('/api/notifications')
      .set('x-user-id', '1');

    expect(res.body.length).toBeGreaterThanOrEqual(1);
    const commentNtf = res.body.find((n: any) => n.type === 'comment');
    expect(commentNtf).toBeDefined();
  });

  it('评论者自己不会收到自己的评论通知', async () => {
    const now = new Date().toISOString();
    const r = db.prepare(`
      INSERT INTO workorders (code, title, description, type, priority, status, submitter, history, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, '待处理', ?, '[]', ?, ?)
    `).run('WO-NTF-0003', '测试2', 'desc', '咨询', '中', '赵明', now, now);
    const wid = Number(r.lastInsertRowid);

    // 赵明自己评论
    await request(app)
      .post(`/api/workorders/${wid}/comments`)
      .set('x-user-id', '1')
      .send({ content: '自评' });

    const res = await request(app)
      .get('/api/notifications')
      .set('x-user-id', '1');

    expect(res.body.length).toBe(0);
  });

  it('分派后创建通知给处理人', async () => {
    const now = new Date().toISOString();
    const r = db.prepare(`
      INSERT INTO workorders (code, title, description, type, priority, status, submitter, history, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, '待处理', ?, '[]', ?, ?)
    `).run('WO-NTF-0004', '测试3', 'desc', '咨询', '中', '赵明', now, now);
    const wid = Number(r.lastInsertRowid);

    // 钱勇（调度者）分派给孙强
    await request(app)
      .patch(`/api/workorders/${wid}/assign`)
      .set('x-user-id', '2')
      .send({ assignee: '孙强' });

    // 孙强（id=3）应收到通知
    const res = await request(app)
      .get('/api/notifications')
      .set('x-user-id', '3');

    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].type).toBe('assign');
  });
});
