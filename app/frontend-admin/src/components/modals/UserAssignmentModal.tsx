import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  fetchLocations,
  fetchPermitTypes,
  fetchLocationForSiteManager,
  fetchPermitTypeForSafetyOfficer,
  createLocationManager,
  deleteLocationManager,
  createPermitOfficer,
  deletePermitOfficer,
} from '../../../../shared/services/api';
import type { EnrichedUser } from '../../hooks/useUsers';

interface Props {
  open: boolean;
  onClose: () => void;
  user: EnrichedUser | null;
  onSaved: () => void;
}

type Location = { id: number; name: string };
type PermitType = { id: number; name: string };
type LocationAssignment = { id: number; location_id: number; location_name: string };
type PermitAssignment = { id: number; permit_type_id: number; permit_type_name: string };

const UserAssignmentModal: React.FC<Props> = ({ open, onClose, user, onSaved }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [permitTypes, setPermitTypes] = useState<PermitType[]>([]);
  const [locationAssignments, setLocationAssignments] = useState<LocationAssignment[]>([]);
  const [permitAssignments, setPermitAssignments] = useState<PermitAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedPermitType, setSelectedPermitType] = useState<string>('');

  const isSiteManager = useMemo(() => user?.groups.some(g => g.toLowerCase() === 'site manager'), [user]);
  const isSafetyOfficer = useMemo(() => user?.groups.some(g => g.toLowerCase() === 'safety officer'), [user]);

  useEffect(() => {
    if (!open || !user) {
      // Reset state on close or if user is null
      setLocationAssignments([]);
      setPermitAssignments([]);
      setLocations([]);
      setPermitTypes([]);
      setError('');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        if (isSiteManager) {
          const [locs, locAssigns] = await Promise.all([
            fetchLocations(),
            fetchLocationForSiteManager(user.id),
          ]);
          setLocations(locs || []);
          setLocationAssignments(locAssigns || []);
        }
        if (isSafetyOfficer) {
          const [pTypes, pAssigns] = await Promise.all([
            fetchPermitTypes(),
            fetchPermitTypeForSafetyOfficer(user.id),
          ]);
          setPermitTypes(pTypes || []);
          setPermitAssignments(pAssigns || []);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load assignment data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, user, isSiteManager, isSafetyOfficer]);

  const availableLocations = useMemo(() => {
    const assignedIds = new Set(locationAssignments.map(a => a.location_id));
    return locations.filter(l => !assignedIds.has(l.id));
  }, [locations, locationAssignments]);

  const availablePermitTypes = useMemo(() => {
    const assignedIds = new Set(permitAssignments.map(a => a.permit_type_id));
    return permitTypes.filter(pt => !assignedIds.has(pt.id));
  }, [permitTypes, permitAssignments]);

  const handleAddLocation = async () => {
    if (!user || !selectedLocation) return;
    try {
      await createLocationManager({ user_id: user.id, location_id: parseInt(selectedLocation, 10) });
      const newAssignments = await fetchLocationForSiteManager(user.id);
      setLocationAssignments(newAssignments);
      setSelectedLocation('');
      onSaved();
    } catch (e: any) {
      alert(e.message || 'Failed to add assignment');
    }
  };

  const handleRemoveLocation = async (assignmentId: number) => {
    if (!user) return;
    if (!confirm('Remove this location assignment?')) return;
    try {
      await deleteLocationManager(assignmentId);
      const newAssignments = await fetchLocationForSiteManager(user.id);
      setLocationAssignments(newAssignments);
      onSaved();
    } catch (e: any) {
      alert(e.message || 'Failed to remove assignment');
    }
  };

  const handleAddPermitType = async () => {
    if (!user || !selectedPermitType) return;
    try {
      await createPermitOfficer({ user_id: user.id, permit_type_id: parseInt(selectedPermitType, 10) });
      const newAssignments = await fetchPermitTypeForSafetyOfficer(user.id);
      setPermitAssignments(newAssignments);
      setSelectedPermitType('');
      onSaved();
    } catch (e: any) {
      alert(e.message || 'Failed to add assignment');
    }
  };

  const handleRemovePermitType = async (assignmentId: number) => {
    if (!user) return;
    if (!confirm('Remove this permit type assignment?')) return;
    try {
      await deletePermitOfficer(assignmentId);
      const newAssignments = await fetchPermitTypeForSafetyOfficer(user.id);
      setPermitAssignments(newAssignments);
      onSaved();
    } catch (e: any) {
      alert(e.message || 'Failed to remove assignment');
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h3>Assignments for {user?.name}</h3>
          <button onClick={onClose} className="icon-btn">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="modal-body">
          {loading && <p>Loading...</p>}
          {error && <p className="form-error-text">{error}</p>}

          {!loading && !error && (
            <div className="modal-body-vertical">
              {isSiteManager && (
                <div className="assignment-section">
                  <h4>Location Manager For:</h4>
                  {locationAssignments.map(a => (
                    <div key={a.id} className="assignment-item">
                      <span>{a.location_name}</span>
                      <button onClick={() => handleRemoveLocation(a.id)} className="icon-btn delete" title="Remove">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                  {locationAssignments.length === 0 && <p className="empty-state">No locations assigned.</p>}
                  <div className="assignment-add">
                    <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} className="form-input">
                      <option value="">Select a location to add...</option>
                      {availableLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <button onClick={handleAddLocation} className="manage-btn" disabled={!selectedLocation}>Add</button>
                  </div>
                </div>
              )}

              {isSafetyOfficer && (
                <div className="assignment-section">
                  <h4>Permit Officer For:</h4>
                  {permitAssignments.map(a => (
                    <div key={a.id} className="assignment-item">
                      <span>{a.permit_type_name}</span>
                      <button onClick={() => handleRemovePermitType(a.id)} className="icon-btn delete" title="Remove">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                  {permitAssignments.length === 0 && <p className="empty-state">No permit types assigned.</p>}
                  <div className="assignment-add">
                    <select value={selectedPermitType} onChange={e => setSelectedPermitType(e.target.value)} className="form-input">
                      <option value="">Select a permit type to add...</option>
                      {availablePermitTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                    </select>
                    <button onClick={handleAddPermitType} className="manage-btn" disabled={!selectedPermitType}>Add</button>
                  </div>
                </div>
              )}
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

export default UserAssignmentModal;