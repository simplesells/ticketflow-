import { useEffect, useState } from 'react';
import { fetchWorkOrders, assignWorkOrder, updateWorkOrderStatus } from './api';
import type { WorkOrder, WorkOrderStatus } from './types';

const RESOLVERS = ['张工', '李工', '王工'];

const TABS = [
  { key: 'pending' as const, label: '待分派', color: '#d97706', filter: (w: WorkOrder) => !w.assignee || w.status === '退回待分派' },
  { key: 'progress' as const, label: '处理中', color: '#3b82f6', filter: (w: WorkOrder) => w.status === '处理中' },
  { key: 'confirm' as const, label: '等待确认', color: '#10b981', filter: (w: WorkOrder) => w.status === '已解决' },
  { key: 'returned' as const, label: '退回提交', color: '#ef4444', filter: (w: WorkOrder) => w.status === '退回待提交' },
  { key: 'done' as const, label: '已完成', color: '#6b7280', filter: (w: WorkOrder) => w.status === '已关闭' || w.status === '已撤回' },
];

export default function DispatcherView() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [acting, setActing] = useState<Record<string, boolean>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => { fetchWorkOrders().then(setOrders).finally(() => setLoading(false)); }, []);

  const doAssign = async (id: number) => {
    const assignee = selections[`assign-${id}`];
    if (!assignee) return;
    setActing(p => ({ ...p, [`assign-${id}`]: true }));
    try { await assignWorkOrder(id, assignee); }
    catch (e: any) { alert(e.message); return; }
    setOrders(prev => prev.map(w => w.id === id ? { ...w, assignee, status: '处理中' as WorkOrderStatus } : w));
    setActing(p => ({ ...p, [`assign-${id}`]: false }));
  };

  const doAction = async (id: number) => {
    const action = selections[`act-${id}`] as WorkOrderStatus;
    const reason = reasons[`reason-${id}`] || '';
    if (!reason.trim()) { alert('此操作必须填写原因'); return; }
    setActing(p => ({ ...p, [`act-${id}`]: true }));
    try { await updateWorkOrderStatus(id, action, reason); }
    catch (e: any) { alert(e.message); return; }
    setOrders(prev => prev.map(w => w.id === id ? { ...w, status: action, returnReason: reason } : w));
    setActing(p => ({ ...p, [`act-${id}`]: false }));
  };

  const doReturn = async (id: number) => {
    const reason = reasons[`ret-${id}`] || '';
    if (!reason.trim()) { alert('此操作必须填写原因'); return; }
    setActing(p => ({ ...p, [`ret-${id}`]: true }));
    try { await updateWorkOrderStatus(id, '退回待提交', reason); }
    catch (e: any) { alert(e.message); return; }
    setOrders(prev => prev.map(w => w.id === id ? { ...w, status: '退回待提交' as WorkOrderStatus, returnReason: reason } : w));
    setActing(p => ({ ...p, [`ret-${id}`]: false }));
  };

  if (loading) return <p style={{ padding: 24 }}>加载中...</p>;

  const activeTab = TABS.find(t => t.key === tab)!;
  const filtered = orders.filter(activeTab.filter);

  return (
    <div style={{ padding: 24 }}>
      <h2>调度者工作台</h2>
      <p style={{ color: '#6b7280', marginBottom: 12 }}>快速分派和处理工单</p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map(t => {
          const count = orders.filter(t.filter).length;
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

      {filtered.length === 0 ? <p style={{ color: '#9ca3af' }}>暂无{activeTab.label}工单</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: activeTab.color + '22' }}>
            <th style={{ padding: 8, textAlign: 'left', fontSize: 13 }}>工单号</th>
            <th style={{ padding: 8, textAlign: 'left', fontSize: 13 }}>标题</th>
            <th style={{ padding: 8, textAlign: 'left', fontSize: 13 }}>提交人</th>
            <th style={{ padding: 8, textAlign: 'left', fontSize: 13 }}>状态</th>
            <th style={{ padding: 8, textAlign: 'left', fontSize: 13 }}>退回原因</th>
            {tab === 'pending' && <>
              <th style={{ padding: 8, textAlign: 'left', fontSize: 13 }}>分派给</th>
              <th style={{ padding: 8, textAlign: 'left', fontSize: 13 }}>操作</th>
            </>}
            {tab === 'progress' && <>
              <th style={{ padding: 8, textAlign: 'left', fontSize: 13 }}>处理人</th>
              <th style={{ padding: 8, textAlign: 'left', fontSize: 13 }}>操作</th>
            </>}
            {(tab === 'confirm' || tab === 'done') && <><th style={{ padding: 8, textAlign: 'left', fontSize: 13 }}>处理人</th><th style={{ padding: 8, textAlign: 'left', fontSize: 13 }}>原因/说明</th></>}
            {tab === 'returned' && <th style={{ padding: 8, textAlign: 'left', fontSize: 13 }}>退回原因</th>}
          </tr></thead>
          <tbody>
            {filtered.map(wo => (
              <tr key={wo.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: 8, fontSize: 13 }}>{wo.code}</td>
                <td style={{ padding: 8, fontSize: 13 }}>{wo.title}</td>
                <td style={{ padding: 8, fontSize: 13 }}>{wo.submitter || '匿名'}</td>
                <td style={{ padding: 8, fontSize: 13 }}>{wo.status}</td>
                <td style={{ padding: 8, fontSize: 12, color: '#dc2626' }}>{wo.returnReason || '-'}</td>
                {tab === 'pending' && <>
                  <td style={{ padding: 8 }}>
                    <select value={selections[`assign-${wo.id}`] || ''}
                      onChange={e => setSelections(p => ({ ...p, [`assign-${wo.id}`]: e.target.value }))}
                      style={{ padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12, width: 80 }}>
                      <option value="" disabled>选择</option>
                      {RESOLVERS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: 8 }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      <button onClick={() => doAssign(wo.id)} disabled={acting[`assign-${wo.id}`]}
                        style={{ padding: '4px 10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                        {acting[`assign-${wo.id}`] ? '...' : '分派'}
                      </button>
                      {(wo.status === '待处理' || wo.status === '退回待分派') && <>
                        <select value={selections[`act-${wo.id}`] || ''}
                          onChange={e => setSelections(p => ({ ...p, [`act-${wo.id}`]: e.target.value }))}
                          style={{ padding: '4px 4px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 11, width: 56 }}>
                          <option value="" disabled>操作</option>
                          <option value="已关闭">拒绝</option>
                          <option value="退回待提交">退回</option>
                        </select>
                        <input placeholder="原因"
                          value={reasons[`reason-${wo.id}`] || ''}
                          onChange={e => setReasons(p => ({ ...p, [`reason-${wo.id}`]: e.target.value }))}
                          style={{ padding: '4px 4px', border: '1px solid #d1d5db', borderRadius: 4, width: 60, fontSize: 11 }} />
                        <button onClick={() => doAction(wo.id)} disabled={acting[`act-${wo.id}`]}
                          style={{ padding: '4px 8px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                          {acting[`act-${wo.id}`] ? '...' : '执行'}
                        </button>
                      </>}
                    </div>
                  </td>
                </>}
                {tab === 'progress' && <>
                  <td style={{ padding: 8, fontSize: 13 }}>{wo.assignee}</td>
                  <td style={{ padding: 8 }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <input placeholder="退回原因"
                        value={reasons[`ret-${wo.id}`] || ''}
                        onChange={e => setReasons(p => ({ ...p, [`ret-${wo.id}`]: e.target.value }))}
                        style={{ padding: '4px 4px', border: '1px solid #d1d5db', borderRadius: 4, width: 70, fontSize: 11 }} />
                      <button onClick={() => doReturn(wo.id)} disabled={acting[`ret-${wo.id}`]}
                        style={{ padding: '4px 8px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                        {acting[`ret-${wo.id}`] ? '...' : '退回提交者'}
                      </button>
                    </div>
                  </td>
                </>}
                {tab === 'confirm' && <><td style={{ padding: 8, fontSize: 13 }}>{wo.assignee}</td><td style={{ padding: 8, fontSize: 12, color: '#059669' }}>{wo.returnReason || '-'}</td></>}
                {tab === 'returned' && <td style={{ padding: 8, fontSize: 12, color: '#ef4444' }}>{wo.returnReason}</td>}
                {tab === 'done' && <><td style={{ padding: 8, fontSize: 13 }}>{wo.assignee}</td><td style={{ padding: 8, fontSize: 12, color: '#6b7280' }}>{wo.returnReason || '-'}</td></>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
