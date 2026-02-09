import React, { useState, useEffect } from 'react';
import { createDepartment, updateDepartment } from '../../../../shared/services/api';

interface Props {
  open: boolean;
  onClose: () => void;
  initial: { id: number; name: string; company_id: number } | null;
  companies: { id: number; name: string }[];
  onSaved: () => void;
}

const DepartmentModal: React.FC<Props> = ({ open, onClose, initial, companies, onSaved }) => {
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setCompanyId(initial.company_id);
    } else {
      setName('');
      setCompanyId('');
    }
    setError(null);
  }, [initial, open]);

  const handleSave = async () => {
    if (!name.trim() || !companyId) {
      setError('Name and company are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (initial) {
        await updateDepartment(initial.id, { name, company_id: Number(companyId) });
      } else {
        await createDepartment({ name, company_id: Number(companyId) });
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to save department.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-header">{initial ? 'Edit Department' : 'Add Department'}</h3>
        
        <div>
          <label className="form-label">Department Name</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Engineering"
          />
        </div>

        <div style={{ marginTop: 15 }}>
          <label className="form-label">Company</label>
          <select
            className="form-input"
            value={companyId}
            onChange={(e) => setCompanyId(Number(e.target.value))}
            disabled={!!initial} // Don't allow changing company on edit
          >
            <option value="" disabled>Select a company</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {error && <div className="form-error-text" style={{ marginTop: 15 }}>{error}</div>}

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="manage-btn" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentModal;