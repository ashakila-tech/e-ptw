import React, { useState, useMemo } from 'react';
import { EnrichedUser } from '../hooks/useUsers';

interface Props {
  title?: string;
  users: EnrichedUser[];
  loading: boolean;
  error: string | null;
  enableCompanyFilter?: boolean;
  allCompanies?: { id: number; name: string }[];
  onRefresh: () => void;
  onEdit?: (user: EnrichedUser) => void;
  onDelete?: (id: number) => void;
}

const UserTable: React.FC<Props> = ({
  title,
  users,
  loading,
  error,
  enableCompanyFilter,
  allCompanies,
  onRefresh,
  onEdit,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const displayedUsers = useMemo(() => {
    let list = [...users];

    if (enableCompanyFilter && selectedCompanyId !== null) {
      list = list.filter(u => u.company_id === selectedCompanyId);
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(u => 
        (u.name || '').toLowerCase().includes(q) || 
        (u.email || '').toLowerCase().includes(q)
      );
    }

    // Sort by ID desc by default
    list.sort((a, b) => b.id - a.id);
    return list;
  }, [users, searchQuery, selectedCompanyId, enableCompanyFilter]);

  return (
    <div className="dashboard-container" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>
          {title || 'Users'}
          {selectedCompanyId && allCompanies && (
            <span style={{ fontWeight: 'normal', fontSize: '0.9em', marginLeft: 8 }}>
              - {allCompanies.find(c => c.id === selectedCompanyId)?.name}
            </span>
          )}
        </h3>
        <div className="users-toolbar">
          <input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="table-search-bar"
          />
          <button className="manage-btn" onClick={onRefresh} disabled={loading}>
            {loading ? '...' : 'Refresh'}
          </button>
        </div>
      </div>

      {enableCompanyFilter && allCompanies && (
        <div style={{ marginBottom: 12 }}>
          <div className="companies-list">
            <div className="permit-status-item" style={{ justifyContent: 'space-between' }}>
              <span>All Companies</span>
              <button 
                className="manage-btn view" 
                onClick={() => setSelectedCompanyId(null)}
              >
                Select
              </button>
            </div>
            {allCompanies.map(c => (
              <div key={c.id} className="permit-status-item" style={{ justifyContent: 'space-between' }}>
                <span>{c.name}</span>
                <button 
                  className="manage-btn view"
                  onClick={() => setSelectedCompanyId(c.id)}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-border">
        <div className="card-scroll">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Name</th>
                <th>Email</th>
                <th>Groups</th>
                {(onEdit || onDelete) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{padding:16}}>Loading...</td></tr> :
               error ? <tr><td colSpan={6} style={{padding:16, color:'red'}}>{error}</td></tr> :
               displayedUsers.length === 0 ? <tr><td colSpan={6} style={{padding:16}}>No users found.</td></tr> :
               displayedUsers.map(u => (
                 <tr key={u.id}>
                   <td className="users-td">{u.id}</td>
                   <td className="users-td">{u.company_name || u.company_id}</td>
                   <td className="users-td">{u.name}</td>
                   <td className="users-td">{u.email || '-'}</td>
                   <td className="users-td">{u.groups.join(', ') || '-'}</td>
                   {(onEdit || onDelete) && (
                     <td className="users-td">
                       <div style={{ display: 'flex', gap: 8 }}>
                         {onEdit && <button className="manage-btn edit" onClick={() => onEdit(u)}>Edit</button>}
                         {onDelete && <button className="manage-btn delete" onClick={() => onDelete(u.id)}>Delete</button>}
                       </div>
                     </td>
                   )}
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserTable;