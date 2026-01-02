import React, { useState, useMemo } from 'react';

interface User {
  id: number;
  name: string;
  email?: string | null;
  company_id: number;
  company_name?: string | null;
  groups: string[];
  [key: string]: any;
}

interface Props {
  title: string;
  users: User[];
  loading: boolean;
  error: string | null;
  enableCompanyFilter?: boolean;
  allCompanies?: { id: number; name: string }[];
  onRefresh?: () => void;
}

const UserTable: React.FC<Props> = ({
  title,
  users,
  loading,
  error,
  enableCompanyFilter = false,
  allCompanies = [],
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredCompanies = useMemo(() => {
    if (!enableCompanyFilter) return [];
    const q = companySearchQuery.toLowerCase().trim();
    if (!q) return allCompanies;
    return allCompanies.filter(c => c.name.toLowerCase().includes(q));
  }, [allCompanies, companySearchQuery, enableCompanyFilter]);

  const displayedUsers = useMemo(() => {
    let list = [...users];

    if (enableCompanyFilter && selectedCompanyId !== null) {
      list = list.filter(u => u.company_id === selectedCompanyId);
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(u => {
        const composite = [
          u.name,
          u.email,
          u.company_name,
        ].filter(Boolean).join(' ').toLowerCase();
        return composite.includes(q);
      });
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === 'id') return (a.id - b.id) * dir;
      
      let valA = '';
      let valB = '';

      if (sortKey === 'company') {
        valA = a.company_name || '';
        valB = b.company_name || '';
      } else {
        valA = String(a[sortKey] || '');
        valB = String(b[sortKey] || '');
      }

      return valA.localeCompare(valB) * dir;
    });

    return list;
  }, [users, searchQuery, selectedCompanyId, sortKey, sortDir, enableCompanyFilter]);

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>
          {title}
          {enableCompanyFilter && selectedCompanyId && (
            <span style={{ fontWeight: 'normal', fontSize: '0.9em', marginLeft: 8 }}>
              - {allCompanies.find(c => c.id === selectedCompanyId)?.name || 'Company'}
            </span>
          )}
        </h3>
        <div className="users-toolbar">
          <input
            aria-label={`Search ${title}`}
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="table-search-bar"
          />
          {onRefresh && (
            <button className="manage-btn" onClick={onRefresh} disabled={loading}>
              Refresh
            </button>
          )}
        </div>
      </div>

      {enableCompanyFilter && (
        <div style={{ marginBottom: 12 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong style={{ color: 'var(--color-primary)' }}>Filter by Company</strong>
            <input
              placeholder="Search companies..."
              value={companySearchQuery}
              onChange={(e) => setCompanySearchQuery(e.target.value)}
              className="table-search-bar"
              style={{ width: 200 }}
            />
          </div>
          <div className="companies-list">
             <div className="permit-status-item" style={{ justifyContent: 'space-between' }}>
                <span>All Companies</span>
                <button className="manage-btn view" onClick={() => setSelectedCompanyId(null)}>Select</button>
             </div>
             {filteredCompanies.map(c => (
               <div key={c.id} className="permit-status-item" style={{ justifyContent: 'space-between' }}>
                 <span>{c.name}</span>
                 <button className="manage-btn view" onClick={() => setSelectedCompanyId(c.id)}>Select</button>
               </div>
             ))}
             {filteredCompanies.length === 0 && <div className="permit-status-item">No companies found.</div>}
          </div>
        </div>
      )}

      <div className="card-border">
        <div className="card-scroll">
          <table className="users-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')}>ID {sortKey === 'id' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('name')}>Name {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('email')}>Email {sortKey === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('company')}>Company {sortKey === 'company' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: 16 }}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={4} style={{ padding: 16, color: 'red' }}>{error}</td></tr>
              ) : displayedUsers.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 16 }}>No users found.</td></tr>
              ) : (
                displayedUsers.map(u => (
                  <tr key={u.id}>
                    <td className="users-td">{u.id}</td>
                    <td className="users-td">{u.name}</td>
                    <td className="users-td">{u.email || '—'}</td>
                    <td className="users-td">{u.company_name || `Company ${u.company_id}`}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserTable;