import React, { useState, useEffect } from 'react';
import { createCompany, updateCompany /*, fetchGroups, createGroup, updateGroup, deleteGroup*/ } from '../../../../shared/services/api';

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: { id: number; name: string } | null;
  onSaved?: () => void;
};

/*
type GroupItem = {
  id?: number;
  name: string;
  status: 'existing' | 'new' | 'modified' | 'deleted';
};
*/

const CompanyModal: React.FC<Props> = ({ open, onClose, initial = null, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  
  // Group management states
  // const [groups, setGroups] = useState<GroupItem[]>([]);
  // const [groupInput, setGroupInput] = useState('');

  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(false);
      // setGroupInput('');
      // setGroups([]);

      if (initial) {
        setName(initial.name);
        // fetchGroups(initial.id).then((data) => {
        //   setGroups(data.map((g: any) => ({ id: g.id, name: g.name, status: 'existing' })));
        // }).catch(console.error);
      } else {
        setName('');
      }
    }
  }, [open, initial]);

  if (!open) return null;

  /*
  const addGroup = () => {
    if (groupInput.trim()) {
      setGroups([...groups, { name: groupInput.trim(), status: 'new' }]);
      setGroupInput('');
    }
  };

  const updateGroupName = (index: number, newName: string) => {
    const list = [...groups];
    list[index].name = newName;
    if (list[index].status === 'existing') list[index].status = 'modified';
    setGroups(list);
  };

  const removeGroup = (index: number) => {
    const list = [...groups];
    if (list[index].status === 'new') list.splice(index, 1);
    else list[index].status = 'deleted';
    setGroups(list);
  };
  */

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

      /*
      if (companyId) {
        const promises = groups.map(g => {
          if (g.status === 'new') return createGroup({ company_id: companyId!, name: g.name });
          if (g.status === 'modified' && g.id) return updateGroup(g.id, { name: g.name, company_id: companyId! });
          if (g.status === 'deleted' && g.id) return deleteGroup(g.id);
          return Promise.resolve();
        });
        await Promise.all(promises);
      }
      */
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

          {/*
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
              {groups.map((g, i) => {
                if (g.status === 'deleted') return null;
                return (
                  <div key={i} style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" value={g.name} onChange={(e) => updateGroupName(i, e.target.value)} />
                    <button className="manage-btn delete" type="button" onClick={() => removeGroup(i)}>Delete</button>
                  </div>
                );
              })}
            </div>
          </div>
          */}
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