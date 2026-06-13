import { app, initDB } from '../main';
import db from '../db/database';

// 初始化数据库（测试前调用）
export async function setupDB() {
  await initDB();
}

// 清除所有数据
export async function clearData() {
  await db.execute('DELETE FROM notifications');
  await db.execute('DELETE FROM comments');
  await db.execute('DELETE FROM workorders');
}
