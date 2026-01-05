import React, { useState, useEffect } from 'react';
import { createUser, updateUser, fetchCompanies, fetchGroupsOptions, createUserGroup, deleteUserGroup, fetchUserGroups } from '../../../shared/services/api';

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: any | null;
  onSaved?: () => void;
};

const UserModal: React.FC<Props> = ({ open, onClose, initial = null, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [groupId, setGroupId] = useState<number | ''>('');
  const [companyId, setCompanyId] = useState<number | ''>('');
  const [loadedGroupId, setLoadedGroupId] = useState<number | null>(null);
  const [currentMappingId, setCurrentMappingId] = useState<number | null>(null);
  
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [groupOptions, setGroupOptions] = useState<{ value: number; label: string }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setError(null);
      setLoading(false);

      // Load companies
      try {
        const companyList = await fetchCompanies();
        setCompanies(companyList || []);
      } catch (e) {
        console.error('Failed to fetch companies', e);
        setError('Could not load company list.');
      }

      // Load all groups (Global)
      try {
        const groups = await fetchGroupsOptions({ page_size: 100 });
        setGroupOptions(groups || []);
      } catch (e) {
        console.error('Failed to fetch groups', e);
      }

      if (initial) {
        setName(initial.name || '');
        setEmail(initial.email || '');
        setCompanyId(initial.company_id || '');
        setPassword(''); // Reset password field for security

        // Fetch user's current group mapping to populate dropdown and prepare for update
        try {
          const res = await fetchUserGroups();
          const allMappings = Array.isArray(res) ? res : (res.results || []);
          const mapping = allMappings.find((m: any) => m.user_id === initial.id);
          if (mapping) {
            setGroupId(mapping.group_id);
            setLoadedGroupId(mapping.group_id);
            setCurrentMappingId(mapping.id);
          }
        } catch (e) {
          console.error('Failed to fetch user group mapping', e);
        }
      } else {
        setName('');
        setEmail('');
        setGroupId('');
        setCompanyId('');
        setPassword('');
        setLoadedGroupId(null);
        setCurrentMappingId(null);
      }
    };

    if (open) {
      loadData();
    }
  }, [initial, open]);

  /*
  useEffect(() => {
    if (companyId) {
      fetchGroupsOptions({ company_id: Number(companyId), page_size: 100 })
        .then((res: any) => setGroupOptions(res))
        .catch((e: any) => console.error('Failed to load groups', e));
      console.log("Group options:", groupOptions);
    } else {
      setGroupOptions([]);
    }
  }, [companyId]);
  */

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        name,
        email,
        user_type: 1, // Automatically set to 1
        company_id: companyId ? Number(companyId) : null,
      };

      if (password) {
        payload.password = password;
      }
      
      let savedUser;

      if (initial && initial.id) {
        savedUser = await updateUser(initial.id, payload);
        
        // Handle Group Update
        const newGroupId = groupId ? Number(groupId) : null;
        
        if (loadedGroupId !== newGroupId) {
          if (currentMappingId) {
            await deleteUserGroup(currentMappingId);
          }
          if (newGroupId) {
            await createUserGroup({ user_id: initial.id, group_id: newGroupId });
          }
        }
      } else {
        if (!password) throw new Error("Password is required for new users.");
        if (!companyId) throw new Error("Company is required.");
        savedUser = await createUser(payload);
        if (groupId) {
            await createUserGroup({ user_id: savedUser.id, group_id: Number(groupId) });
        }
      }

      onSaved && onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.message || String(e) || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-header">{initial ? 'Edit User' : 'Add User'}</h3>

        <div className="modal-grid">
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Company</label>
            <select className="form-input" value={companyId} onChange={(e) => setCompanyId(Number(e.target.value))}>
              <option value="">Select a company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Group</label>
            <select className="form-input" value={groupId} onChange={(e) => setGroupId(Number(e.target.value))}>
              <option value="">Select group</option>
              {groupOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Password {initial && <span style={{fontWeight:'normal', fontSize:'0.8em'}}>(Leave blank to keep)</span>}</label>
            <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={initial ? "********" : ""} />
          </div>
        </div>

        {error && <div style={{ color: 'var(--color-status-rejected)', marginTop: 12 }}>{error}</div>}

        <div className="modal-actions">
          <button className="manage-btn" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="manage-btn" onClick={submit} disabled={loading}>
            {loading ? 'Saving...' : (initial ? 'Save' : 'Add User')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;