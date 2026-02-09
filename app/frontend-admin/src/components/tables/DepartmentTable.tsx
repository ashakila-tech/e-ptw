import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash, faSync } from '@fortawesome/free-solid-svg-icons';
import TablePagination from './TablePagination';

interface Department {
  id: number;
  name: string;
  company_id: number;
}

interface Company {
  id: number;
  name: string;
}

interface Props {
  departments: Department[];
  loading: boolean;
  companies: Company[];
  departmentHeadCounts: Map<number, number>;
  onAdd: () => void;
  onRefresh: () => void;
  onEdit: (d: Department) => void;
  onDelete: (id: number) => void;
}

const DepartmentTable: React.FC<Props> = ({
  departments,
  loading,
  companies,
  departmentHeadCounts,
  onAdd,
  onRefresh,
  onEdit,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const companyMap = useMemo(() => new Map(companies.map(c => [c.id, c.name])), [companies]);

  const filteredDepartments = useMemo(() => {
    let list = [...departments];
    let result = list.sort((a, b) => a.name.localeCompare(b.name));
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(d => 
        d.name.toLowerCase().includes(q) ||
        (companyMap.get(d.company_id) || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [departments, searchQuery, companyMap]);

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = filteredDepartments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="dashboard-container" style={{ marginBottom: 20 }}>
      <div className="table-header">
        <h3 className="table-header-title">Departments</h3>
        <div className="users-toolbar">
          <input
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="table-search-bar"
          />
          <button className="manage-btn" onClick={onAdd}>Add Department</button>
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
                <th>Heads</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="table-message-cell">Loading departments...</td></tr>
              ) : paginatedDepartments.length === 0 ? (
                <tr><td colSpan={5} className="table-message-cell">No departments found.</td></tr>
              ) : (
                paginatedDepartments.map((d) => (
                  <tr key={d.id}>
                    <td className="users-td">{d.id}</td>
                    <td className="users-td">{d.name}</td>
                    <td className="users-td">{companyMap.get(d.company_id) || 'N/A'}</td>
                    <td className="users-td">{departmentHeadCounts.get(d.id) || 0}</td>
                    <td className="users-td">
                      <div className="actions-cell">
                        <button className="icon-btn edit" onClick={() => onEdit(d)} title="Edit">
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </button>
                        <button className="icon-btn delete" onClick={() => onDelete(d.id)} title="Delete">
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

export default DepartmentTable;