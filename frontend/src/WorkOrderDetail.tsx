import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchWorkOrder, updateWorkOrderStatus } from './api';
import type { WorkOrder, WorkOrderStatus } from './types';

const NEXT_STATUS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  '待处理': ['处理中'],
  '处理中': ['已解决'],
  '已解决': ['已关闭'],
  '已关闭': [],
};

const STATUS_COLORS: Record<string, string> = {
  '待处理': '#f59e0b',
  '处理中': '#3b82f6',
  '已解决': '#10b981',
  '已关闭': '#6b7280',
};

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [wo, setWo] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    fetchWorkOrder(Number(id))
      .then(setWo)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleStatusChange = async (newStatus: WorkOrderStatus) => {
    if (!wo) return;
    setUpdating(true);
    try {
      const updated = await updateWorkOrderStatus(wo.id, newStatus);
      setWo(updated);
    } catch (e: any) {
      alert(e.message || '状态更新失败');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p style={{ padding: 24 }}>加载中...</p>;
  if (!wo) return <p style={{ padding: 24, color: '#dc2626' }}>工单不存在</p>;

  const nextStatuses = NEXT_STATUS[wo.status];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: 14 }}>&larr; 返回列表</Link>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0 }}>{wo.title}</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0' }}>{wo.code} &middot; 创建于 {new Date(wo.createdAt).toLocaleString('zh-CN')}</p>
        </div>
        <span style={{
          padding: '4px 12px',
          borderRadius: 20,
          background: STATUS_COLORS[wo.status] + '20',
          color: STATUS_COLORS[wo.status],
          fontWeight: 600,
          fontSize: 14,
        }}>
          {wo.status}
        </span>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>描述</h3>
        <p style={{ color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{wo.description}</p>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
        <div><span style={{ color: '#6b7280' }}>类型：</span>{wo.type}</div>
        <div><span style={{ color: '#6b7280' }}>优先级：</span><strong>{wo.priority}</strong></div>
      </div>

      {nextStatuses.length > 0 && (
        <div style={{ marginTop: 24, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
          <h3 style={{ margin: '0 0 8px' }}>变更状态</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {nextStatuses.map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={updating}
                style={{
                  padding: '8px 20px',
                  background: STATUS_COLORS[s],
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {updating ? '...' : `标记为"${s}"`}
              </button>
            ))}
          </div>
        </div>
      )}

      {wo.history.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>状态历史</h3>
          <div style={{ borderLeft: '2px solid #e5e7eb', paddingLeft: 16 }}>
            {wo.history.map((h: any, i: number) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 500 }}>{h.status}</div>
                <div style={{ color: '#9ca3af', fontSize: 13 }}>{new Date(h.time).toLocaleString('zh-CN')} &middot; {h.operator}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
