import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../main';
import db from '../db/database';

function clearData() {
  db.exec('DELETE FROM workorders');
}

describe('POST /api/auth/login', () => {
  beforeEach(() => clearData());

  it('登录成功返回用户信息', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'zhaoming', password: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.username).toBe('zhaoming');
    expect(res.body.role).toBe('submitter');
    expect(res.body.displayName).toBe('赵明');
  });

  it('密码错误返回 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'xiaoming', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('用户名或密码错误');
  });

  it('用户不存在返回 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: '123456' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('用户名或密码错误');
  });
});

describe('GET /api/auth/me', () => {
  it('有效用户 ID 返回对应用户', async () => {
    const res = await request(app).get('/api/auth/me').set('x-user-id', '1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.username).toBe('zhaoming');
    expect(res.body.role).toBe('submitter');
  });

  it('无效用户 ID 返回 401', async () => {
    const res = await request(app).get('/api/auth/me').set('x-user-id', '999');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('未登录');
  });

  it('无 x-user-id 返回 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('未登录');
  });
});
