import React, { useState, useMemo, useEffect } from 'react';
import { downloadDocumentById } from '../../../../shared/services/api';
import { ApprovalsModal, WorkersModal, SafetyEquipmentModal } from '../modals/PermitModals';

interface Permit {
  id: number;
  name: string;
  status: string;
  created_time: string;
  permit_type_id?: number;
  location_id?: number;
  applicant_id?: number;
  permit_type?: { name: string };
  workflow_data?: { id: number; start_time?: string; end_time?: string };
  document?: { id: number; name: string; path: string };
  workers?: any[];
  safety_equipment?: any[];
  location?: { name: string };
  applicant?: { name: string };
  [key: string]: any;
}

interface Props {
  permits: Permit[];
  loading: boolean;
  error: string | null;
  allCompanies: { id: number; name: string }[];
  permitTypes: { id: number; name: string }[];
  locations: { id: number; name: string }[];
  applicants: { id: number; name: string; company_id?: number }[];
  onRefresh: () => void;
  onEdit: (permit: Permit) => void;
  onDelete: (id: number) => void;
}

const PermitTable: React.FC<Props> = ({
  permits,
  loading,
  error,
  allCompanies,
  permitTypes,
  locations,
  applicants,
  onRefresh,
  onEdit,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [viewApprovalsPermit, setViewApprovalsPermit] = useState<Permit | null>(null);
  const [viewWorkersPermit, setViewWorkersPermit] = useState<Permit | null>(null);
  const [viewSafetyPermit, setViewSafetyPermit] = useState<Permit | null>(null);

  const [sortKey, setSortKey] = useState<'id' | 'name' | 'type' | 'location' | 'applicant' | 'status' | 'created'>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const permitTypeMap = useMemo(() => new Map(permitTypes.map(t => [t.id, t.name])), [permitTypes]);
  const locationMap = useMemo(() => new Map(locations.map(l => [l.id, l.name])), [locations]);
  const applicantMap = useMemo(() => new Map(applicants.map(u => [u.id, u.name])), [applicants]);
  const applicantDataMap = useMemo(() => new Map(applicants.map(u => [u.id, u])), [applicants]);

  const getPermitTypeName = (p: Permit) => p.permit_type?.name || (p.permit_type_id ? permitTypeMap.get(p.permit_type_id) : undefined) || '-';
  const getLocationName = (p: Permit) => p.location?.name || (p.location_id ? locationMap.get(p.location_id) : undefined) || '-';
  const getApplicantName = (p: Permit) => p.applicant?.name || (p.applicant_id ? applicantMap.get(p.applicant_id) : undefined) || '-';

  const handleSort = (key: typeof sortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filteredCompanies = useMemo(() => {
    const q = companySearchQuery.toLowerCase().trim();
    if (!q) return allCompanies;
    return allCompanies.filter(c => c.name.toLowerCase().includes(q));
  }, [allCompanies, companySearchQuery]);

  const displayedPermits = useMemo(() => {
    let list = [...permits];

    if (selectedStatus) {
      list = list.filter(p => (p.status || 'DRAFT') === selectedStatus);
    }

    if (selectedCompanyId !== null) {
      list = list.filter(p => {
        const applicantId = p.applicant_id;
        if (!applicantId) return false;
        const applicant = applicantDataMap.get(applicantId);
        return applicant?.company_id === selectedCompanyId;
      });
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(p => 
        (p.name || '').toLowerCase().includes(q) ||
        (p.status || '').toLowerCase().includes(q) ||
        getPermitTypeName(p).toLowerCase().includes(q) ||
        getLocationName(p).toLowerCase().includes(q) ||
        getApplicantName(p).toLowerCase().includes(q)
      );
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      switch (sortKey) {
        case 'id': return (a.id - b.id) * dir;
        case 'name': return (a.name || '').localeCompare(b.name || '') * dir;
        case 'type': return getPermitTypeName(a).localeCompare(getPermitTypeName(b)) * dir;
        case 'location': return getLocationName(a).localeCompare(getLocationName(b)) * dir;
        case 'applicant': return getApplicantName(a).localeCompare(getApplicantName(b)) * dir;
        case 'status': return (a.status || '').localeCompare(b.status || '') * dir;
        case 'created': return (new Date(a.created_time).getTime() - new Date(b.created_time).getTime()) * dir;
        default: return 0;
      }
    });

    return list;
  }, [permits, searchQuery, sortKey, sortDir, permitTypeMap, locationMap, applicantMap, applicantDataMap, selectedStatus, selectedCompanyId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedCompanyId]);

  const handleViewDocument = async (p: Permit) => {
    if (!p.document?.id) return;
    
    // Open tab immediately to avoid popup blocker
    const newTab = window.open('', '_blank');
    if (newTab) {
      newTab.document.write('Loading document...');
    }

    try {
      const blob = await downloadDocumentById(p.document.id);
      const url = window.URL.createObjectURL(blob);
      
      if (newTab) {
        newTab.location.href = url;
      } else {
        window.open(url, '_blank');
      }
      
      setTimeout(() => window.URL.revokeObjectURL(url), 30000);
    } catch (err) {
      console.error("Failed to download document", err);
      if (newTab) newTab.close();
      alert("Failed to open document.");
    }
  };

  const totalPages = Math.ceil(displayedPermits.length / itemsPerPage);
  const paginatedPermits = displayedPermits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Permits</h3>
        
        <div className="users-toolbar">
          <select 
            className="table-search-bar" 
            style={{ width: 'auto', minWidth: 120 }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>

          <input
            placeholder="Search permits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="table-search-bar"
          />
          <button className="manage-btn" onClick={onRefresh} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <strong style={{ color: 'var(--color-primary)' }}>Filter by Company (Applicant)</strong>
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
                <th onClick={() => handleSort('name')}>Name {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('type')}>Type {sortKey === 'type' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('location')}>Location {sortKey === 'location' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('applicant')}>Applicant {sortKey === 'applicant' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('status')}>Status {sortKey === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('created')}>Created {sortKey === 'created' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th>Work Period</th>
                <th>Doc</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 16 }}>Loading permits...</td></tr>
              ) : error ? (
                <tr><td colSpan={8} style={{ padding: 16, color: 'red' }}>Error: {error}</td></tr>
              ) : paginatedPermits.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 16 }}>No permits found.</td></tr>
              ) : (
                paginatedPermits.map((p) => (
                  <tr key={p.id}>
                    <td className="users-td">{p.id}</td>
                    <td className="users-td">{p.name}</td>
                    <td className="users-td">{getPermitTypeName(p)}</td>
                    <td className="users-td">{getLocationName(p)}</td>
                    <td className="users-td">{getApplicantName(p)}</td>
                    <td className="users-td">
                      <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: '0.85em', backgroundColor: '#e5e7eb' }}>
                        {p.status || 'DRAFT'}
                      </span>
                    </td>
                    <td className="users-td">{p.created_time ? new Date(p.created_time).toLocaleDateString() : '-'}</td>
                    <td className="users-td" style={{ fontSize: '0.85em' }}>
                      {p.workflow_data?.start_time ? (
                        <>
                          <div>{new Date(p.workflow_data.start_time).toLocaleString()}</div>
                          <div style={{ textAlign: 'center' }}>to</div>
                          <div>{new Date(p.workflow_data.end_time!).toLocaleString()}</div>
                        </>
                      ) : '-'}
                    </td>
                    <td className="users-td">
                      {p.document ? (
                        <button className="manage-btn view" onClick={() => handleViewDocument(p)}>View</button>
                      ) : '-'}
                    </td>
                    <td className="users-td">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button 
                          className="manage-btn" 
                          onClick={() => setViewApprovalsPermit(p)}
                          disabled={!p.workflow_data?.id}
                          style={{ opacity: !p.workflow_data?.id ? 0.5 : 1 }}
                        >
                          Approvals
                        </button>
                        <button className="manage-btn" onClick={() => setViewWorkersPermit(p)}>
                          Workers ({p.workers?.length || 0})
                        </button>
                        <button className="manage-btn" onClick={() => setViewSafetyPermit(p)}>
                          Safety ({p.safety_equipment?.length || 0})
                        </button>
                      </div>
                    </td>
                    <td className="users-td">
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="manage-btn edit" onClick={() => onEdit(p)}>Edit</button>
                        <button className="manage-btn delete" onClick={() => onDelete(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 12, alignItems: 'center' }}>
          <button className="manage-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ opacity: currentPage === 1 ? 0.5 : 1 }}>Prev</button>
          <span style={{ fontSize: '0.9rem' }}>Page {currentPage} of {totalPages}</span>
          <button className="manage-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}>Next</button>
        </div>
      )}

      {viewApprovalsPermit && viewApprovalsPermit.workflow_data?.id && (
        <ApprovalsModal 
          workflowDataId={viewApprovalsPermit.workflow_data.id} 
          onClose={() => setViewApprovalsPermit(null)} 
        />
      )}

      {viewWorkersPermit && (
        <WorkersModal 
          workers={viewWorkersPermit.workers || []} 
          onClose={() => setViewWorkersPermit(null)} 
        />
      )}

      {viewSafetyPermit && (
        <SafetyEquipmentModal 
          equipment={viewSafetyPermit.safety_equipment || []} 
          onClose={() => setViewSafetyPermit(null)} 
        />
      )}
    </div>
  );
};

export default PermitTable;