import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function TabContent({ tab }: { tab: Tab }) {
  switch (tab) {
    case 'submitter':
      return (
        <Routes>
          <Route path="/" element={<WorkOrderList />} />
          <Route path="/new" element={<WorkOrderForm />} />
          <Route path="/:id" element={<WorkOrderDetail />} />
        </Routes>
      );
    case 'dispatcher':
      return <DispatcherView />;
    case 'resolver':
      return <ResolverView />;
  }
}

export default function App() {
  const [tab, setTab] = useState<Tab>('submitter');

  return (
    <BrowserRouter>
      <div>
        <div style={{
          display: 'flex',
          background: '#1e293b',
          padding: '0 24px',
          gap: 4,
        }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderBottom: tab === t.key ? '3px solid #3b82f6' : '3px solid transparent',
                background: tab === t.key ? '#334155' : 'transparent',
                color: tab === t.key ? '#fff' : '#94a3b8',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: tab === t.key ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {t.label}
              <div style={{ fontSize: 11, opacity: 0.7 }}>{t.desc}</div>
            </button>
          ))}
        </div>
        <TabContent tab={tab} />
      </div>
    </BrowserRouter>
  );
}
