import { useState, useEffect } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'; // Import the new Sidebar component
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Colors, StatusColors } from '../../shared/constants/Colors';
import { getCurrentUser, logout } from '../../shared/services/api';

// Import the new page components
import Dashboard from './pages/Dashboard';
import Permits from './pages/Permits';
import Users from './pages/Users';
import Login from './pages/Login';
import Feedbacks from './pages/Feedbacks';
import Settings from './pages/Settings';

/**
 * A simple utility to lighten or darken a hex color.
 * @param color The hex color string.
 * @param percent The percentage to lighten (positive) or darken (negative).
 */
const shadeColor = (color: string, percent: number) => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);
  R = Math.round(R * (100 + percent) / 100);
  G = Math.round(G * (100 + percent) / 100);
  B = Math.round(B * (100 + percent) / 100);
  const newR = Math.min(255, R).toString(16).padStart(2, '0');
  const newG = Math.min(255, G).toString(16).padStart(2, '0');
  const newB = Math.min(255, B).toString(16).padStart(2, '0');
  return `#${newR}${newG}${newB}`;
};

/**
 * A layout component that includes the sidebar and a content area for nested routes.
 */
const MainLayout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Force logout after 10 minutes of inactivity
  // useInactivityLogout(10);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        // Assuming '9' is the user_type for admins based on backend schema
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
    // You can replace this with a more sophisticated spinner component
    return <div className="loading-overlay">Loading...</div>;
  }

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      <main className="content-area">
        {/* Child routes will be rendered here */}
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  // This effect runs once on mount to set the CSS color variables globally.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-bg1', Colors.bg1);
    root.style.setProperty('--color-accent1', Colors.accent1);
    root.style.setProperty('--color-primary', Colors.primary);
    root.style.setProperty('--color-secondary', Colors.secondary);
    root.style.setProperty('--color-highlight', Colors.highlight);

    // Also set hover variations
    root.style.setProperty('--color-primary-hover', shadeColor(Colors.primary, 20)); // Lighter
    root.style.setProperty('--color-accent1-hover', shadeColor(Colors.accent1, 20)); // Lighter
    root.style.setProperty('--color-highlight-hover', shadeColor(Colors.highlight, -10)); // Darker

    // Status colors
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
          <Route path="feedbacks" element={<Feedbacks />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Default redirect to the login page */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App;