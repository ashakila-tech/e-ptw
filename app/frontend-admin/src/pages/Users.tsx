import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useUsers } from '../hooks/useUsers';
import { fetchWorkers, deleteWorker, deleteUser, fetchCompanies, deleteCompany, fetchAllGroups, deleteGroup, fetchDepartments, deleteDepartment, fetchAllDepartmentHeads } from '../../../shared/services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import WorkerModal from '../components/modals/WorkerModal';
import UserModal from '../components/modals/UserModal';
import CompanyModal from '../components/modals/CompanyModal';
import GroupModal from '../components/modals/GroupModal';
import DepartmentModal from '../components/modals/DepartmentModal';
import UserTable from '../components/tables/UserTable';
import UserAssignmentModal from '../components/modals/UserAssignmentModal';
import WorkerTable from '../components/tables/WorkerTable';
import CompanyTable from '../components/tables/CompanyTable';
import GroupTable from '../components/tables/GroupTable';
import DepartmentTable from '../components/tables/DepartmentTable';
import ManagerAssignmentModal from '../components/modals/ManagerAssignmentModal';

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

  // Departments state
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

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

  // Department Modal state
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any | null>(null);

  // Group Modal state
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);

  // Assignment Modal state
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assigningUser, setAssigningUser] = useState<any | null>(null);

  // Manager Assignment Modal state (for departments)
  const [managerAssignmentModalOpen, setManagerAssignmentModalOpen] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'location' | 'permit_type' | 'department'>('department');
  const [assignmentItem, setAssignmentItem] = useState<{ id: number; name: string } | null>(null);

  // Department Head Counts
  const [departmentHeadCounts, setDepartmentHeadCounts] = useState(new Map<number, number>());

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

  const loadDepartments = useCallback(async () => {
    setDepartmentsLoading(true);
    try {
      const data = await fetchDepartments();
      setDepartments(data);
    } catch (e) {
      console.error("Failed to load departments", e);
    } finally {
      setDepartmentsLoading(false);
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

  // Department handlers
  const openAddDepartment = () => { setEditingDepartment(null); setDepartmentModalOpen(true); };
  const openEditDepartment = (d: any) => { setEditingDepartment(d); setDepartmentModalOpen(true); };
  const closeDepartmentModal = () => { setEditingDepartment(null); setDepartmentModalOpen(false); };
  const handleDepartmentSaved = () => { loadDepartments(); };

  const handleDeleteDepartment = async (id: number) => {
    if (!confirm('Delete this department? This may fail if it is in use.')) return;
    try {
      await deleteDepartment(id);
      loadDepartments();
    } catch (e: any) { alert(e?.message || String(e)); }
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

  const handleAssignDepartment = (item: any) => {
    setAssignmentType('department');
    setAssignmentItem(item);
    setManagerAssignmentModalOpen(true);
  };

  // Assignment handlers
  const openAssignmentModal = (u: any) => { setAssigningUser(u); setAssignmentModalOpen(true); };
  const closeAssignmentModal = () => { setAssigningUser(null); setAssignmentModalOpen(false); };
  // onSaved can just refetch all users, which might update their displayed roles if we add that later.
  const handleAssignmentsSaved = () => { refetch(); };

  const contractors = useMemo(() => users.filter(u => u.groups.some(g => g.toLowerCase() === 'contractor')), [users]);
  const supervisors = useMemo(() => users.filter(u => u.groups.some(g => g.toLowerCase() === 'supervisor')), [users]);
  const areaOwners = useMemo(() => users.filter(u => u.groups.some(g => g.toLowerCase() === 'area owner')), [users]);
  const departmentHeads = useMemo(() => users.filter(u => u.groups.some(g => g.toLowerCase() === 'head of department')), [users]);
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
    const loadAllData = async () => {
        await Promise.all([
            loadAllWorkers(),
            loadCompanies(),
            loadGroups(),
            loadDepartments(),
        ]);

        try {
            const allHeads = await fetchAllDepartmentHeads();
            const counts = new Map<number, number>();
            allHeads.forEach((head: any) => {
                counts.set(head.department_id, (counts.get(head.department_id) || 0) + 1);
            });
            setDepartmentHeadCounts(counts);
        } catch (e) {
            console.error("Failed to load department head counts", e);
        }
    };
    loadAllData();
  }, [workersRefresh, loadAllWorkers, loadCompanies, loadGroups, loadDepartments]);

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

      <DepartmentTable
        departments={departments}
        loading={departmentsLoading}
        companies={companies}
        departmentHeadCounts={departmentHeadCounts}
        onAdd={openAddDepartment}
        onRefresh={loadDepartments}
        onEdit={openEditDepartment}
        onDelete={handleDeleteDepartment}
        onAssign={handleAssignDepartment}
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
        <div className="users-toolbar" style={{ marginBottom: 10 }}>
          <button className="manage-btn" onClick={openAddUser}>
            <FontAwesomeIcon icon={faPlus} className="icon-prefix" />
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
          title="Head of Departments" 
          users={departmentHeads} 
          loading={loading} 
          error={error} 
          onRefresh={refetch}
          onEdit={openEditUser}
          onDelete={handleDeleteUser}
          onAssign={openAssignmentModal}
        />
        
        <UserTable 
          title="Site Managers" 
          users={siteManagers} 
          loading={loading} 
          error={error} 
          onRefresh={refetch}
          onEdit={openEditUser}
          onDelete={handleDeleteUser}
          onAssign={openAssignmentModal}
        />
        
        <UserTable 
          title="Safety Officers" 
          users={safetyOfficers} 
          loading={loading} 
          error={error} 
          onRefresh={refetch}
          onEdit={openEditUser}
          onDelete={handleDeleteUser}
          onAssign={openAssignmentModal}
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

      <DepartmentModal
        open={departmentModalOpen}
        onClose={closeDepartmentModal}
        initial={editingDepartment}
        companies={companies}
        onSaved={handleDepartmentSaved}
      />

      <GroupModal
        open={groupModalOpen}
        onClose={closeGroupModal}
        initial={editingGroup}
        companies={companies}
        onSaved={handleGroupSaved}
      />

      <UserAssignmentModal
        open={assignmentModalOpen}
        onClose={closeAssignmentModal}
        user={assigningUser}
        onSaved={handleAssignmentsSaved}
      />

      <ManagerAssignmentModal
        open={managerAssignmentModalOpen}
        onClose={() => setManagerAssignmentModalOpen(false)}
        type={assignmentType}
        item={assignmentItem}
        allUsers={users}
      />
    </div>
  );
};

export default Users;