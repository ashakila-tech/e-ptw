import React, { useMemo } from 'react';

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
  const companyMap = useMemo(() => {
    const map = new Map<number, string>();
    companies.forEach(c => map.set(c.id, c.name));
    return map;
  }, [companies]);

  const sortedGroups = useMemo(() => {
    const list = [...groups];
    list.sort((a, b) => a.id - b.id);
    return list;
  }, [groups]);

  return (
    <div className="dashboard-container" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Groups</h3>
        <div className="users-toolbar">
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
              ) : sortedGroups.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 16 }}>No groups found.</td></tr>
              ) : (
                sortedGroups.map((g) => (
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
    </div>
  );
};

export default GroupTable;