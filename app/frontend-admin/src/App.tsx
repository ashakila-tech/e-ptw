import { useState, useEffect } from 'react'
import './App.css'
import Sidebar from './components/Sidebar';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Colors, StatusColors } from '../../shared/constants/Colors';
import { getCurrentUser, logout } from '../../shared/services/api';
import shadeColor from '../../shared/utils/color';

import Dashboard from './pages/Dashboard';
import Permits from './pages/Permits';
import Users from './pages/Users';
import Login from './pages/Login';
import Feedbacks from './pages/Feedbacks';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';

const MainLayout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        // '9' is the user_type for admins
        if (user.user_type !== 9) {
          throw new Error("Access denied. Not an administrator.");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Authentication check failed, redirecting to login.");
        await logout(); // Ensure token is cleared before redirecting
        navigate('/login', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  if (isLoading) {
    // Simple loading screen
    return <div className="loading-overlay">Loading...</div>;
  }

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-bg1', Colors.bg1);
    root.style.setProperty('--color-accent1', Colors.accent1);
    root.style.setProperty('--color-primary', Colors.primary);
    root.style.setProperty('--color-secondary', Colors.secondary);
    root.style.setProperty('--color-highlight', Colors.highlight);

    root.style.setProperty('--color-primary-hover', shadeColor(Colors.primary, 20)); // Lighter
    root.style.setProperty('--color-accent1-hover', shadeColor(Colors.accent1, 20)); // Lighter
    root.style.setProperty('--color-highlight-hover', shadeColor(Colors.highlight, -10)); // Darker

    root.style.setProperty('--color-status-approved', StatusColors.approved);
    root.style.setProperty('--color-status-pending', StatusColors.pending);
    root.style.setProperty('--color-status-rejected', StatusColors.rejected);
    root.style.setProperty('--color-status-submitted', StatusColors.submitted);
    root.style.setProperty('--color-status-waiting', StatusColors.waiting);
    root.style.setProperty('--color-status-draft', StatusColors.draft);
    root.style.setProperty('--color-status-exit-pending', StatusColors['exit-pending']);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Route for the login page, which has no sidebar */}
        <Route path="/login" element={<Login />} />

        {/* Nested routes that will use the MainLayout (with sidebar) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="permits" element={<Permits />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
          <Route path="feedbacks" element={<Feedbacks />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Default redirect to the login page */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App;