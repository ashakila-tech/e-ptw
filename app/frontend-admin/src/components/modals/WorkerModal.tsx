import React, { useState, useEffect } from 'react';
import { createWorker, updateWorker, API_BASE_URL, fetchCompanies } from '../../../../shared/services/api';
import { employmentStatusItems, employmentTypeItems } from '../../../../shared/constants/workerOptions';

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: any | null;
  companyId?: number | null;
  onSaved?: () => void;
};

const WorkerModal: React.FC<Props> = ({ open, onClose, initial = null, companyId = null, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [icPassport, setIcPassport] = useState('');
  const [contact, setContact] = useState('');
  const [position, setPosition] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [selectedCompanyForNew, setSelectedCompanyForNew] = useState('');

  useEffect(() => {
    const loadData = async () => {
      // Common resets
      setError(null);
      setLoading(false);
      setPictureFile(null);

      if (initial) { // Editing existing worker
        setName(initial.name || '');
        setIcPassport(initial.ic_passport || '');
        setContact(initial.contact || '');
        setPosition(initial.position || '');
        setEmploymentStatus(initial.employment_status || '');
        setEmploymentType(initial.employment_type || '');
        if (initial.picture) {
          setPreviewUrl(`${API_BASE_URL}api/workers/${initial.id}/picture?timestamp=${new Date().getTime()}`);
        } else {
          setPreviewUrl(null);
        }
        setCompanies([]);
        setSelectedCompanyForNew('');
      } else { // Adding new worker
        setName(''); setIcPassport(''); setContact(''); setPosition(''); setEmploymentStatus(''); setEmploymentType('');
        setPreviewUrl(null);
        setSelectedCompanyForNew(companyId ? String(companyId) : '');
        try {
          const companyList = await fetchCompanies();
          setCompanies(companyList || []);
        } catch (e) {
          console.error('Failed to fetch companies', e);
          setError('Could not load company list.');
        }
      }
    };

    if (open) {
      loadData();
    }

    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [initial, open, companyId]);

  // Revoke object URL when previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        name: name || '',
        ic_passport: icPassport || '',
        contact: contact || '',
        position: position || '',
        employment_status: employmentStatus || '',
        employment_type: employmentType || '',
      };
      if (pictureFile) payload.picture = pictureFile;

      if (initial && initial.id) {
        // Editing: company_id is fixed.
        payload.company_id = initial.company_id;
        await updateWorker(initial.id, payload);
      } else {
        // Creating: company_id from dropdown.
        if (!selectedCompanyForNew) {
          setError('Please select a company for the new worker.');
          setLoading(false);
          return;
        }
        payload.company_id = parseInt(selectedCompanyForNew, 10);
        await createWorker(payload);
      }

      onSaved && onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.message || String(e) || 'Failed to save worker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-header">{initial ? 'Edit Worker' : 'Add Worker'}</h3>

        <div className="modal-grid">
          <div className="modal-full-width">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="worker-preview success" />
            ) : (
              <div className="worker-preview placeholder" />
            )}
            <div style={{ flex: 1 }}>
              <label className="form-label">Picture</label>
              <input type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files ? e.target.files[0] : null;
                if (f) {
                  if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
                  setPictureFile(f);
                  setPreviewUrl(URL.createObjectURL(f));
                } else {
                  setPictureFile(null);
                  setPreviewUrl(initial?.picture ? `${API_BASE_URL}api/workers/${initial.id}/picture?timestamp=${new Date().getTime()}` : null);
                }
              }} />
              <small style={{ color: '#6b7280' }}>Supported: JPG/PNG.</small>
            </div>
          </div>

          {!initial && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Company</label>
              <select
                className="form-input"
                value={selectedCompanyForNew}
                onChange={(e) => setSelectedCompanyForNew(e.target.value)}
              >
                <option value="">Select a company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="form-label">IC / Passport</label>
            <input className="form-input" value={icPassport} onChange={(e) => setIcPassport(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Contact</label>
            <input className="form-input" value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Position</label>
            <input className="form-input" value={position} onChange={(e) => setPosition(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Employment Status</label>
            <select className="form-input" value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)}>
              <option value="">Select status</option>
              {employmentStatusItems.map((it) => (
                <option key={it.value} value={it.value}>{it.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Employment Type</label>
            <select className="form-input" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
              <option value="">Select type</option>
              {employmentTypeItems.map((it) => (
                <option key={it.value} value={it.value}>{it.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div style={{ color: 'var(--color-status-rejected)', marginTop: 12 }}>{error}</div>}

        <div className="modal-actions">
          <button className="manage-btn" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="manage-btn" onClick={submit} disabled={loading}>
            {loading ? (initial ? 'Saving...' : 'Adding...') : (initial ? 'Save' : 'Add Worker')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerModal;
