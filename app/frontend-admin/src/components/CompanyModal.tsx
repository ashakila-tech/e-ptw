import React, { useState, useEffect } from 'react';
import { createCompany, updateCompany, fetchGroups, createGroup } from '../../../shared/services/api';

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
  
  // Group management states
  const [existingGroups, setExistingGroups] = useState<{ id: number; name: string }[]>([]);
  const [newGroups, setNewGroups] = useState<string[]>([]);
  const [groupInput, setGroupInput] = useState('');

  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(false);
      setNewGroups([]);
      setGroupInput('');
      setExistingGroups([]);

      if (initial) {
        setName(initial.name);
        fetchGroups(initial.id).then(setExistingGroups).catch(console.error);
      } else {
        setName('');
      }
    }
  }, [open, initial]);

  if (!open) return null;

  const addGroup = () => {
    if (groupInput.trim()) {
      setNewGroups([...newGroups, groupInput.trim()]);
      setGroupInput('');
    }
  };

  const removeNewGroup = (index: number) => {
    const list = [...newGroups];
    list.splice(index, 1);
    setNewGroups(list);
  };

  const submit = async () => {
    if (!name.trim()) {
      setError('Company name is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let companyId = initial?.id;

      if (initial) {
        await updateCompany(initial.id, name);
      } else {
        const newComp = await createCompany(name);
        companyId = newComp.id;
      }

      if (companyId && newGroups.length > 0) {
        await Promise.all(newGroups.map(gName => createGroup({ company_id: companyId!, name: gName })));
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

          <div>
            <label className="form-label">Groups</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input 
                className="form-input" 
                placeholder="Add a group (e.g. Contractor)" 
                value={groupInput} 
                onChange={(e) => setGroupInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') addGroup(); }}
              />
              <button className="manage-btn" onClick={addGroup} type="button">Add</button>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {existingGroups.map(g => (
                <span key={g.id} style={{ background: '#eee', padding: '4px 8px', borderRadius: 4, fontSize: '0.9em', border: '1px solid #ddd' }}>
                  {g.name}
                </span>
              ))}
              {newGroups.map((g, i) => (
                <span key={i} style={{ background: '#e0f0ff', padding: '4px 8px', borderRadius: 4, fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #b3d7ff' }}>
                  {g}
                  <span 
                    style={{ cursor: 'pointer', fontWeight: 'bold', color: '#666', marginLeft: 4 }}
                    onClick={() => removeNewGroup(i)}
                  >×</span>
                </span>
              ))}
            </div>
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