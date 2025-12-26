import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusColors } from '../../../shared/constants/Colors';
import { useDashboardData } from '../hooks/useDashboard';
import { deleteLocation, deletePermitType, createLocation, createPermitType } from '../../../shared/services/api';

import { PermitStatus } from '../../../shared/constants/Status';

const excludedStatuses = new Set(['PENDING','WAITING']);
const stats = Object.values(PermitStatus).filter(s => !excludedStatuses.has(String(s).toUpperCase())).map((s) => {
  const raw = String(s);
  const title = raw.replace(/[_-]/g, ' ').toLowerCase().split(' ').map(w => w ? (w.charAt(0).toUpperCase() + w.slice(1)) : '').join(' ');
  return { statusKey: raw.toUpperCase(), title };
});


const Dashboard: React.FC = () => {
  const { loading, error, data, refetch } = useDashboardData();
  const navigate = useNavigate();
  const [manageLocations, setManageLocations] = useState(false);
  const [managePermits, setManagePermits] = useState(false);

  // show error banner when load fails
  const errorBanner = error ? <div className="error-banner" style={{ color: '#b91c1c', marginBottom: 10 }}>{error}</div> : null;

  // Remove first 3 placeholder entries (development artifacts) before rendering
  const visibleLocations = (data.locations || []).slice(3);
  const visiblePermits = (data.permits || []).slice(3);

  const getBg = (status: string) => {
    const key = status.toLowerCase().replace(/\s+/g, '-');
    return (StatusColors as any)[key] || '#6b7280'; // fallback gray
  }

  const handleAddLocation = async () => {
    const name = window.prompt("Enter new location name:");
    if (!name) return;
    try {
      await createLocation(name);
      refetch();
    } catch (e: any) {
      alert(e.message || 'Failed to create location');
    }
  };

  const handleRemoveLocation = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this location?')) return;
    try {
      await deleteLocation(id);
      refetch();
    } catch (e: any) {
      alert(e.message || 'Failed to delete location');
    }
  };

  const handleAddPermitType = async () => {
    const name = window.prompt("Enter new permit type name:");
    if (!name) return;
    try {
      await createPermitType(name);
      refetch();
    } catch (e: any) {
      alert(e.message || 'Failed to create permit type');
    }
  };

  const handleRemovePermitType = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this permit type?')) return;
    try {
      await deletePermitType(id);
      refetch();
    } catch (e: any) {
      alert(e.message || 'Failed to delete permit type');
    }
  };

  const handleEditItem = (type: 'location' | 'permit', item: any) => {
    // Placeholder for edit functionality
    console.log(`Edit ${type}:`, item);
    alert(`Edit ${type}: ${item.name} (Functionality to be implemented)`);
  };

  const toggleButtonStyle = {
    marginLeft: '10px', fontSize: '0.8rem', padding: '4px 8px', cursor: 'pointer'
  };

  const iconButtonStyle = {
    background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center'
  };

  return (
    <div className="content-area">
      <h1 className="page-title">Dashboard</h1>
      {errorBanner}

      {/* Container for Permit Statuses */}
      <div className="dashboard-container">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Permit Status</h3>
          <button className="manage-btn" onClick={() => navigate('/permits')}>Manage</button>
        </div>
        <div className="dashboard-grid" style={{ marginTop: 20 }}>
          <div className="stat-card all">
            <div className="stat-title all">All</div>
            <div className="stat-number">{loading ? '...' : data.totalApplications}</div>
          </div>
          {stats.map((s) => {
            const bg = getBg(s.title);
            const key = s.statusKey;
            const count = loading ? '...' : (data.statusCounts[key] || 0);
            // show a colored left border to indicate status instead of coloring the whole card
            return (
              <div 
                key={key} 
                className="stat-card status-card" 
                style={{ 
                  borderLeft: `6px solid ${bg}`,
                  borderRight: `1px solid ${bg}`,
                  borderTop: `1px solid ${bg}`,
                  borderBottom: `1px solid ${bg}`,
                }}>
                <div className="stat-title">{s.title}</div>
                <div className="stat-number">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Container for Users */}
      <div className="dashboard-container">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Users</h3>
          <button className="manage-btn" onClick={() => navigate('/users')}>Manage</button>
        </div>
        <div className="dashboard-grid" style={{ marginTop: 20 }}>
            {/* All and None cards first (hide while loading to avoid placeholders) */}
          {!loading && (
            <>
              <div className="stat-card all">
                <div className="stat-title all">All</div>
                <div className="stat-number">{data.roleCounts ? (data.roleCounts['All'] || 0) : 0}</div>
              </div>

              <div className="stat-card">
                <div className="stat-title">No groups / None</div>
                <div className="stat-number">{data.roleCounts ? (data.roleCounts['No groups / None'] || 0) : 0}</div>
              </div>
            </>
          )}

          {(data.groups || []).length === 0 && loading ? (
            <div className="stat-card"><div className="stat-title">Loading…</div></div>
          ) : (data.groups || []).map((g: any) => {
            const roleName = g.name || 'Unknown';
            const count = loading ? '...' : (data.roleCounts ? (data.roleCounts[roleName] || 0) : 0);
            return (
              <div key={g.id ?? roleName} className="stat-card">
                <div className="stat-title">{roleName}</div>
                <div className="stat-number">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Containers row: Locations + Permit Types */}
      <div className="dashboard-row">
        <div className="dashboard-container">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>Locations</h3>
            <button onClick={() => setManageLocations(!manageLocations)} className="manage-btn">
              {manageLocations ? 'Done' : 'Manage'}
            </button>
            {manageLocations && (
              <button onClick={handleAddLocation} style={{ ...iconButtonStyle, color: '#10b981', marginLeft: 5 }} title="Add Location">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            )}
          </div>
          <ul className="location-list">
            {loading ? (
              <li className="location-item">Loading locations…</li>
            ) : visibleLocations.length === 0 ? (
              <li className="location-item">No locations</li>
            ) : (
              visibleLocations.map((l: any) => (
                <li key={l.id ?? l.name} className="location-item">
                  <div className="location-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span>{l.name}</span>
                    {manageLocations && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => handleEditItem('location', l)} style={{ ...iconButtonStyle, color: '#3b82f6' }} title="Edit">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button onClick={() => handleRemoveLocation(l.id)} style={{ ...iconButtonStyle, color: '#ef4444' }} title="Remove">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="dashboard-container">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>Permit Types</h3>
            <button onClick={() => setManagePermits(!managePermits)} className="manage-btn">
              {managePermits ? 'Done' : 'Manage'}
            </button>
            {managePermits && (
              <button onClick={handleAddPermitType} style={{ ...iconButtonStyle, color: '#10b981', marginLeft: 5 }} title="Add Permit Type">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            )}
          </div>
          <div className="permit-type-list">
            {loading ? (
              <div className="permit-status-item">Loading…</div>
            ) : visiblePermits.length === 0 ? (
              <div className="permit-status-item">No permit types</div>
            ) : (
              visiblePermits.map((p: any) => (
                <div key={p.id ?? p.name} className="permit-status-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{p.name}</span>
                  {managePermits && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleEditItem('permit', p)} style={{ ...iconButtonStyle, color: '#3b82f6' }} title="Edit">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button onClick={() => handleRemovePermitType(p.id)} style={{ ...iconButtonStyle, color: '#ef4444' }} title="Remove">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div> 
    </div>
  );
};

export default Dashboard;