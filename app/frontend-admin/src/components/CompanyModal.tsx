import React, { useState, useEffect } from 'react';
import { createCompany, updateCompany } from '../../../shared/services/api';

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: { id: number; name: string } | null;
  onSaved?: () => void;
};

const CompanyModal: React.FC<Props> = ({ open, onClose, initial = null, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(false);
      if (initial) {
        setName(initial.name);
      } else {
        setName('');
      }
    }
  }, [open, initial]);

  if (!open) return null;

  const submit = async () => {
    if (!name.trim()) {
      setError('Company name is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (initial) {
        await updateCompany(initial.id, name);
      } else {
        await createCompany(name);
      }
      onSaved && onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.message || String(e) || 'Failed to save company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '400px' }}>
        <h3 className="modal-header">{initial ? 'Edit Company' : 'Add Company'}</h3>
        <div className="modal-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        {error && <div style={{ color: 'var(--color-status-rejected)', marginTop: 12 }}>{error}</div>}
        <div className="modal-actions">
          <button className="manage-btn" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="manage-btn" onClick={submit} disabled={loading}>
            {loading ? 'Saving...' : (initial ? 'Save' : 'Add')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;