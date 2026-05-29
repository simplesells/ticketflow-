import { useEffect, useState } from 'react';
import { fetchWorkOrders, updateWorkOrderStatus } from './api';
import type { WorkOrder, WorkOrderStatus } from './types';

const NEXT_STATUS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  '待处理': ['处理中'],
  '处理中': ['已解决'],
  '已解决': ['已关闭'],
  '已关闭': [],
};

const RESOLVERS = ['张工', '李工', '王工'];

export default function ResolverView() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolver, setResolver] = useState(RESOLVERS[0]);
  const [updating, setUpdating] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetchWorkOrders({ assignee: resolver })
      .then(setOrders)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [resolver]);

  const handleStatusChange = async (wo: WorkOrder, newStatus: WorkOrderStatus) => {
    setUpdating(wo.id);
    try {
      await updateWorkOrderStatus(wo.id, newStatus);
      load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>完成者工作台</h2>
      <p style={{ color: '#6b7280', marginBottom: 16 }}>选择处理人，查看并处理分派给你的工单</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {RESOLVERS.map(r => (
          <button
            key={r}
            onClick={() => setResolver(r)}
            style={{
              padding: '6px 20px',
              border: resolver === r ? '2px solid #2563eb' : '1px solid #d1d5db',
              borderRadius: 20,
              background: resolver === r ? '#dbeafe' : '#fff',
              cursor: 'pointer',
              fontWeight: resolver === r ? 600 : 400,
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <p>加载中...</p>
      ) : orders.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>{resolver} 暂无待处理工单</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#dcfce7', textAlign: 'left' }}>
              <th style={{ padding: 10 }}>工单号</th>
              <th style={{ padding: 10 }}>标题</th>
              <th style={{ padding: 10 }}>类型</th>
              <th style={{ padding: 10 }}>优先级</th>
              <th style={{ padding: 10 }}>当前状态</th>
              <th style={{ padding: 10 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(wo => (
              <tr key={wo.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: 10 }}>{wo.code}</td>
                <td style={{ padding: 10 }}>{wo.title}</td>
                <td style={{ padding: 10 }}>{wo.type}</td>
                <td style={{ padding: 10 }}>{wo.priority}</td>
                <td style={{ padding: 10 }}>{wo.status}</td>
                <td style={{ padding: 10 }}>
                  {NEXT_STATUS[wo.status].map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(wo, s)}
                      disabled={updating === wo.id}
                      style={{ padding: '4px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 6 }}
                    >
                      {updating === wo.id ? '...' : `标记"${s}"`}
                    </button>
                  ))}
                  {NEXT_STATUS[wo.status].length === 0 && <span style={{ color: '#9ca3af' }}>已完成</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
