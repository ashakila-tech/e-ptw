import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

/**
 * Defines the props for the Sidebar component.
 * @param isCollapsed - Whether the sidebar is currently collapsed.
 * @param setIsCollapsed - Function to toggle the collapsed state.
 */
interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Permits', path: '/permits' },
    { name: 'Users', path: '/users' },
  ];

  return (
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-top">
        {/* Button to toggle the sidebar's collapsed state */}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="toggle-btn">
          {isCollapsed ? '»' : '«'} {/* Changed arrows for better visual */}
        </button>

        <h3 className="sidebar-title">{!isCollapsed && 'Navigation'}</h3>

        {/* Map over the navItems to create NavLink components */}
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => (isActive ? 'active' : '')}
            title={isCollapsed ? item.name : ''} // Show full name on hover when collapsed
            end={item.path === '/dashboard'} // 'end' prop for exact match on dashboard
          >
            <span className="tab-text">
              {isCollapsed ? item.name.charAt(0) : item.name}
            </span>
          </NavLink>
        ))}
      </div>
      <div className="sidebar-bottom">
        <button
          onClick={() => navigate('/login')}
          className="logout-button"
          title={isCollapsed ? 'Logout' : ''}
        >
          <span className="tab-text">
            {isCollapsed ? 'L' : 'Logout'}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;