import React, { useState, useEffect } from 'react';
import { createGroup, updateGroup } from '../../../shared/services/api';

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: { id: number; name: string; company_id: number } | null;
  companies: { id: number; name: string }[];
  onSaved?: () => void;
};

const GroupModal: React.FC<Props> = ({ open, onClose, initial = null, companies, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState<number | ''>('');

  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(false);
      if (initial) {
        setName(initial.name);
        setCompanyId(initial.company_id);
      } else {
        setName('');
        setCompanyId('');
      }
    }
  }, [open, initial]);

  if (!open) return null;

  const submit = async () => {
    if (!name.trim()) {
      setError('Group name is required.');
      return;
    }
    if (!companyId) {
      setError('Company is required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (initial) {
        await updateGroup(initial.id, { name, company_id: Number(companyId) });
      } else {
        await createGroup({ name, company_id: Number(companyId) });
      }
      onSaved && onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.message || String(e) || 'Failed to save group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '400px' }}>
        <h3 className="modal-header">{initial ? 'Edit Group' : 'Add Group'}</h3>
        <div className="modal-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <label className="form-label">Company</label>
            <select className="form-input" value={companyId} onChange={(e) => setCompanyId(Number(e.target.value))}>
              <option value="">Select a company</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
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

export default GroupModal;