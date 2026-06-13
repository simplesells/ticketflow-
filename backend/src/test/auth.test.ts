import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import { app, initDB } from '../main';

beforeAll(async () => { await initDB(); });

describe('POST /api/auth/login', () => {
  it('登录成功返回用户信息', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'zhaoming', password: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('zhaoming');
    expect(res.body.role).toBe('submitter');
    expect(res.body.displayName).toBe('赵明');
  });

  it('密码错误返回 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'xiaoming', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('用户不存在返回 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'nobody', password: '123456' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('有效用户 ID 返回对应用户', async () => {
    const res = await request(app).get('/api/auth/me').set('x-user-id', '1');
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('zhaoming');
  });

  it('无效用户 ID 返回 401', async () => {
    const res = await request(app).get('/api/auth/me').set('x-user-id', '999');
    expect(res.status).toBe(401);
  });

  it('无 x-user-id 返回 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
