import { useEffect, useState } from 'react';
import { fetchWorkOrders, assignWorkOrder } from './api';
import type { WorkOrder } from './types';

export default function DispatcherView() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [assignName, setAssignName] = useState('');

  const load = () => {
    fetchWorkOrders().then(setOrders).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAssign = async (id: number) => {
    if (!assignName.trim()) return;
    setAssigning(id);
    try {
      await assignWorkOrder(id, assignName.trim());
      setAssignName('');
      load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setAssigning(null);
    }
  };

  if (loading) return <p style={{ padding: 24 }}>加载中...</p>;

  const unassigned = orders.filter(w => !w.assignee);
  const assigned = orders.filter(w => w.assignee);

  return (
    <div style={{ padding: 24 }}>
      <h2>调度者工作台</h2>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>分派待处理工单给处理人</p>

      <h3>待分派工单 ({unassigned.length})</h3>
      {unassigned.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>所有工单已分派</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 32 }}>
          <thead>
            <tr style={{ background: '#fef3c7', textAlign: 'left' }}>
              <th style={{ padding: 10 }}>工单号</th>
              <th style={{ padding: 10 }}>标题</th>
              <th style={{ padding: 10 }}>类型</th>
              <th style={{ padding: 10 }}>优先级</th>
              <th style={{ padding: 10 }}>状态</th>
              <th style={{ padding: 10 }}>分派给</th>
              <th style={{ padding: 10 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {unassigned.map(wo => (
              <tr key={wo.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: 10 }}>{wo.code}</td>
                <td style={{ padding: 10 }}>{wo.title}</td>
                <td style={{ padding: 10 }}>{wo.type}</td>
                <td style={{ padding: 10 }}>{wo.priority}</td>
                <td style={{ padding: 10 }}>{wo.status}</td>
                <td style={{ padding: 10 }}>
                  <input
                    placeholder="处理人姓名"
                    style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: 4, width: 100 }}
                    onChange={e => setAssignName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAssign(wo.id); }}
                  />
                </td>
                <td style={{ padding: 10 }}>
                  <button
                    onClick={() => handleAssign(wo.id)}
                    disabled={assigning === wo.id}
                    style={{ padding: '4px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                  >
                    {assigning === wo.id ? '...' : '分派'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>已分派工单 ({assigned.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#dbeafe', textAlign: 'left' }}>
            <th style={{ padding: 10 }}>工单号</th>
            <th style={{ padding: 10 }}>标题</th>
            <th style={{ padding: 10 }}>状态</th>
            <th style={{ padding: 10 }}>处理人</th>
          </tr>
        </thead>
        <tbody>
          {assigned.map(wo => (
            <tr key={wo.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: 10 }}>{wo.code}</td>
              <td style={{ padding: 10 }}>{wo.title}</td>
              <td style={{ padding: 10 }}>{wo.status}</td>
              <td style={{ padding: 10, fontWeight: 500 }}>{wo.assignee}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
