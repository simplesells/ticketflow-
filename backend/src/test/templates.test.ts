import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { app, initDB } from '../main';
import db from '../db/database';

async function clearTemplates() {
  await db.execute('DELETE FROM form_templates');
}

async function seedOne(): Promise<number> {
  const r = await db.execute({
    sql: 'INSERT INTO form_templates (name, title_hint, description_hint, type, priority) VALUES (?, ?, ?, ?, ?)',
    args: ['测试模板', '测试标题', '测试描述', '咨询', '中'],
  });
  return Number(r.lastInsertRowid);
}

beforeAll(async () => { await initDB(); });

describe('GET /api/templates', () => {
  beforeEach(async () => { await clearTemplates(); });

  it('返回模板列表', async () => {
    await seedOne();
    const res = await request(app).get('/api/templates').set('x-user-id', '1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('测试模板');
  });

  it('空列表返回空数组', async () => {
    const res = await request(app).get('/api/templates').set('x-user-id', '1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('未登录返回 401', async () => {
    const res = await request(app).get('/api/templates');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/templates', () => {
  beforeEach(async () => { await clearTemplates(); });

  it('调度者可创建模板', async () => {
    const res = await request(app).post('/api/templates').set('x-user-id', '2').send({ name: '新模板', type: '报修', priority: '高' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('新模板');
  });

  it('提交者不能创建模板', async () => {
    const res = await request(app).post('/api/templates').set('x-user-id', '1').send({ name: 'x', type: '报修', priority: '高' });
    expect(res.status).toBe(403);
  });

  it('缺少必填字段返回 400', async () => {
    const res = await request(app).post('/api/templates').set('x-user-id', '2').send({ name: 'x' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/templates/:id', () => {
  let tid: number;
  beforeEach(async () => { await clearTemplates(); tid = await seedOne(); });

  it('调度者可编辑模板', async () => {
    const res = await request(app).put(`/api/templates/${tid}`).set('x-user-id', '2').send({ name: '改后名', type: '投诉', priority: '低' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('改后名');
  });

  it('模板不存在返回 404', async () => {
    const res = await request(app).put('/api/templates/999').set('x-user-id', '2').send({ name: 'x', type: '咨询', priority: '中' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/templates/:id', () => {
  let tid: number;
  beforeEach(async () => { await clearTemplates(); tid = await seedOne(); });

  it('调度者可删除模板', async () => {
    const res = await request(app).delete(`/api/templates/${tid}`).set('x-user-id', '2');
    expect(res.status).toBe(200);
    const list = await request(app).get('/api/templates').set('x-user-id', '1');
    expect(list.body).toHaveLength(0);
  });

  it('提交者不能删除模板', async () => {
    const res = await request(app).delete(`/api/templates/${tid}`).set('x-user-id', '1');
    expect(res.status).toBe(403);
  });
});
