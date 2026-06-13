import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from './api';
import type { FormTemplate } from './api';

const TYPES = ['咨询', '报修', '建议', '投诉'];
const PRIORITIES = ['低', '中', '高', '紧急'];

export default function TemplateManager() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormTemplate | null>(null);
  const [form, setForm] = useState({ name: '', titleHint: '', descriptionHint: '', type: '咨询', priority: '中' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    fetchTemplates().then(setTemplates).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resetForm = () => {
    setForm({ name: '', titleHint: '', descriptionHint: '', type: '咨询', priority: '中' });
    setEditing(null);
    setError('');
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('模板名称不能为空'); return; }
    setSaving(true); setError('');
    try {
      if (editing) {
        await updateTemplate(editing.id, form);
      } else {
        await createTemplate(form);
      }
      resetForm();
      load();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除此模板？')) return;
    try {
      await deleteTemplate(id);
      load();
      if (editing?.id === id) resetForm();
    } catch (e: any) { alert(e.message); }
  };

  const startEdit = (t: FormTemplate) => {
    setEditing(t);
    setForm({ name: t.name, titleHint: t.titleHint, descriptionHint: t.descriptionHint, type: t.type, priority: t.priority });
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: 14 }}>&larr; 返回调度台</Link>
      <h1 style={{ marginTop: 8 }}>模板管理</h1>

      {/* 编辑表单 */}
      <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px' }}>{editing ? '编辑模板' : '新建模板'}</h3>
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '6px 10px', borderRadius: 4, marginBottom: 8, fontSize: 13 }}>{error}</div>}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 2, fontWeight: 500, fontSize: 13 }}>模板名称 *</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14 }}
            placeholder="例如：打印机故障" />
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 2, fontWeight: 500, fontSize: 13 }}>标题提示</label>
            <input value={form.titleHint} onChange={e => setForm({ ...form, titleHint: e.target.value })}
              style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14 }}
              placeholder="预填标题" />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 2, fontWeight: 500, fontSize: 13 }}>描述提示</label>
          <input value={form.descriptionHint} onChange={e => setForm({ ...form, descriptionHint: e.target.value })}
            style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14 }}
            placeholder="描述提示文字" />
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 2, fontWeight: 500, fontSize: 13 }}>类型</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14 }}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 2, fontWeight: 500, fontSize: 13 }}>优先级</label>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
              style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14 }}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '6px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {saving ? '保存中...' : editing ? '更新模板' : '创建模板'}
          </button>
          {editing && (
            <button onClick={resetForm}
              style={{ padding: '6px 20px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer' }}>
              取消编辑
            </button>
          )}
        </div>
      </div>

      {/* 模板列表 */}
      <h3>现有模板</h3>
      {loading ? <p style={{ color: '#9ca3af' }}>加载中...</p> : templates.length === 0 ? <p style={{ color: '#9ca3af' }}>暂无模板</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f9fafb', textAlign: 'left' }}>
            <th style={{ padding: 8, fontSize: 13 }}>名称</th>
            <th style={{ padding: 8, fontSize: 13 }}>标题提示</th>
            <th style={{ padding: 8, fontSize: 13 }}>类型</th>
            <th style={{ padding: 8, fontSize: 13 }}>优先级</th>
            <th style={{ padding: 8, fontSize: 13 }}>操作</th>
          </tr></thead>
          <tbody>
            {templates.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6', background: editing?.id === t.id ? '#eff6ff' : 'transparent' }}>
                <td style={{ padding: 8, fontSize: 13, fontWeight: 500 }}>{t.name}</td>
                <td style={{ padding: 8, fontSize: 13 }}>{t.titleHint || '-'}</td>
                <td style={{ padding: 8, fontSize: 13 }}>{t.type}</td>
                <td style={{ padding: 8, fontSize: 13 }}>{t.priority}</td>
                <td style={{ padding: 8, fontSize: 13 }}>
                  <button onClick={() => startEdit(t)}
                    style={{ padding: '3px 10px', border: '1px solid #d1d5db', borderRadius: 3, background: '#fff', cursor: 'pointer', fontSize: 12, marginRight: 4 }}>
                    编辑
                  </button>
                  <button onClick={() => handleDelete(t.id)}
                    style={{ padding: '3px 10px', border: '1px solid #fecaca', borderRadius: 3, background: '#fff', color: '#dc2626', cursor: 'pointer', fontSize: 12 }}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
