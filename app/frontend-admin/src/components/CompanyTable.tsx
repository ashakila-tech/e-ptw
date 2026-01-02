import React from 'react';

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
  return (
    <div className="dashboard-container" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Companies</h3>
        <div className="users-toolbar">
          <button className="manage-btn" onClick={onAdd}>Add Company</button>
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
                <th>Contractors</th>
                <th>Workers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 16 }}>Loading companies...</td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 16 }}>No companies found.</td></tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id}>
                    <td className="users-td">{c.id}</td>
                    <td className="users-td">{c.name}</td>
                    <td className="users-td">{contractorCounts.get(c.id) || 0}</td>
                    <td className="users-td">{workerCounts.get(c.id) || 0}</td>
                    <td className="users-td">
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="manage-btn edit" onClick={() => onEdit(c)}>Edit</button>
                        <button className="manage-btn delete" onClick={() => onDelete(c.id)}>Delete</button>
                      </div>
                    </td>
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

export default CompanyTable;