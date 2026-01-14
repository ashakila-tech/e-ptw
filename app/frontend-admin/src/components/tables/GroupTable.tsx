import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash, faSync } from '@fortawesome/free-solid-svg-icons';
import TablePagination from './TablePagination';

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
      <div className="table-header">
        <h3 className="table-header-title">Groups</h3>
        <div className="users-toolbar">
          <input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="table-search-bar"
          />
          <button className="manage-btn" onClick={onAdd}>Add Group</button>
          <button className="icon-btn refresh" onClick={onRefresh} disabled={loading} title="Refresh">
            <FontAwesomeIcon icon={faSync} spin={loading} />
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
                <tr><td colSpan={4} className="table-message-cell">Loading groups...</td></tr>
              ) : paginatedGroups.length === 0 ? (
                <tr><td colSpan={4} className="table-message-cell">No groups found.</td></tr>
              ) : (
                paginatedGroups.map((g) => (
                  <tr key={g.id}>
                    <td className="users-td">{g.id}</td>
                    <td className="users-td">{g.name}</td>
                    <td className="users-td">{companyMap.get(g.company_id) || g.company_id}</td>
                    <td className="users-td">
                      <div className="actions-cell">
                        <button className="icon-btn edit" onClick={() => onEdit(g)} title="Edit">
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </button>
                        <button className="icon-btn delete" onClick={() => onDelete(g.id)} title="Delete">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default GroupTable;