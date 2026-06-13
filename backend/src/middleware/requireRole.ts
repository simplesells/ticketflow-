import { Request, Response, NextFunction } from 'express';
import { findUserById } from '../models/user';

export interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string; displayName: string };
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ error: '当前角色不允许此操作' });
      return;
    }

    req.user = user;
    next();
  };
}
