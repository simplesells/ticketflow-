import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import WorkOrderList from './WorkOrderList';
import WorkOrderForm from './WorkOrderForm';
import WorkOrderDetail from './WorkOrderDetail';
import DispatcherView from './DispatcherView';
import ResolverView from './ResolverView';

type Tab = 'submitter' | 'dispatcher' | 'resolver';

const TABS: { key: Tab; label: string; desc: string }[] = [
  { key: 'submitter', label: '提交者工作台', desc: '提交工单' },
  { key: 'dispatcher', label: '调度者工作台', desc: '分派工单' },
  { key: 'resolver', label: '完成者工作台', desc: '处理工单' },
];

function TabNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div style={{ display: 'flex', background: '#1e293b', padding: '0 24px', gap: 4 }}>
      {TABS.map(t => (
        <button key={t.key} onClick={() => setTab(t.key)} style={{
          padding: '12px 24px', border: 'none',
          borderBottom: tab === t.key ? '3px solid #3b82f6' : '3px solid transparent',
          background: tab === t.key ? '#334155' : 'transparent',
          color: tab === t.key ? '#fff' : '#94a3b8',
          cursor: 'pointer', fontSize: 14, fontWeight: tab === t.key ? 600 : 400,
        }}>
          {t.label}
          <div style={{ fontSize: 11, opacity: 0.7 }}>{t.desc}</div>
        </button>
      ))}
    </div>
  );
}

function HomePage() {
  const [tab, setTab] = useState<Tab>('submitter');
  return (
    <div>
      <TabNav tab={tab} setTab={setTab} />
      {tab === 'submitter' && <WorkOrderList />}
      {tab === 'dispatcher' && <DispatcherView />}
      {tab === 'resolver' && <ResolverView />}
    </div>
  );
}

function NewWorkOrderPage() {
  const navigate = useNavigate();
  return (
    <div>
      <TabNav tab="submitter" setTab={() => {}} />
      <WorkOrderForm onBack={() => navigate('/')} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/new" element={<NewWorkOrderPage />} />
        <Route path="/:id" element={<WorkOrderDetail />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
