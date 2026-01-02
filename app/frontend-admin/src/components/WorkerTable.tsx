import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../../shared/services/api';

interface Worker {
  id: number;
  company_id: number;
  name: string;
  ic_passport: string;
  contact?: string;
  position?: string;
  employment_status?: string;
  picture?: string;
  [key: string]: any;
}

interface Props {
  workers: Worker[];
  loading: boolean;
  error: string | null;
  allCompanies: { id: number; name: string }[];
  onRefresh: () => void;
  onAddWorker: (companyId: number | null) => void;
  onEditWorker: (worker: Worker) => void;
  onDeleteWorker: (id: number) => void;
}

const WorkerThumb: React.FC<{ worker: Worker }> = ({ worker }) => {
  const [failed, setFailed] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    setFailed(false);
    if (worker.picture) {
      setSrc(`${API_BASE_URL}api/workers/${worker.id}/picture?timestamp=${new Date().getTime()}`);
    } else {
      setSrc(null);
    }
  }, [worker]);

  if (!src || failed) 
    return <div className='worker-thumb failure' />;

  return <img src={src} alt={worker.name || 'worker'} className="worker-thumb success" onError={() => setFailed(true)} />;
};

const WorkerTable: React.FC<Props> = ({
  workers,
  loading,
  error,
  allCompanies,
  onRefresh,
  onAddWorker,
  onEditWorker,
  onDeleteWorker,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  
  const [sortKey, setSortKey] = useState<'id'|'name'|'ic'|'contact'|'position'|'status'|'company'>('id');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');

  const handleSort = (key: typeof sortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const companyIdToNameMap = useMemo(() => {
    return new Map(allCompanies.map(c => [c.id, c.name]));
  }, [allCompanies]);

  const filteredCompanies = useMemo(() => {
    const q = companySearchQuery.toLowerCase().trim();
    if (!q) return allCompanies;
    return allCompanies.filter(c => c.name.toLowerCase().includes(q));
  }, [allCompanies, companySearchQuery]);

  const displayedWorkers = useMemo(() => {
    let list = [...workers];

    if (selectedCompanyId !== null) {
      list = list.filter(w => w.company_id === selectedCompanyId);
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter((w) => {
        const composite = [w.name, w.ic_passport, w.contact, w.position, w.employment_status].filter(Boolean).join(' ').toLowerCase();
        return composite.includes(q);
      });
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      switch (sortKey) {
        case 'id': return ((a.id||0)-(b.id||0)) * dir;
        case 'company':
          const companyA = companyIdToNameMap.get(a.company_id) || '';
          const companyB = companyIdToNameMap.get(b.company_id) || '';
          return companyA.localeCompare(companyB) * dir;
        case 'name': return String((a.name||'')).toLowerCase().localeCompare(String((b.name||'')).toLowerCase()) * dir;
        case 'ic': return String((a.ic_passport||'')).toLowerCase().localeCompare(String((b.ic_passport||'')).toLowerCase()) * dir;
        case 'contact': return String((a.contact||'')).toLowerCase().localeCompare(String((b.contact||'')).toLowerCase()) * dir;
        case 'position': return String((a.position||'')).toLowerCase().localeCompare(String((b.position||'')).toLowerCase()) * dir;
        case 'status': return String((a.employment_status||'')).toLowerCase().localeCompare(String((b.employment_status||'')).toLowerCase()) * dir;
        default: return 0;
      }
    });
    return list;
  }, [workers, searchQuery, selectedCompanyId, sortKey, sortDir, companyIdToNameMap]);

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>
          Workers
          {selectedCompanyId && (
            <span style={{ fontWeight: 'normal', fontSize: '0.9em', marginLeft: 8 }}>
              - {allCompanies.find(c => c.id === selectedCompanyId)?.name || 'Company'}
            </span>
          )}
        </h3>
        <div className="users-toolbar">
          <input
            aria-label="Search workers"
            placeholder="Search workers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="table-search-bar"
          />
          <button className="manage-btn" onClick={() => onAddWorker(selectedCompanyId)}>Add Worker</button>
          <button className="manage-btn" onClick={onRefresh} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <strong style={{ color: 'var(--color-primary)' }}>Filter by Company</strong>
          <input
            placeholder="Search companies..."
            value={companySearchQuery}
            onChange={(e) => setCompanySearchQuery(e.target.value)}
            className="table-search-bar"
            style={{ width: 200 }}
          />
        </div>
        <div className="companies-list">
          <div className="permit-status-item" style={{ justifyContent: 'space-between' }}>
            <span>All Companies</span>
            <button className="manage-btn view" onClick={() => setSelectedCompanyId(null)}>Select</button>
          </div>
          {filteredCompanies.map(c => (
            <div key={c.id} className="permit-status-item" style={{ justifyContent: 'space-between' }}>
              <span>{c.name}</span>
              <button className="manage-btn view" onClick={() => setSelectedCompanyId(c.id)}>Select</button>
            </div>
          ))}
          {filteredCompanies.length === 0 && <div className="permit-status-item">No companies found.</div>}
        </div>
      </div>

      <div className="card-border">
        <div className="card-scroll">
          <table className="users-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')}>ID {sortKey === 'id' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('company')}>Company {sortKey === 'company' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th>Picture</th>
                <th onClick={() => handleSort('name')}>Name {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('ic')}>IC / Passport {sortKey === 'ic' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('contact')}>Contact {sortKey === 'contact' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('position')}>Position {sortKey === 'position' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('status')}>Employment Status {sortKey === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ padding: 16 }}>Loading workers…</td></tr>
              ) : error ? (
                <tr><td colSpan={9} style={{ padding: 16, color: 'red' }}>Error: {error}</td></tr>
              ) : displayedWorkers.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 16 }}>No workers found.</td></tr>
              ) : (
                displayedWorkers.map((w) => (
                  <tr key={w.id}>
                    <td className="users-td">{w.id}</td>
                    <td className="users-td">{companyIdToNameMap.get(w.company_id) || '-'}</td>
                    <td className="users-td" style={{ width: 56 }}>
                      <WorkerThumb worker={w} />
                    </td>
                    <td className="users-td">{w.name}</td>
                    <td className="users-td">{w.ic_passport ?? '-'}</td>
                    <td className="users-td">{w.contact ?? '-'}</td>
                    <td className="users-td">{w.position ?? '-'}</td>
                    <td className="users-td">{w.employment_status ?? '-'}</td>
                    <td className="users-td">
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="manage-btn edit" onClick={() => onEditWorker(w)}>Edit</button>
                        <button className="manage-btn delete" onClick={() => onDeleteWorker(w.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkerTable;