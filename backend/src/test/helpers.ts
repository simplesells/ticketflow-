import request from 'supertest';
import { app } from '../main';
import db from '../db/database';

// 清除所有工单数据（每次测试前重置）
export function clearData() {
  db.exec('DELETE FROM workorders');
}

// 创建测试用的 express app（避免多测试共享状态）
export function getTestApp() {
  // supertest 需要 app 导出
  return request(app);
}
