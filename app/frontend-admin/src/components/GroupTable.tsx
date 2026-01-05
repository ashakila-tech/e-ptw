import React, { useState, useMemo } from 'react';

interface Group {
  id: number;
  name: string;
  company_id: number;
}

interface Props {
  groups: Group[];
  loading: boolean;
  companies: { id: number; name: string }[];
  onAdd: () => void;
  onRefresh: () => void;
  onEdit: (group: Group) => void;
  onDelete: (id: number) => void;
}

const GroupTable: React.FC<Props> = ({
  groups,
  loading,
  companies,
  onAdd,
  onRefresh,
  onEdit,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const companyMap = useMemo(() => {
    const map = new Map<number, string>();
    companies.forEach(c => map.set(c.id, c.name));
    return map;
  }, [companies]);

  const filteredGroups = useMemo(() => {
    const list = [...groups];
    let result = list.sort((a, b) => a.id - b.id);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(g => g.name.toLowerCase().includes(q));
    }
    return result;
  }, [groups, searchQuery]);

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const paginatedGroups = filteredGroups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="dashboard-container" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Groups</h3>
        <div className="users-toolbar">
          <input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="table-search-bar"
          />
          <button className="manage-btn" onClick={onAdd}>Add Group</button>
          <button className="manage-btn" onClick={onRefresh} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>
      <div className="card-border">
        <div className="card-scroll">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Company</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: 16 }}>Loading groups...</td></tr>
              ) : paginatedGroups.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 16 }}>No groups found.</td></tr>
              ) : (
                paginatedGroups.map((g) => (
                  <tr key={g.id}>
                    <td className="users-td">{g.id}</td>
                    <td className="users-td">{g.name}</td>
                    <td className="users-td">{companyMap.get(g.company_id) || g.company_id}</td>
                    <td className="users-td">
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="manage-btn edit" onClick={() => onEdit(g)}>Edit</button>
                        <button className="manage-btn delete" onClick={() => onDelete(g.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 12, alignItems: 'center' }}>
          <button className="manage-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ opacity: currentPage === 1 ? 0.5 : 1 }}>Prev</button>
          <span style={{ fontSize: '0.9rem' }}>Page {currentPage} of {totalPages}</span>
          <button className="manage-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}>Next</button>
        </div>
      )}
    </div>
  );
};

export default GroupTable;