import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  fetchLocationManagersByLocation,
  createLocationManager,
  deleteLocationManager,
  fetchPermitOfficersByPermitType,
  createPermitOfficer,
  deletePermitOfficer,
} from '../../../../shared/services/api';

interface Props {
  open: boolean;
  onClose: () => void;
  type: 'location' | 'permit_type';
  item: { id: number; name: string } | null;
  allUsers: any[];
}

const ManagerAssignmentModal: React.FC<Props> = ({ open, onClose, type, item, allUsers }) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    if (open && item) {
      loadAssignments();
      setSelectedUser('');
      setError('');
    }
  }, [open, item, type]);

  const loadAssignments = async () => {
    if (!item) return;
    setLoading(true);
    try {
      let data: any;
      if (type === 'location') {
        data = await fetchLocationManagersByLocation(item.id);
      } else {
        data = await fetchPermitOfficersByPermitType(item.id);
      }
      // Handle potential pagination structure
      const results = Array.isArray(data) ? data : (data.results || []);
      setAssignments(results);
    } catch (e: any) {
      setError(e.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!item || !selectedUser) return;
    try {
      if (type === 'location') {
        await createLocationManager({ user_id: parseInt(selectedUser), location_id: item.id });
      } else {
        await createPermitOfficer({ user_id: parseInt(selectedUser), permit_type_id: item.id });
      }
      setSelectedUser('');
      loadAssignments();
    } catch (e: any) {
      alert(e.message || 'Failed to add assignment');
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm('Remove this user assignment?')) return;
    try {
      if (type === 'location') {
        await deleteLocationManager(id);
      } else {
        await deletePermitOfficer(id);
      }
      loadAssignments();
    } catch (e: any) {
      alert(e.message || 'Failed to remove assignment');
    }
  };

  const availableUsers = useMemo(() => {
    const assignedUserIds = new Set(assignments.map(a => a.user_id));
    return allUsers.filter(u => !assignedUserIds.has(u.id));
  }, [allUsers, assignments]);

  if (!open || !item) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h3>Manage Users for: {item.name}</h3>
          <button onClick={onClose} className="icon-btn">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="modal-body">
          {loading && <p>Loading...</p>}
          {error && <p className="form-error-text">{error}</p>}

          {!loading && !error && (
            <div className="modal-body-vertical">
              <div className="assignment-section">
                <h4>Assigned Users</h4>
                {assignments.map(a => {
                  const user = allUsers.find(u => u.id === a.user_id);
                  return (
                    <div key={a.id} className="assignment-item">
                      <span>{user ? user.name : `User ID: ${a.user_id}`}</span>
                      <button onClick={() => handleRemove(a.id)} className="icon-btn delete" title="Remove">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  );
                })}
                {assignments.length === 0 && <p className="empty-state">No users assigned.</p>}
                
                <div className="assignment-add">
                  <select 
                    value={selectedUser} 
                    onChange={e => setSelectedUser(e.target.value)} 
                    className="form-input"
                  >
                    <option value="">Select user to assign...</option>
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                  <button onClick={handleAdd} className="manage-btn" disabled={!selectedUser}>Add</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="manage-btn view">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ManagerAssignmentModal;