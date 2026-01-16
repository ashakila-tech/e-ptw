import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../../shared/services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faFileSignature, 
  faUsers, 
  faComments,
  faCog, 
  faSignOutAlt, 
  faChevronLeft, 
  faChevronRight 
} from '@fortawesome/free-solid-svg-icons';

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
    { name: 'Dashboard', path: '/dashboard', icon: faChartLine },
    { name: 'Permits', path: '/permits', icon: faFileSignature },
    { name: 'Users', path: '/users', icon: faUsers },
    { name: 'Feedbacks', path: '/feedbacks', icon: faComments },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Button to toggle the sidebar's collapsed state */}
      <div className="sidebar-top">
        <h3 className="sidebar-title">{!isCollapsed && 'Navigation'}</h3>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="toggle-btn">
          <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronLeft} />
        </button>
      </div>
      <div className="sidebar-middle">
        {/* Map over the navItems to create NavLink components */}
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => (isActive ? 'active' : '')}
            title={isCollapsed ? item.name : ''} // Show full name on hover when collapsed
            end={item.path === '/dashboard'} // 'end' prop for exact match on dashboard
          >
            <FontAwesomeIcon icon={item.icon} fixedWidth />
            {!isCollapsed && <span className="tab-text">{item.name}</span>}
          </NavLink>
        ))}
      </div>
      <div className="sidebar-bottom">
        <NavLink
          to={"/settings"}
          className={({ isActive }) => (isActive ? 'active' : '')}
          title={isCollapsed ? "Settings" : ''} // Show full name on hover when collapsed
          // end={item.path === '/dashboard'} // 'end' prop for exact match on dashboard
        >
          <FontAwesomeIcon icon={faCog} fixedWidth />
          {!isCollapsed && <span className="tab-text">Settings</span>}
        </NavLink>
        <button
          onClick={handleLogout}
          className="logout-button"
          title={isCollapsed ? 'Logout' : ''}
        >
          <FontAwesomeIcon icon={faSignOutAlt} fixedWidth />
          {!isCollapsed && <span className="tab-text">Logout</span>}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;