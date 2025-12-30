import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useUsers } from '../hooks/useUsers';
import { fetchWorkers, createWorker, updateWorker, deleteWorker, API_BASE_URL } from '../../../shared/services/api';
import WorkerModal from '../components/WorkerModal';

const Users: React.FC = () => {
  const { users, loading, error, refetch } = useUsers();
  const [query, setQuery] = useState<string>('');
  const [sortKey, setSortKey] = useState<'id' | 'name' | 'email' | 'company' | 'groups'>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Workers state & refresh
  const [workers, setWorkers] = useState<any[]>([]);
  const [workersLoading, setWorkersLoading] = useState<boolean>(false);
  const [workersError, setWorkersError] = useState<string | null>(null);
  const [workersRefresh, setWorkersRefresh] = useState(0);

  // Modal & editing state
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any | null>(null);

  const openAddWorker = () => { setEditingWorker(null); setWorkerModalOpen(true); };
  const openEditWorker = (w: any) => { setEditingWorker(w); setWorkerModalOpen(true); };
  const closeWorkerModal = () => { setEditingWorker(null); setWorkerModalOpen(false); };
  const handleWorkerSaved = () => { /* refresh workers list after save */ setWorkersRefresh(k => k + 1); };

  const handleDeleteWorker = async (id: number) => {
    if (!confirm('Delete this worker? This action cannot be undone.')) return;
    try {
      await deleteWorker(id);
      setWorkersRefresh(k => k + 1);
    } catch (e: any) {
      alert(e?.message || String(e) || 'Failed to delete worker');
    }
  };

  const handleSort = useCallback((key: typeof sortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    let list = (users || []).slice();
    if (q) {
      list = list.filter((u) => {
        const composite = [u.name, u.email, u.company_name, (u.groups || []).join(' ')].filter(Boolean).join(' ').toLowerCase();
        return composite.includes(q);
      });
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === 'id') return (a.id - b.id) * dir;
      const av = (sortKey === 'company' ? (a.company_name || '') : (sortKey === 'groups' ? (a.groups || []).join(', ') : ((a as any)[sortKey] || ''))).toString().toLowerCase();
      const bv = (sortKey === 'company' ? (b.company_name || '') : (sortKey === 'groups' ? (b.groups || []).join(', ') : ((b as any)[sortKey] || ''))).toString().toLowerCase();
      return av.localeCompare(bv) * dir;
    });
    return list;
  }, [users, query, sortKey, sortDir]);

  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string | null>(null);

  const companies = useMemo(() => {
    const map = new Map<number, string>();
    (users || []).forEach((u: any) => {
      if (!u?.company_id) return;
      if (!map.has(u.company_id)) map.set(u.company_id, u.company_name || `Company ${u.company_id}`);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [users]);

  const companyIdToNameMap = useMemo(() => {
    return new Map(companies.map(c => [c.id, c.name]));
  }, [companies]);

  // Thumbnail component to handle image load errors per-row with a single resolution retry
  const WorkerThumb: React.FC<{ worker: any }> = ({ worker }) => {
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


  // Company search (helps when many companies exist)
  const [companyQuery, setCompanyQuery] = useState<string>('');
  const companiesFiltered = useMemo(() => {
    const q = (companyQuery || '').trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(c => String(c.name).toLowerCase().includes(q));
  }, [companies, companyQuery]);

  // Worker search & sorting
  const [workerQuery, setWorkerQuery] = useState<string>('');
  const [workersSortKey, setWorkersSortKey] = useState<'id'|'name'|'ic'|'contact'|'position'|'status'|'company'>('id');
  const [workersSortDir, setWorkersSortDir] = useState<'asc'|'desc'>('asc');

  const handleWorkerSort = useCallback((key: typeof workersSortKey) => {
    if (key === workersSortKey) setWorkersSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setWorkersSortKey(key); setWorkersSortDir('asc'); }
  }, [workersSortKey]);

  const loadWorkersForCompany = useCallback(async (companyId: number | null, companyName?: string | null) => {
    setSelectedCompanyId(companyId);
    setSelectedCompanyName(companyName ?? null);
    setWorkersLoading(true);
    setWorkersError(null);
    try {
      const res = companyId ? await fetchWorkers(companyId) : await fetchWorkers();
      const sorted = (res || []).slice().sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
      setWorkers(sorted);
    } catch (e: any) {
      setWorkersError(e?.message || String(e));
    } finally {
      setWorkersLoading(false);
    }
  }, []);

  useEffect(() => {
    // when workersRefresh increments, reload the currently selected company's workers (or all)
    loadWorkersForCompany(selectedCompanyId, selectedCompanyName);
  }, [workersRefresh, selectedCompanyId, selectedCompanyName, loadWorkersForCompany]);

  const displayedWorkers = useMemo(() => {
    const q = (workerQuery || '').trim().toLowerCase();
    let list = (workers || []).slice();
    if (q) {
      list = list.filter((w: any) => {
        const composite = [w.name, w.ic_passport, w.contact, w.position, w.employment_status].filter(Boolean).join(' ').toLowerCase();
        return composite.includes(q);
      });
    }
    const dir = workersSortDir === 'asc' ? 1 : -1;
    list.sort((a: any, b: any) => {
      switch (workersSortKey) {
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
  }, [workers, workerQuery, workersSortKey, workersSortDir, companyIdToNameMap]);

  return (
    <div className="content-area">
      <h1 className="page-title">Users</h1>

      <div className="dashboard-container">

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Users List</h3>
          <div className="users-toolbar">
            <input
              aria-label="Search users"
              placeholder="Search by name, email, company or group"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="table-search-bar"
            />
            <button className="manage-btn" onClick={() => refetch()} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="card-border">
          <div className="card-scroll">
            <table className="users-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')}>ID {sortKey === 'id' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th onClick={() => handleSort('name')}>Name {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th onClick={() => handleSort('email')}>Email {sortKey === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th onClick={() => handleSort('company')}>Company {sortKey === 'company' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th onClick={() => handleSort('groups')}>Groups {sortKey === 'groups' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 16 }}>Loading users…</td></tr>
                ) : error ? (
                  <tr><td colSpan={5} style={{ padding: 16, color: 'red' }}>Error: {error}</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 16 }}>No users found.</td></tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id}>
                      <td className="users-td">{u.id}</td>
                      <td className="users-td">{u.name}</td>
                      <td className="users-td">{u.email ?? '—'}</td>
                      <td className="users-td">{u.company_name ?? `Company ${u.company_id}`}</td>
                      <td className="users-td">{u.groups.join(', ') || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Workers table */}
      <div className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Workers</h3>
        </div>

        {/* Companies list: pick a company to view its workers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong style={{ color: 'var(--color-primary)' }}>Companies</strong>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              aria-label="Search companies"
              placeholder="Search companies"
              value={companyQuery}
              onChange={(e) => setCompanyQuery(e.target.value)}
              className="table-search-bar"
            />
            <button className="manage-btn" onClick={() => { refetch(); setWorkersRefresh(k => k + 1); if (selectedCompanyId) loadWorkersForCompany(selectedCompanyId, selectedCompanyName); }}>{'Refresh'}</button>
          </div>
        </div>

        <div className="companies-list" style={{ marginBottom: 12 }}>
          {/* All companies item */}
          <div className="permit-status-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>All companies</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className="manage-btn view" 
                onClick={() => { loadWorkersForCompany(null, null); setSelectedCompanyId(null); setSelectedCompanyName(null); }}
              >
                View
              </button>
            </div>
          </div>

          {companiesFiltered.length === 0 ? (
            <div className="permit-status-item">No companies found.</div>
          ) : companiesFiltered.map((c: any) => (
            <div key={c.id} className="permit-status-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>{c.name}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="manage-btn view" onClick={() => loadWorkersForCompany(c.id, c.name)}>View</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong style={{ color: 'var(--color-primary)' }}>{selectedCompanyName ? `Workers List - ${selectedCompanyName}` : 'Workers List - All'}</strong>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              aria-label="Search workers"
              placeholder="Search workers"
              value={workerQuery}
              onChange={(e) => setWorkerQuery(e.target.value)}
              className="table-search-bar"
            />
            <button className="manage-btn" onClick={openAddWorker}>Add Worker</button>
            <button className="manage-btn" onClick={() => { setWorkersRefresh(k => k + 1); if (selectedCompanyId) loadWorkersForCompany(selectedCompanyId, selectedCompanyName); }}>{workersLoading ? 'Refreshing...' : 'Refresh'}</button>
          </div>
        </div>

        <div className="card-border">
          <div className="card-scroll">
            <table className="users-table">
              <thead>
                <tr>
                  <th onClick={() => handleWorkerSort('id')}>ID {workersSortKey === 'id' ? (workersSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th onClick={() => handleWorkerSort('company')}>Company {workersSortKey === 'company' ? (workersSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th>Picture</th>
                  <th onClick={() => handleWorkerSort('name')}>Name {workersSortKey === 'name' ? (workersSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th onClick={() => handleWorkerSort('ic')}>IC / Passport {workersSortKey === 'ic' ? (workersSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th onClick={() => handleWorkerSort('contact')}>Contact {workersSortKey === 'contact' ? (workersSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th onClick={() => handleWorkerSort('position')}>Position {workersSortKey === 'position' ? (workersSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th onClick={() => handleWorkerSort('status')}>Employment Status {workersSortKey === 'status' ? (workersSortDir === 'asc' ? '▲' : '▼') : ''}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workersLoading ? (
                  <tr><td colSpan={9} style={{ padding: 16 }}>Loading workers…</td></tr>
                ) : workersError ? (
                  <tr><td colSpan={9} style={{ padding: 16, color: 'red' }}>Error: {workersError}</td></tr>
                ) : (displayedWorkers || []).length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: 16 }}>No workers found.</td></tr>
                ) : (
                  displayedWorkers.map((w: any) => (
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
                          <button className="manage-btn edit" onClick={() => openEditWorker(w)}>Edit</button>
                          <button className="manage-btn delete" onClick={() => handleDeleteWorker(w.id)}>Delete</button>
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

      <WorkerModal
        open={workerModalOpen}
        onClose={closeWorkerModal}
        initial={editingWorker}
        companyId={selectedCompanyId}
        onSaved={handleWorkerSaved}
      />
    </div>
  );
};

export default Users;