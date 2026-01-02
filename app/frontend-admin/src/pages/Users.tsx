import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useUsers } from '../hooks/useUsers';
import { fetchWorkers, createWorker, updateWorker, deleteWorker, API_BASE_URL } from '../../../shared/services/api';
import WorkerModal from '../components/WorkerModal';
import UserTable from '../components/UserTable';
import WorkerTable from '../components/WorkerTable';

const Users: React.FC = () => {
  const { users, loading, error, refetch } = useUsers();

  // Workers state & refresh
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  const [workersLoading, setWorkersLoading] = useState<boolean>(false);
  const [workersError, setWorkersError] = useState<string | null>(null);
  const [workersRefresh, setWorkersRefresh] = useState(0);

  // Modal & editing state
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any | null>(null);
  const [selectedCompanyForModal, setSelectedCompanyForModal] = useState<number | null>(null);

  const openAddWorker = (companyId: number | null) => { setSelectedCompanyForModal(companyId); setEditingWorker(null); setWorkerModalOpen(true); };
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

  const companies = useMemo(() => {
    const map = new Map<number, string>();
    (users || []).forEach((u: any) => {
      if (!u?.company_id) return;
      if (!map.has(u.company_id)) map.set(u.company_id, u.company_name || `Company ${u.company_id}`);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [users]);

  const contractors = useMemo(() => users.filter(u => u.groups.some(g => g.toLowerCase() === 'contractor')), [users]);
  const supervisors = useMemo(() => users.filter(u => u.groups.some(g => g.toLowerCase() === 'supervisor')), [users]);
  const areaOwners = useMemo(() => users.filter(u => u.groups.some(g => g.toLowerCase() === 'area owner')), [users]);
  const siteManagers = useMemo(() => users.filter(u => u.groups.some(g => g.toLowerCase() === 'site manager')), [users]);
  const safetyOfficers = useMemo(() => users.filter(u => u.groups.some(g => g.toLowerCase() === 'safety officer')), [users]);

  const contractorCounts = useMemo(() => {
    const map = new Map<number, number>();
    users.forEach((u) => {
      if (u.groups.some((g: string) => g.toLowerCase() === 'contractor')) {
        map.set(u.company_id, (map.get(u.company_id) || 0) + 1);
      }
    });
    return map;
  }, [users]);

  const workerCounts = useMemo(() => {
    const map = new Map<number, number>();
    allWorkers.forEach((w) => {
      map.set(w.company_id, (map.get(w.company_id) || 0) + 1);
    });
    return map;
  }, [allWorkers]);

  const loadAllWorkers = useCallback(async () => {
    setWorkersLoading(true);
    setWorkersError(null);
    try {
      const res = await fetchWorkers();
      setAllWorkers(res || []);
    } catch (e: any) {
      setWorkersError(e?.message || String(e));
    } finally {
      setWorkersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllWorkers();
  }, [workersRefresh, loadAllWorkers]);

  return (
    <div className="content-area">
      <h1 className="page-title">Users</h1>

      <div className="dashboard-container" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Companies</h3>
          <div className="users-toolbar">
            <button className="manage-btn" onClick={() => { refetch(); setWorkersRefresh(k => k + 1); }} disabled={loading || workersLoading}>
              Refresh
            </button>
          </div>
        </div>
        <div className="card-border">
          <div className="card-scroll">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Contractors</th>
                  <th>Workers</th>
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 16 }}>No companies found.</td></tr>
                ) : (
                  companies.map((c) => (
                    <tr key={c.id}>
                      <td className="users-td">{c.id}</td>
                      <td className="users-td">{c.name}</td>
                      <td className="users-td">{contractorCounts.get(c.id) || 0}</td>
                      <td className="users-td">{workerCounts.get(c.id) || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UserTable
        title="Contractors"
        users={contractors}
        loading={loading}
        error={error}
        enableCompanyFilter={true}
        allCompanies={companies}
        onRefresh={refetch}
      />

      <UserTable title="Supervisors" users={supervisors} loading={loading} error={error} onRefresh={refetch} />
      <UserTable title="Area Owners" users={areaOwners} loading={loading} error={error} onRefresh={refetch} />
      <UserTable title="Site Managers" users={siteManagers} loading={loading} error={error} onRefresh={refetch} />
      <UserTable title="Safety Officers" users={safetyOfficers} loading={loading} error={error} onRefresh={refetch} />

      {/* Workers table */}
      <WorkerTable
        workers={allWorkers}
        loading={workersLoading}
        error={workersError}
        allCompanies={companies}
        onRefresh={() => setWorkersRefresh(k => k + 1)}
        onAddWorker={openAddWorker}
        onEditWorker={openEditWorker}
        onDeleteWorker={handleDeleteWorker}
      />

      <WorkerModal
        open={workerModalOpen}
        onClose={closeWorkerModal}
        initial={editingWorker}
        companyId={selectedCompanyForModal}
        onSaved={handleWorkerSaved}
      />
    </div>
  );
};

export default Users;