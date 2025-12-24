import React from 'react';
import { StatusColors } from '../../../shared/constants/Colors';
import { useDashboardData } from '../hooks/useDashboard';

import { PermitStatus } from '../../../shared/constants/Status';

const excludedStatuses = new Set(['PENDING','WAITING']);
const stats = Object.values(PermitStatus).filter(s => !excludedStatuses.has(String(s).toUpperCase())).map((s) => {
  const raw = String(s);
  const title = raw.replace(/[_-]/g, ' ').toLowerCase().split(' ').map(w => w ? (w.charAt(0).toUpperCase() + w.slice(1)) : '').join(' ');
  return { statusKey: raw.toUpperCase(), title };
});


const Dashboard: React.FC = () => {
  const { loading, error, data } = useDashboardData();

  // show error banner when load fails
  const errorBanner = error ? <div className="error-banner" style={{ color: '#b91c1c', marginBottom: 10 }}>{error}</div> : null;

  // Remove first 3 placeholder entries (development artifacts) before rendering
  const visibleLocations = (data.locations || []).slice(3);
  const visiblePermits = (data.permits || []).slice(3);

  const getBg = (status: string) => {
    const key = status.toLowerCase().replace(/\s+/g, '-');
    return (StatusColors as any)[key] || '#6b7280'; // fallback gray
  }

  return (
    <div className="content-area">
      <h1 className="page-title">Dashboard</h1>
      {errorBanner}

      {/* Container for Permit Statuses */}
      <div className="dashboard-container">
        <h3 style={{ marginTop: 0 }}>Permit Status</h3>
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
        <h3 style={{ marginTop: 0 }}>Users</h3>
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
          <h3 style={{ marginTop: 0 }}>Locations</h3>
          <ul className="location-list">
            {loading ? (
              <li className="location-item">Loading locations…</li>
            ) : visibleLocations.length === 0 ? (
              <li className="location-item">No locations</li>
            ) : (
              visibleLocations.map((l: any) => (
                <li key={l.id ?? l.name} className="location-item">
                  <div className="location-name">{l.name}</div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="dashboard-container">
          <h3 style={{ marginTop: 0 }}>Permit Types</h3>
          <div className="permit-type-list">
            {loading ? (
              <div className="permit-status-item">Loading…</div>
            ) : visiblePermits.length === 0 ? (
              <div className="permit-status-item">No permit types</div>
            ) : (
              visiblePermits.map((p: any) => (
                <div key={p.id ?? p.name} className="permit-status-item">{p.name}</div>
              ))
            )}
          </div>
        </div>
      </div> 
    </div>
  );
};

export default Dashboard;