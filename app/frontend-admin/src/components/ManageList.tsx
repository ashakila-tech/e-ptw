import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPencilAlt, faTrash, faUserTag } from '@fortawesome/free-solid-svg-icons';

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
  onAssign?: (item: Item) => void;
}

const ManageList: React.FC<ManageListProps> = ({ title, items, loading, onAdd, onEdit, onDelete, onAssign }) => {
  const [isManaging, setIsManaging] = useState(false);

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button onClick={() => setIsManaging(!isManaging)} className="manage-btn">
          {isManaging ? 'Done' : 'Manage'}
        </button>
        {isManaging && (
          <button onClick={onAdd} className="icon-btn add" style={{ marginLeft: 5 }} title={`Add ${title}`}>
            <FontAwesomeIcon icon={faPlus} />
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
                    {onAssign && (
                      <button onClick={() => onAssign(item)} className="icon-btn assign" title="Assign Users">
                        <FontAwesomeIcon icon={faUserTag} />
                      </button>
                    )}
                    <button onClick={() => onEdit(item)} className="icon-btn edit" title="Edit">
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="icon-btn delete" title="Remove">
                      <FontAwesomeIcon icon={faTrash} />
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