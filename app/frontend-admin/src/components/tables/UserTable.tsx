import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash, faSync } from '@fortawesome/free-solid-svg-icons';
import type { EnrichedUser } from '../../hooks/useUsers';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

    // Sort by ID asc by default
    list.sort((a, b) => a.id - b.id);
    return list;
  }, [users, searchQuery, selectedCompanyId, enableCompanyFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCompanyId]);

  const totalPages = Math.ceil(displayedUsers.length / itemsPerPage);
  const paginatedUsers = displayedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="" style={{ marginBottom: 20 }}>
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
          <button className="icon-btn refresh" onClick={onRefresh} disabled={loading} title="Refresh">
            <FontAwesomeIcon icon={faSync} spin={loading} />
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
               paginatedUsers.length === 0 ? <tr><td colSpan={6} style={{padding:16}}>No users found.</td></tr> :
               paginatedUsers.map(u => (
                 <tr key={u.id}>
                   <td className="users-td">{u.id}</td>
                   <td className="users-td">{u.company_name || u.company_id}</td>
                   <td className="users-td">{u.name}</td>
                   <td className="users-td">{u.email || '-'}</td>
                   <td className="users-td">{u.groups.join(', ') || '-'}</td>
                   {(onEdit || onDelete) && (
                     <td className="users-td">
                       <div style={{ display: 'flex', gap: 8 }}>
                         {onEdit && (
                           <button className="icon-btn edit" onClick={() => onEdit(u)} title="Edit">
                             <FontAwesomeIcon icon={faPencilAlt} />
                           </button>
                         )}
                         {onDelete && (
                           <button className="icon-btn delete" onClick={() => onDelete(u.id)} title="Delete">
                             <FontAwesomeIcon icon={faTrash} />
                           </button>
                         )}
                       </div>
                     </td>
                   )}
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Display pagination number */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 12, alignItems: 'center' }}>
        <button className="manage-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ opacity: currentPage === 1 ? 0.5 : 1 }}>Prev</button>
        <span style={{ fontSize: '0.9rem' }}>Page {currentPage} of {totalPages}</span>
        <button className="manage-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}>Next</button>
      </div>
    </div>
  );
};

export default UserTable;