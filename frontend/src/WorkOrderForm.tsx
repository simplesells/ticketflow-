import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWorkOrder, fetchTemplates } from './api';
import type { FormTemplate } from './api';
import type { WorkOrderType, WorkOrderPriority } from './types';

const TYPE_OPTIONS: WorkOrderType[] = ['咨询', '报修', '建议', '投诉'];
const PRIORITY_OPTIONS: WorkOrderPriority[] = ['低', '中', '高', '紧急'];

export default function WorkOrderForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', type: '咨询' as WorkOrderType, priority: '中' as WorkOrderPriority });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState<FormTemplate[]>([]);

  useEffect(() => {
    fetchTemplates().then(setTemplates).catch(() => {});
  }, []);

  const applyTemplate = (t: FormTemplate) => {
    setForm({
      title: t.titleHint || '',
      description: t.descriptionHint || '',
      type: t.type as WorkOrderType,
      priority: t.priority as WorkOrderPriority,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('标题和描述为必填项');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const wo = await createWorkOrder(form);
      navigate(`/${wo.id}`);
    } catch (err: any) {
      setError(err.message || '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1>新建工单</h1>
      {templates.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>选择模板（可选）</label>
          <select
            onChange={e => {
              const t = templates.find(t => t.id === Number(e.target.value));
              if (t) applyTemplate(t);
            }}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
          >
            <option value="">-- 手动填写 --</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}（{t.type}·{t.priority}）</option>
            ))}
          </select>
        </div>
      )}
      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: 6, marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>标题 *</label>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
            placeholder="请输入工单标题"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>描述 *</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={4}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, resize: 'vertical' }}
            placeholder="请详细描述工单内容"
          />
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>类型</label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value as WorkOrderType })}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
            >
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>优先级</label>
            <select
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value as WorkOrderPriority })}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
            >
              {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
          >
            {submitting ? '提交中...' : '提交工单'}
          </button>
          <button
            type="button"
            onClick={onBack}
            style={{ padding: '10px 24px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
