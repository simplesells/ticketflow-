import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchWorkOrder, updateWorkOrderStatus, editWorkOrder } from './api';
import type { WorkOrder, WorkOrderStatus } from './types';

const NEXT_STATUS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  '待处理':   ['已撤回'],
  '处理中':   [],
  '已解决':   ['已关闭', '退回处理'],
  '已关闭':   ['待处理'],
  '退回待分派': [],
  '退回待提交': ['待处理', '已撤回'],
  '退回处理':  [],
  '已撤回':   [],
};

const RETURN_TARGETS: WorkOrderStatus[] = ['退回处理'];

const STATUS_COLORS: Record<string, string> = {
  '待处理': '#f59e0b', '处理中': '#3b82f6', '已解决': '#10b981', '已关闭': '#6b7280',
  '退回待分派': '#ef4444', '退回待提交': '#f97316', '退回处理': '#dc2626', '已撤回': '#9ca3af',
};

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  '待处理': '待处理', '处理中': '处理中', '已解决': '已解决', '已关闭': '已关闭',
  '退回待分派': '退回(需重分派)', '退回待提交': '退回(需修改)', '退回处理': '退回(需重做)', '已撤回': '已撤回',
};

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [wo, setWo] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [reason, setReason] = useState('');
  const [selStatus, setSelStatus] = useState('');
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetchWorkOrder(Number(id)).then(setWo).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleAction = async (newStatus: WorkOrderStatus) => {
    if (!wo) return;
    const needReason = RETURN_TARGETS.includes(newStatus) || (wo.status === '已关闭' && newStatus === '待处理');
    if (needReason && !reason.trim()) { alert('此操作必须填写原因'); return; }
    setUpdating(true);
    try {
      const updated = await updateWorkOrderStatus(wo.id, newStatus, reason);
      setWo(updated);
      setReason('');
      setSelStatus('');
    } catch (e: any) { alert(e.message); }
    finally { setUpdating(false); }
  };

  const handleSave = async () => {
    if (!wo || !editTitle.trim() || !editDesc.trim()) { alert('标题和描述不能为空'); return; }
    setSaving(true);
    try {
      const updated = await editWorkOrder(wo.id, { title: editTitle.trim(), description: editDesc.trim() });
      setWo(updated);
      setEditing(false);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const startEdit = () => {
    if (!wo) return;
    setEditTitle(wo.title);
    setEditDesc(wo.description);
    setEditing(true);
  };

  if (loading) return <p style={{ padding: 24 }}>加载中...</p>;
  if (!wo) return <p style={{ padding: 24, color: '#dc2626' }}>工单不存在</p>;

  const nextStatuses = NEXT_STATUS[wo.status];
  const canEdit = wo.status === '退回待提交' || wo.status === '待处理';

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: 14 }}>&larr; 返回列表</Link>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {editing ? (
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
              style={{ fontSize: 24, fontWeight: 700, width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6, marginBottom: 4 }} />
          ) : (
            <h1 style={{ margin: 0 }}>{wo.title}</h1>
          )}
          <p style={{ color: '#6b7280', margin: '4px 0 0' }}>
            {wo.code} &middot; 创建于 {new Date(wo.createdAt).toLocaleString('zh-CN')}
            {wo.submitter && <> &middot; 提交人: {wo.submitter}</>}
            {wo.assignee && <> &middot; 处理人: {wo.assignee}</>}
          </p>
        </div>
        <span style={{ padding: '4px 12px', borderRadius: 20, background: STATUS_COLORS[wo.status] + '20', color: STATUS_COLORS[wo.status], fontWeight: 600, fontSize: 14 }}>
          {STATUS_LABELS[wo.status]}
        </span>
      </div>

      {canEdit && !editing && (
        <button onClick={startEdit} style={{ marginTop: 16, padding: '6px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
          编辑工单内容
        </button>
      )}

      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>描述</h3>
        {editing ? (
          <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={4}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, resize: 'vertical' }} />
        ) : (
          <p style={{ color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{wo.description}</p>
        )}
      </div>

      {editing && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {saving ? '保存中...' : '保存修改'}
          </button>
          <button onClick={() => setEditing(false)}
            style={{ padding: '8px 20px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>
            取消
          </button>
        </div>
      )}

      <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
        <div><span style={{ color: '#6b7280' }}>类型：</span>{wo.type}</div>
        <div><span style={{ color: '#6b7280' }}>优先级：</span><strong>{wo.priority}</strong></div>
      </div>

      {wo.returnReason && (
        <div style={{ marginTop: 12, padding: '8px 12px', background: wo.status === '已解决' ? '#ecfdf5' : '#fee2e2', borderRadius: 6, color: wo.status === '已解决' ? '#059669' : '#dc2626', fontSize: 13 }}>
          {wo.status === '已解决' ? '处理说明' : '原因'}：{wo.returnReason}
        </div>
      )}

      {nextStatuses.length > 0 && (
        <div style={{ marginTop: 24, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
          <h3 style={{ margin: '0 0 8px' }}>提交者操作</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={selStatus} onChange={e => setSelStatus(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, minWidth: 160 }}>
              <option value="" disabled>选择操作...</option>
              {nextStatuses.map(s => {
                let label = s;
                if (s === '已撤回') label = '撤回工单';
                else if (s === '已关闭') label = '确认完成';
                else if (s === '待处理' && wo.status === '已关闭') label = '重开工单';
                else if (s === '待处理') label = '重提工单';
                else if (s === '退回处理') label = '不满意，退回重做';
                return <option key={s} value={s}>{label}</option>;
              })}
            </select>
            {selStatus && (RETURN_TARGETS.includes(selStatus as WorkOrderStatus) || (wo.status === '已关闭' && selStatus === '待处理')) && (
              <input placeholder={wo.status === '已关闭' ? '重开原因（必填）' : '退回原因（必填）'}
                value={reason} onChange={e => setReason(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, flex: 1, minWidth: 200 }} />
            )}
            <button onClick={() => { if (selStatus) handleAction(selStatus as WorkOrderStatus); }} disabled={updating || !selStatus}
              style={{ padding: '8px 24px', background: selStatus ? (STATUS_COLORS[selStatus] || '#2563eb') : '#9ca3af', color: '#fff', border: 'none', borderRadius: 6, cursor: selStatus ? 'pointer' : 'default', fontWeight: 500 }}>
              {updating ? '...' : '执行'}
            </button>
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
                <div style={{ color: '#9ca3af', fontSize: 13 }}>
                  {new Date(h.time).toLocaleString('zh-CN')} &middot; {h.operator}
                  {h.reason && <span style={{ color: '#ef4444' }}> &middot; {h.reason}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
