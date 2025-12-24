import React from 'react';
import { StatusColors } from '../../../shared/constants/Colors';
import { getTextColor } from '../utils/class';

const stats = [
  { status: "Approved", title: "Approved", count: 0 },
  { status: "Submitted", title: "Submitted", count: 0 },
  { status: "Rejected", title: "Rejected", count: 0 },
  { status: "Pending", title: "Pending", count: 0 },
  { status: "Expired", title: "Expired", count: 0 },
]

const Dashboard: React.FC = () => {
  const getBg = (status: string) => {
    const key = status.toLowerCase().replace(/\s+/g, '-');
    return (StatusColors as any)[key] || '#6b7280'; // fallback gray
  }

  return (
    <div className="content-area">
      <h2>Dashboard</h2>
      <div className="dashboard-container">
        <h3 style={{ marginTop: 0 }}>Permit Statuses</h3>
        <div className="dashboard-grid" style={{ marginTop: 20 }}>
          <div className="stat-card">
            <div className="stat-title">All</div>
            <div className="stat-number">0</div>
          </div>          
        </div>
        <div style={{padding:10}}></div>
        <div className="dashboard-grid" style={{ marginTop: 20 }}>
          {stats.map((s) => {
            const bg = getBg(s.status);
            const color = getTextColor(bg);
            return (
              <div key={s.status} className="stat-card" style={{ backgroundColor: bg, color }}>
                <div className="stat-title">{s.title}</div>
                <div className="stat-number">{s.count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;