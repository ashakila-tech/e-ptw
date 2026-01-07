import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useUsers } from '../hooks/useUsers';
import { fetchWorkers, deleteWorker, deleteUser, fetchCompanies, deleteCompany, fetchAllGroups, deleteGroup } from '../../../shared/services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import WorkerModal from '../components/modals/WorkerModal';
import UserModal from '../components/modals/UserModal';
import CompanyModal from '../components/modals/CompanyModal';
import GroupModal from '../components/modals/GroupModal';
import UserTable from '../components/tables/UserTable';
import WorkerTable from '../components/tables/WorkerTable';
import CompanyTable from '../components/tables/CompanyTable';
import GroupTable from '../components/tables/GroupTable';

const Users: React.FC = () => {
  const { users, loading, error, refetch } = useUsers();

  // Workers state & refresh
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  const [workersLoading, setWorkersLoading] = useState<boolean>(false);
  const [workersError, setWorkersError] = useState<string | null>(null);
  const [workersRefresh, setWorkersRefresh] = useState(0);

  // Companies state
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  // Groups state
  const [groups, setGroups] = useState<any[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // Modal & editing state
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any | null>(null);
  const [selectedCompanyForModal, setSelectedCompanyForModal] = useState<number | null>(null);

  // User Modal state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Company Modal state
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<{ id: number; name: string } | null>(null);

  // Group Modal state
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);

  const loadCompanies = useCallback(async () => {
    setCompaniesLoading(true);
    try {
      const data = await fetchCompanies();
      setCompanies(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
    } catch (e) {
      console.error("Failed to load companies", e);
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

  const loadGroups = useCallback(async () => {
    setGroupsLoading(true);
    try {
      const data = await fetchAllGroups();
      setGroups(data);
    } catch (e) {
      console.error("Failed to load groups", e);
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  // Worker handlers
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

  // User handlers
  const openAddUser = () => { setEditingUser(null); setUserModalOpen(true); };
  const openEditUser = (u: any) => { setEditingUser(u); setUserModalOpen(true); };
  const closeUserModal = () => { setEditingUser(null); setUserModalOpen(false); };
  const handleUserSaved = () => { refetch(); };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    try {
      await deleteUser(id);
      refetch();
    } catch (e: any) {
      alert(e?.message || String(e) || 'Failed to delete user');
    }
  };

  // Company handlers
  const openAddCompany = () => { setEditingCompany(null); setCompanyModalOpen(true); };
  const openEditCompany = (c: any) => { setEditingCompany(c); setCompanyModalOpen(true); };
  const closeCompanyModal = () => { setEditingCompany(null); setCompanyModalOpen(false); };
  
  const handleCompanySaved = () => { loadCompanies(); };

  const handleDeleteCompany = async (id: number) => {
    if (!confirm('Delete this company? This will fail if the company has associated users or workers.')) return;
    try {
      await deleteCompany(id);
      loadCompanies();
    } catch (e: any) {
      alert(e?.message || String(e) || 'Failed to delete company');
    }
  };

  // Group handlers
  const openAddGroup = () => { setEditingGroup(null); setGroupModalOpen(true); };
  const openEditGroup = (g: any) => { setEditingGroup(g); setGroupModalOpen(true); };
  const closeGroupModal = () => { setEditingGroup(null); setGroupModalOpen(false); };
  const handleGroupSaved = () => { loadGroups(); };
  const handleDeleteGroup = async (id: number) => {
    if (!confirm('Delete this group?')) return;
    try { await deleteGroup(id); loadGroups(); }
    catch (e: any) { alert(e?.message || String(e)); }
  };

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
    loadCompanies();
    loadGroups();
  }, [workersRefresh, loadAllWorkers, loadCompanies, loadGroups]);

  return (
    <div className="content-area">
      <h1 className="page-title">Users Management</h1>

      <CompanyTable
        companies={companies}
        loading={companiesLoading}
        contractorCounts={contractorCounts}
        workerCounts={workerCounts}
        onAdd={openAddCompany}
        onRefresh={() => { loadCompanies(); refetch(); setWorkersRefresh(k => k + 1); }}
        onEdit={openEditCompany}
        onDelete={handleDeleteCompany}
      />

      <GroupTable
        groups={groups}
        loading={groupsLoading}
        companies={companies}
        onAdd={openAddGroup}
        onRefresh={loadGroups}
        onEdit={openEditGroup}
        onDelete={handleDeleteGroup}
      />

      <div className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
          <button className="manage-btn" onClick={openAddUser}>
            <FontAwesomeIcon icon={faPlus} style={{paddingRight:"1em"}} />
            Add User
          </button>
        </div>
        
        <UserTable
          title="Contractors"
          users={contractors}
          loading={loading}
          error={error}
          enableCompanyFilter={true}
          allCompanies={companies}
          onRefresh={refetch}
          onEdit={openEditUser}
          onDelete={handleDeleteUser}
        />

        <UserTable 
          title="Supervisors" 
          users={supervisors} 
          loading={loading} 
          error={error} 
          onRefresh={refetch}
          onEdit={openEditUser}
          onDelete={handleDeleteUser}
        />

        <UserTable 
          title="Area Owners" 
          users={areaOwners} 
          loading={loading} 
          error={error} 
          onRefresh={refetch}
          onEdit={openEditUser}
          onDelete={handleDeleteUser}
        />
        
        <UserTable 
          title="Site Managers" 
          users={siteManagers} 
          loading={loading} 
          error={error} 
          onRefresh={refetch}
          onEdit={openEditUser}
          onDelete={handleDeleteUser}
        />
        
        <UserTable 
          title="Safety Officers" 
          users={safetyOfficers} 
          loading={loading} 
          error={error} 
          onRefresh={refetch}
          onEdit={openEditUser}
          onDelete={handleDeleteUser}
        />
      </div>

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

      <UserModal
        open={userModalOpen}
        onClose={closeUserModal}
        initial={editingUser}
        onSaved={handleUserSaved}
      />

      <CompanyModal
        open={companyModalOpen}
        onClose={closeCompanyModal}
        initial={editingCompany}
        onSaved={handleCompanySaved}
      />

      <GroupModal
        open={groupModalOpen}
        onClose={closeGroupModal}
        initial={editingGroup}
        companies={companies}
        onSaved={handleGroupSaved}
      />
    </div>
  );
};

export default Users;