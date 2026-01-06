import React, { useState } from 'react';

interface Item {
  id: number;
  name: string;
  [key: string]: any;
}

interface ManageListProps {
  title: string;
  items: Item[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
}

const ManageList: React.FC<ManageListProps> = ({ title, items, loading, onAdd, onEdit, onDelete }) => {
  const [isManaging, setIsManaging] = useState(false);

  const iconButtonStyle = {
    background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center'
  };

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button onClick={() => setIsManaging(!isManaging)} className="manage-btn">
          {isManaging ? 'Done' : 'Manage'}
        </button>
        {isManaging && (
          <button onClick={onAdd} style={{ ...iconButtonStyle, color: '#10b981', marginLeft: 5 }} title={`Add ${title}`}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        )}
      </div>
      <ul className="location-list">
        {loading ? (
          <li className="location-item">Loading...</li>
        ) : items.length === 0 ? (
          <li className="location-item">No items found</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="location-item">
              <div className="location-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>{item.name}</span>
                {isManaging && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => onEdit(item)} style={{ ...iconButtonStyle, color: '#3b82f6' }} title="Edit">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button onClick={() => onDelete(item.id)} style={{ ...iconButtonStyle, color: '#ef4444' }} title="Remove">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ManageList;