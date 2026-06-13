import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express, { Request, Response } from 'express';
import { requireRole } from '../middleware/requireRole';

function createTestApp() {
  const app = express();
  app.use(express.json());

  // 测试用路由
  app.get('/api/users', requireRole(['submitter', 'dispatcher', 'resolver']), (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/workorders', requireRole(['submitter']), (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.patch('/api/workorders/:id/assign', requireRole(['dispatcher']), (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.patch('/api/workorders/:id/status', requireRole(['submitter', 'resolver', 'dispatcher']), (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.patch('/api/workorders/:id/edit', requireRole(['submitter']), (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  return app;
}

describe('requireRole 中间件', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeAll(() => {
    app = createTestApp();
  });

  it('放行正确角色', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('x-user-id', '1');

    expect(res.status).toBe(200);
  });

  it('拒绝错误角色', async () => {
    // xiaoming (submitter) 尝试调只允许 dispatcher 的端点
    const res = await request(app)
      .patch('/api/workorders/1/assign')
      .set('x-user-id', '1');

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('当前角色不允许此操作');
  });

  it('拒绝未登录', async () => {
    const res = await request(app)
      .get('/api/users');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('未登录');
  });
});

describe('POST /api/workorders 仅提交者可调用', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeAll(() => {
    app = createTestApp();
  });

  it('提交者可以创建', async () => {
    const res = await request(app)
      .post('/api/workorders')
      .set('x-user-id', '1');

    expect(res.status).toBe(200);
  });

  it('调度者不能创建', async () => {
    const res = await request(app)
      .post('/api/workorders')
      .set('x-user-id', '2');

    expect(res.status).toBe(403);
  });

  it('完成者不能创建', async () => {
    const res = await request(app)
      .post('/api/workorders')
      .set('x-user-id', '3');

    expect(res.status).toBe(403);
  });
});
