import { useEffect, useState } from 'react';
import { fetchWorkOrders, updateWorkOrderStatus, fetchResolvers } from './api';
import { useAuth } from './AuthContext';
import NotificationBell from './NotificationBell';
import type { WorkOrder, WorkOrderStatus } from './types';


const NEXT_STATUS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  '待处理': [], '处理中': ['已解决', '退回待分派'], '已解决': [], '已关闭': [],
  '退回待分派': [], '退回待提交': [], '退回处理': ['已解决', '退回待分派'], '已撤回': [],
};

const REASON_REQUIRED: WorkOrderStatus[] = ['已解决', '退回待分派'];

const TABS = [
  { key: 'progress' as const, label: '处理中', color: '#3b82f6', match: (s: WorkOrderStatus) => s === '处理中' },
  { key: 'rework' as const, label: '退回重做', color: '#dc2626', match: (s: WorkOrderStatus) => s === '退回处理' },
  { key: 'resolved' as const, label: '已解决', color: '#10b981', match: (s: WorkOrderStatus) => s === '已解决' },
  { key: 'closed' as const, label: '已关闭', color: '#6b7280', match: (s: WorkOrderStatus) => s === '已关闭' },
];

export default function ResolverView() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [resolvers, setResolvers] = useState<{ id: number; displayName: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolver, setResolver] = useState(user?.displayName || '');
  const [tab, setTab] = useState('progress');
  const [acting, setActing] = useState<Record<number, boolean>>({});
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [selectedStatus, setSelectedStatus] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchResolvers().then(data => {
      setResolvers(data);
      setResolver(prev => prev || data[0]?.displayName || '');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchWorkOrders({ assignee: resolver }).then(setOrders).finally(() => setLoading(false));
  }, [resolver]);

  const doStatus = async (wo: WorkOrder) => {
    const newStatus = (selectedStatus[wo.id] || NEXT_STATUS[wo.status][0]) as WorkOrderStatus;
    if (!newStatus) return;
    if (REASON_REQUIRED.includes(newStatus) && !(reasons[wo.id] || '').trim()) {
      alert('此操作必须填写说明');
      return;
    }
    setActing(p => ({ ...p, [wo.id]: true }));
    try { await updateWorkOrderStatus(wo.id, newStatus, reasons[wo.id] || ''); }
    catch (e: any) { alert(e.message); return; }
    setOrders(prev => prev.map(w => w.id === wo.id ? { ...w, status: newStatus } : w));
    setActing(p => ({ ...p, [wo.id]: false }));
  };

  if (loading) return <p style={{ padding: 24 }}>加载中...</p>;

  const activeTab = TABS.find(t => t.key === tab)!;
  const filtered = orders.filter(w => activeTab.match(w.status));

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>完成者工作台</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <NotificationBell />
          <button onClick={logout} style={{ padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13 }}>退出登录</button>
        </div>
      </div>
      <p style={{ color: '#6b7280', marginBottom: 12 }}>选择处理人，查看和处理工单</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {resolvers.map(r => (
          <button key={r.id} onClick={() => setResolver(r.displayName)} style={{
            padding: '6px 20px', borderRadius: 20,
            border: resolver === r.displayName ? '2px solid #2563eb' : '1px solid #d1d5db',
            background: resolver === r.displayName ? '#dbeafe' : '#fff',
            cursor: 'pointer', fontWeight: resolver === r.displayName ? 600 : 400,
          }}>{r.displayName}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map(t => {
          const count = orders.filter(w => t.match(w.status)).length;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '6px 14px', borderRadius: 20,
              border: tab === t.key ? `2px solid ${t.color}` : '1px solid #d1d5db',
              background: tab === t.key ? t.color + '18' : '#fff',
              cursor: 'pointer', fontWeight: tab === t.key ? 600 : 400, fontSize: 13,
            }}>{t.label} ({count})</button>
          );
        })}
      </div>

      {filtered.length === 0 ? <p style={{ color: '#9ca3af' }}>{resolver} 暂无{activeTab.label}工单</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: activeTab.color + '18' }}>
            <th style={{ padding: 10, textAlign: 'left', fontSize: 13 }}>工单号</th>
            <th style={{ padding: 10, textAlign: 'left', fontSize: 13 }}>标题</th>
            <th style={{ padding: 10, textAlign: 'left', fontSize: 13 }}>提交人</th>
            {(tab === 'progress' || tab === 'rework') && <th style={{ padding: 10, textAlign: 'left', fontSize: 13 }}>退回原因</th>}
            <th style={{ padding: 10, textAlign: 'left', fontSize: 13 }}>操作</th>
          </tr></thead>
          <tbody>
            {filtered.map(wo => {
              const nextStatuses = NEXT_STATUS[wo.status];
              const needsReason = nextStatuses.some(s => REASON_REQUIRED.includes(s));
              return (
                <tr key={wo.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: 10, fontSize: 13 }}>{wo.code}</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{wo.title}</td>
                  <td style={{ padding: 10, fontSize: 13 }}>{wo.submitter || '匿名'}</td>
                  {(tab === 'progress' || tab === 'rework') && (
                    <td style={{ padding: 10, fontSize: 12 }}>{wo.returnReason || '-'}</td>
                  )}
                  <td style={{ padding: 10 }}>
                    {nextStatuses.length > 0 ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                          value={selectedStatus[wo.id] || nextStatuses[0]}
                          onChange={e => setSelectedStatus(p => ({ ...p, [wo.id]: e.target.value }))}
                          style={{ padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12 }}>
                          {nextStatuses.map(s => (
                            <option key={s} value={s}>{s === '已解决' ? '处理完成' : s === '退回待分派' ? '退回调度者' : s}</option>
                          ))}
                        </select>
                        {needsReason && (
                          <input placeholder={nextStatuses.includes('已解决') ? '处理说明（必填）' : '退回原因（必填）'}
                            value={reasons[wo.id] || ''}
                            onChange={e => setReasons(p => ({ ...p, [wo.id]: e.target.value }))}
                            style={{ padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 4, width: 120, fontSize: 11 }} />
                        )}
                        <button onClick={() => doStatus(wo)} disabled={acting[wo.id]}
                          style={{ padding: '4px 10px', background: activeTab.color, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                          {acting[wo.id] ? '...' : '执行'}
                        </button>
                      </div>
                    ) : <span style={{ color: '#9ca3af', fontSize: 12 }}>-</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
