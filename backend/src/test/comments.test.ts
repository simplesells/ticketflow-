import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { app, initDB } from '../main';
import db from '../db/database';

async function clearData() {
  await db.execute('DELETE FROM comments');
  await db.execute('DELETE FROM notifications');
  await db.execute('DELETE FROM workorders');
}

async function seedWorkOrder(): Promise<number> {
  const now = new Date().toISOString();
  const result = await db.execute({
    sql: 'INSERT INTO workorders (code, title, description, type, priority, status, history, created_at, updated_at) VALUES (?, ?, ?, ?, ?, \'待处理\', \'[]\', ?, ?)',
    args: ['WO-TEST-0001', '测试工单', '测试描述', '咨询', '中', now, now],
  });
  return Number(result.lastInsertRowid);
}

beforeAll(async () => { await initDB(); });

describe('GET /api/workorders/:id/comments', () => {
  let woId: number;
  beforeEach(async () => { await clearData(); woId = await seedWorkOrder(); });

  it('无评论时返回空数组', async () => {
    const res = await request(app).get(`/api/workorders/${woId}/comments`).set('x-user-id', '1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('返回工单的所有评论按时间正序', async () => {
    await db.execute({ sql: 'INSERT INTO comments (workorder_id, content, author, created_at) VALUES (?, ?, ?, ?)', args: [woId, '第一条', '赵明', '2026-06-01T10:00:00.000Z'] });
    await db.execute({ sql: 'INSERT INTO comments (workorder_id, content, author, created_at) VALUES (?, ?, ?, ?)', args: [woId, '第二条', '钱勇', '2026-06-01T11:00:00.000Z'] });
    const res = await request(app).get(`/api/workorders/${woId}/comments`).set('x-user-id', '1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].content).toBe('第一条');
    expect(res.body[1].content).toBe('第二条');
  });

  it('工单不存在返回 404', async () => {
    const res = await request(app).get('/api/workorders/99999/comments').set('x-user-id', '1');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('工单不存在');
  });

  it('未登录返回 401', async () => {
    const res = await request(app).get(`/api/workorders/${woId}/comments`);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/workorders/:id/comments', () => {
  let woId: number;
  beforeEach(async () => { await clearData(); woId = await seedWorkOrder(); });

  it('发表评论成功', async () => {
    const res = await request(app).post(`/api/workorders/${woId}/comments`).set('x-user-id', '1').send({ content: '请问什么时候处理？' });
    expect(res.status).toBe(201);
    expect(res.body.content).toBe('请问什么时候处理？');
    expect(res.body.author).toBe('赵明');
    expect(res.body.id).toBeDefined();
  });

  it('调度者也可以发表评论', async () => {
    const res = await request(app).post(`/api/workorders/${woId}/comments`).set('x-user-id', '2').send({ content: '已分派处理' });
    expect(res.status).toBe(201);
    expect(res.body.author).toBe('钱勇');
  });

  it('内容为空返回 400', async () => {
    const res = await request(app).post(`/api/workorders/${woId}/comments`).set('x-user-id', '1').send({ content: '' });
    expect(res.status).toBe(400);
  });

  it('内容仅空格视为空', async () => {
    const res = await request(app).post(`/api/workorders/${woId}/comments`).set('x-user-id', '1').send({ content: '   ' });
    expect(res.status).toBe(400);
  });

  it('内容超过 2000 字符返回 400', async () => {
    const res = await request(app).post(`/api/workorders/${woId}/comments`).set('x-user-id', '1').send({ content: 'x'.repeat(2001) });
    expect(res.status).toBe(400);
  });

  it('工单不存在返回 404', async () => {
    const res = await request(app).post('/api/workorders/99999/comments').set('x-user-id', '1').send({ content: 'hello' });
    expect(res.status).toBe(404);
  });

  it('未登录返回 401', async () => {
    const res = await request(app).post(`/api/workorders/${woId}/comments`).send({ content: 'hello' });
    expect(res.status).toBe(401);
  });

  it('发表后可在列表中查到', async () => {
    await request(app).post(`/api/workorders/${woId}/comments`).set('x-user-id', '1').send({ content: '测试留言' });
    const res = await request(app).get(`/api/workorders/${woId}/comments`).set('x-user-id', '1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].content).toBe('测试留言');
  });
});
