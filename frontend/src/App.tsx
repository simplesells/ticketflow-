import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './LoginPage';
import WorkOrderList from './WorkOrderList';
import WorkOrderForm from './WorkOrderForm';
import WorkOrderDetail from './WorkOrderDetail';
import DispatcherView from './DispatcherView';
import ResolverView from './ResolverView';
import TemplateManager from './TemplateManager';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <p style={{ padding: 24 }}>加载中...</p>;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return <>{children}</>;
}

function HomePage() {
  const { user } = useAuth();
  if (user?.role === 'dispatcher') return <DispatcherView />;
  if (user?.role === 'resolver') return <ResolverView />;
  return <WorkOrderList />;
}

function NewWorkOrderPage() {
  const navigate = useNavigate();
  return <WorkOrderForm onBack={() => navigate('/')} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/new" element={
            <ProtectedRoute allowedRoles={['submitter']}>
              <NewWorkOrderPage />
            </ProtectedRoute>
          } />
          <Route path="/templates" element={
            <ProtectedRoute allowedRoles={['dispatcher']}>
              <TemplateManager />
            </ProtectedRoute>
          } />
          <Route path="/:id" element={
            <ProtectedRoute allowedRoles={['submitter', 'dispatcher', 'resolver']}>
              <WorkOrderDetail />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['submitter', 'dispatcher', 'resolver']}>
              <HomePage />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
