import { createClient } from '@libsql/client';

const dbUrl = process.env.TURSO_URL || 'file:tf4.db';
const db = createClient({ url: dbUrl, authToken: process.env.TURSO_TOKEN });

// 初始化表结构
export async function initDB() {
  if (dbUrl.startsWith('file:')) {
    await db.execute('PRAGMA journal_mode = WAL');
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS workorders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL CHECK(type IN ('咨询', '报修', '建议', '投诉')),
      priority TEXT NOT NULL CHECK(priority IN ('低', '中', '高', '紧急')),
      status TEXT NOT NULL DEFAULT '待处理' CHECK(status IN ('待处理', '处理中', '已解决', '已关闭', '退回待分派', '退回待提交', '退回处理', '已撤回')),
      assignee TEXT NOT NULL DEFAULT '',
      return_reason TEXT NOT NULL DEFAULT '',
      submitter TEXT NOT NULL DEFAULT '',
      history TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workorder_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workorder_id) REFERENCES workorders(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      workorder_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('comment', 'status_change', 'assign')),
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workorder_id) REFERENCES workorders(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS form_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      title_hint TEXT NOT NULL DEFAULT '',
      description_hint TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL CHECK(type IN ('咨询', '报修', '建议', '投诉')),
      priority TEXT NOT NULL CHECK(priority IN ('低', '中', '高', '紧急'))
    )
  `);
}

// ── 类型定义 ──

export interface Comment {
  id: number;
  workorderId: number;
  content: string;
  author: string;
  createdAt: string;
}

export function rowToComment(row: any): Comment {
  return {
    id: row.id,
    workorderId: row.workorder_id,
    content: row.content,
    author: row.author,
    createdAt: row.created_at,
  };
}

export type NotificationType = 'comment' | 'status_change' | 'assign';

export interface Notification {
  id: number;
  userId: number;
  workorderId: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function rowToNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    workorderId: row.workorder_id,
    type: row.type,
    message: row.message,
    isRead: row.is_read === 1,
    createdAt: row.created_at,
  };
}

export async function createNotification(params: {
  userId: number;
  workorderId: number;
  type: NotificationType;
  message: string;
}) {
  try {
    const now = new Date().toISOString();
    await db.execute({
      sql: 'INSERT INTO notifications (user_id, workorder_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)',
      args: [params.userId, params.workorderId, params.type, params.message, now],
    });
  } catch (e) {
    console.error('createNotification failed:', e);
  }
}

export interface FormTemplate {
  id: number;
  name: string;
  titleHint: string;
  descriptionHint: string;
  type: WorkOrderType;
  priority: WorkOrderPriority;
}

export function rowToTemplate(row: any): FormTemplate {
  return {
    id: row.id,
    name: row.name,
    titleHint: row.title_hint,
    descriptionHint: row.description_hint,
    type: row.type,
    priority: row.priority,
  };
}

export async function seedTemplates() {
  const r = await db.execute('SELECT COUNT(*) as c FROM form_templates');
  const count = r.rows[0]?.c as number;
  if (count > 0) return;
  const items = [
    { name: '打印机故障', title: '打印机无法打印', desc: '请描述打印机位置和故障现象', type: '报修', priority: '高' },
    { name: '设备申请', title: '申请新设备', desc: '请列出需要的设备型号和数量', type: '咨询', priority: '中' },
    { name: '网络故障', title: '网络无法访问', desc: '请说明网络故障范围和发生时间', type: '报修', priority: '紧急' },
    { name: '环境投诉', title: '办公环境问题', desc: '请描述具体问题（温度、噪音、卫生等）', type: '投诉', priority: '中' },
  ];
  for (const item of items) {
    await db.execute({
      sql: 'INSERT INTO form_templates (name, title_hint, description_hint, type, priority) VALUES (?, ?, ?, ?, ?)',
      args: [item.name, item.title, item.desc, item.type, item.priority],
    });
  }
}

export interface WorkOrderHistory {
  status: string;
  operator: string;
  time: string;
  reason?: string;
}

export type WorkOrderType = '咨询' | '报修' | '建议' | '投诉';
export type WorkOrderPriority = '低' | '中' | '高' | '紧急';
export type WorkOrderStatus = '待处理' | '处理中' | '已解决' | '已关闭' | '退回待分派' | '退回待提交' | '退回处理' | '已撤回';

export interface WorkOrder {
  id: number;
  code: string;
  title: string;
  description: string;
  type: WorkOrderType;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignee: string;
  returnReason: string;
  submitter: string;
  history: WorkOrderHistory[];
  createdAt: string;
  updatedAt: string;
}

export async function generateCode(): Promise<string> {
  const now = new Date();
  const ds = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const r = await db.execute('SELECT COUNT(*) as c FROM workorders');
  const count = r.rows[0]?.c as number;
  return `WO-${ds}-${pad(count + 1, 4)}`;
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0');
}

export function rowToWorkOrder(row: any): WorkOrder {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    type: row.type,
    priority: row.priority,
    status: row.status,
    assignee: row.assignee || '',
    returnReason: row.return_reason || '',
    submitter: row.submitter || '',
    history: typeof row.history === 'string' ? JSON.parse(row.history) : row.history,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default db;
