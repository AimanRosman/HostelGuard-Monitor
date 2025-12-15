import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from './types';

// Layouts & Pages
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import PublicMonitor from './pages/PublicMonitor';
import WardenDashboard from './pages/warden/Dashboard';
import Monitoring from './pages/warden/Monitoring';
import LateEntries from './pages/warden/LateEntries';
import Requests from './pages/warden/Requests';
import Students from './pages/warden/Students';
import Events from './pages/warden/Events';
import StudentDashboard from './pages/student/StudentDashboard';

interface WardenLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

// Extracted Layout Component
const WardenLayout: React.FC<WardenLayoutProps> = ({ children, onLogout }) => (
  <div className="flex min-h-screen bg-slate-50">
    <Sidebar onLogout={onLogout} />
    <div className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
      {children}
    </div>
  </div>
);

interface MainRoutesProps {
  user: { role: UserRole; id: string } | null;
  onLogin: (role: UserRole, id: string) => void;
  onLogout: () => void;
}

const MainRoutes: React.FC<MainRoutesProps> = ({ user, onLogin, onLogout }) => {
  return (
    <Routes>
      {/* Public Monitor as Default Route */}
      <Route path="/" element={<PublicMonitor />} />
      
      {/* Login Route */}
      <Route path="/login" element={!user ? <Login onLogin={onLogin} /> : <Navigate to={user.role === UserRole.WARDEN ? '/warden/dashboard' : '/student/dashboard'} />} />
      
      {/* Warden Routes */}
      <Route path="/warden/*" element={
        user?.role === UserRole.WARDEN ? (
          <WardenLayout onLogout={onLogout}>
            <Routes>
              <Route path="dashboard" element={<WardenDashboard />} />
              <Route path="monitoring" element={<Monitoring />} />
              <Route path="late" element={<LateEntries />} />
              <Route path="students" element={<Students />} />
              <Route path="requests" element={<Requests />} />
              <Route path="events" element={<Events />} />
              <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
          </WardenLayout>
        ) : <Navigate to="/login" />
      } />

      {/* Student Routes */}
      <Route path="/student/*" element={
        user?.role === UserRole.STUDENT ? (
          <Routes>
            <Route path="dashboard" element={<StudentDashboard studentId={user.id} onLogout={onLogout} />} />
            <Route path="*" element={<Navigate to="dashboard" />} />
          </Routes>
        ) : <Navigate to="/login" />
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// Mock simple Auth check
const App: React.FC = () => {
  const [user, setUser] = useState<{ role: UserRole; id: string } | null>(null);

  // Check LocalStorage for session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('hostel_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (role: UserRole, id: string) => {
    const newUser = { role, id };
    setUser(newUser);
    localStorage.setItem('hostel_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hostel_user');
  };

  return (
    <HashRouter>
      <MainRoutes user={user} onLogin={handleLogin} onLogout={handleLogout} />
    </HashRouter>
  );
};

export default App;