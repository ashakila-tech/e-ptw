import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash, faSync } from '@fortawesome/free-solid-svg-icons';

interface Company {
  id: number;
  name: string;
}

interface Props {
  companies: Company[];
  loading: boolean;
  contractorCounts: Map<number, number>;
  workerCounts: Map<number, number>;
  onAdd: () => void;
  onRefresh: () => void;
  onEdit: (c: Company) => void;
  onDelete: (id: number) => void;
}

const CompanyTable: React.FC<Props> = ({
  companies,
  loading,
  contractorCounts,
  workerCounts,
  onAdd,
  onRefresh,
  onEdit,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredCompanies = useMemo(() => {
    const list = [...companies];
    let result = list.sort((a, b) => a.id - b.id);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }
    return result;
  }, [companies, searchQuery]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = filteredCompanies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="dashboard-container" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Companies</h3>
        <div className="users-toolbar">
          <input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="table-search-bar"
          />
          <button className="manage-btn" onClick={onAdd}>Add Company</button>
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
                <th>Contractors</th>
                <th>Workers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 16 }}>Loading companies...</td></tr>
              ) : paginatedCompanies.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 16 }}>No companies found.</td></tr>
              ) : (
                paginatedCompanies.map((c) => (
                  <tr key={c.id}>
                    <td className="users-td">{c.id}</td>
                    <td className="users-td">{c.name}</td>
                    <td className="users-td">{contractorCounts.get(c.id) || 0}</td>
                    <td className="users-td">{workerCounts.get(c.id) || 0}</td>
                    <td className="users-td">
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="icon-btn edit" onClick={() => onEdit(c)} title="Edit">
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </button>
                        <button className="icon-btn delete" onClick={() => onDelete(c.id)} title="Delete">
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
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 12, alignItems: 'center' }}>
        <button className="manage-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ opacity: currentPage === 1 ? 0.5 : 1 }}>Prev</button>
        <span style={{ fontSize: '0.9rem' }}>Page {currentPage} of {totalPages}</span>
        <button className="manage-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}>Next</button>
      </div>
    </div>
  );
};

export default CompanyTable;