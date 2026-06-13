import { Router, Request, Response } from 'express';
import { findUserByUsername, findUserById, USERS } from '../models/user';

const router = Router();

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' });
    return;
  }

  const user = findUserByUsername(username);
  if (!user || user.password !== password) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }

  res.json({ id: user.id, username: user.username, role: user.role, displayName: user.displayName });
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    res.status(401).json({ error: '未登录' });
    return;
  }

  const user = findUserById(Number(userId));
  if (!user) {
    res.status(401).json({ error: '未登录' });
    return;
  }

  res.json({ id: user.id, username: user.username, role: user.role, displayName: user.displayName });
});

// GET /api/users?role=resolver
router.get('/', (req: Request, res: Response) => {
  const { role } = req.query;
  if (!role) {
    res.status(400).json({ error: '缺少 role 参数' });
    return;
  }

  const users = USERS.filter(u => u.role === role);

  res.json(users.map(u => ({ id: u.id, displayName: u.displayName, role: u.role })));
});

export default router;
