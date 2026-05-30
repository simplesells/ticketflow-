import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWorkOrders } from './api';
import type { WorkOrder, WorkOrderStatus } from './types';

const STATUS_TABS: { label: string; value: WorkOrderStatus | '' }[] = [
  { label: '全部', value: '' },
  { label: '待处理', value: '待处理' },
  { label: '处理中', value: '处理中' },
  { label: '已解决', value: '已解决' },
  { label: '已关闭', value: '已关闭' },
  { label: '退回待提交', value: '退回待提交' },
  { label: '已撤回', value: '已撤回' },
];

const PRIORITY_COLORS: Record<string, string> = {
  '紧急': '#dc2626',
  '高': '#ea580c',
  '中': '#ca8a04',
  '低': '#16a34a',
};

export default function WorkOrderList() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWorkOrders(filter ? { status: filter } : undefined)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>工单列表</h1>
        <Link to="/new" style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', textDecoration: 'none' }}>
          + 新建工单
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {STATUS_TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            style={{
              padding: '6px 14px',
              border: filter === value ? '2px solid #2563eb' : '1px solid #d1d5db',
              borderRadius: 20,
              background: filter === value ? '#dbeafe' : '#fff',
              cursor: 'pointer',
              fontWeight: filter === value ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>加载中...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
              <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>工单号</th>
              <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>标题</th>
              <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>提交人</th>
              <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>类型</th>
              <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>优先级</th>
              <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>状态</th>
              <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>原因</th>
              <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>创建时间</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((wo) => (
              <tr key={wo.id} style={{ borderBottom: '1px solid #f3f4f6', background: wo.status === '退回待提交' ? '#fef2f2' : wo.status === '已撤回' ? '#f9fafb' : 'transparent' }}>
                <td style={{ padding: 10 }}>
                  <Link to={`/${wo.id}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                    {wo.code}
                  </Link>
                </td>
                <td style={{ padding: 10 }}>{wo.title}</td>
                <td style={{ padding: 10, color: '#374151' }}>{wo.submitter || '匿名'}</td>
                <td style={{ padding: 10 }}>{wo.type}</td>
                <td style={{ padding: 10, color: PRIORITY_COLORS[wo.priority], fontWeight: 600 }}>{wo.priority}</td>
                <td style={{ padding: 10 }}>{wo.status}</td>
                <td style={{ padding: 10, color: '#dc2626', fontSize: 12 }}>{wo.returnReason || '-'}</td>
                <td style={{ padding: 10, color: '#6b7280', fontSize: 13 }}>{new Date(wo.createdAt).toLocaleDateString('zh-CN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && orders.length === 0 && <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>暂无工单</p>}
    </div>
  );
}
