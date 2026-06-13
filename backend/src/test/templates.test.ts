import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../main';
import db from '../db/database';

function clearTemplates() {
  db.exec('DELETE FROM form_templates');
}

describe('GET /api/templates', () => {
  beforeEach(() => clearTemplates());

  it('返回所有模板', async () => {
    db.prepare('INSERT INTO form_templates (name, title_hint, description_hint, type, priority) VALUES (?, ?, ?, ?, ?)')
      .run('测试模板', '测试标题', '', '咨询', '中');

    const res = await request(app)
      .get('/api/templates')
      .set('x-user-id', '1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('测试模板');
    expect(res.body[0].type).toBe('咨询');
  });

  it('所有角色均可查看', async () => {
    const res = await request(app).get('/api/templates').set('x-user-id', '3');
    expect(res.status).toBe(200);
  });
});

describe('POST /api/templates', () => {
  beforeEach(() => clearTemplates());

  it('调度者可以创建模板', async () => {
    const res = await request(app)
      .post('/api/templates')
      .set('x-user-id', '2')
      .send({ name: '新模板', type: '报修', priority: '高' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('新模板');
  });

  it('提交者不能创建模板', async () => {
    const res = await request(app)
      .post('/api/templates')
      .set('x-user-id', '1')
      .send({ name: 'x', type: '咨询', priority: '中' });

    expect(res.status).toBe(403);
  });

  it('缺少必填字段返回 400', async () => {
    const res = await request(app)
      .post('/api/templates')
      .set('x-user-id', '2')
      .send({ name: 'x' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/templates/:id', () => {
  let tid: number;

  beforeEach(() => {
    clearTemplates();
    const r = db.prepare('INSERT INTO form_templates (name, title_hint, description_hint, type, priority) VALUES (?, ?, ?, ?, ?)')
      .run('旧名称', '', '', '咨询', '中');
    tid = Number(r.lastInsertRowid);
  });

  it('调度者可以编辑模板', async () => {
    const res = await request(app)
      .put(`/api/templates/${tid}`)
      .set('x-user-id', '2')
      .send({ name: '新名称', type: '报修', priority: '高' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('新名称');
    expect(res.body.type).toBe('报修');
  });
});

describe('DELETE /api/templates/:id', () => {
  let tid: number;

  beforeEach(() => {
    clearTemplates();
    const r = db.prepare('INSERT INTO form_templates (name, title_hint, description_hint, type, priority) VALUES (?, ?, ?, ?, ?)')
      .run('待删除', '', '', '咨询', '中');
    tid = Number(r.lastInsertRowid);
  });

  it('调度者可以删除模板', async () => {
    const res = await request(app)
      .delete(`/api/templates/${tid}`)
      .set('x-user-id', '2');

    expect(res.status).toBe(200);

    const list = await request(app).get('/api/templates').set('x-user-id', '1');
    expect(list.body).toHaveLength(0);
  });

  it('提交者不能删除模板', async () => {
    const res = await request(app)
      .delete(`/api/templates/${tid}`)
      .set('x-user-id', '1');

    expect(res.status).toBe(403);
  });
});
