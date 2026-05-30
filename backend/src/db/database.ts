import Database, { Database as DatabaseType } from 'better-sqlite3';

const dbPath = 'tf4.db';
const db: DatabaseType = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
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

// migration: add columns if not exists (for existing DB)
try { db.exec('ALTER TABLE workorders ADD COLUMN assignee TEXT NOT NULL DEFAULT \'\''); } catch(e) {}
try { db.exec('ALTER TABLE workorders ADD COLUMN return_reason TEXT NOT NULL DEFAULT \'\''); } catch(e) {}
try { db.exec('ALTER TABLE workorders ADD COLUMN submitter TEXT NOT NULL DEFAULT \'\''); } catch(e) {}

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

export function generateCode(): string {
  const now = new Date();
  const ds = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const count = db.prepare('SELECT COUNT(*) as c FROM workorders').get() as { c: number };
  return `WO-${ds}-${pad(count.c + 1, 4)}`;
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
    history: JSON.parse(row.history),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default db;
