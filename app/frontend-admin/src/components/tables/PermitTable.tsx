import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { /* faPencilAlt ,*/ faTrash, faSync, faEye } from '@fortawesome/free-solid-svg-icons';
import { downloadDocumentById } from '../../../../shared/services/api';
import { ApprovalsModal, WorkersModal, SafetyEquipmentModal } from '../modals/PermitModals';
import TablePagination from './TablePagination';

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
  // onEdit,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPermitTypeId, setSelectedPermitTypeId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

    if (selectedPermitTypeId) {
      list = list.filter(p => p.permit_type_id === selectedPermitTypeId);
    }

    if (selectedLocationId) {
      list = list.filter(p => p.location_id === selectedLocationId);
    }

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(new Date(endDate).setHours(23, 59, 59, 999)).getTime();
      list = list.filter(p => {
        if (!p.workflow_data?.start_time || !p.workflow_data?.end_time) return false;
        const permitStart = new Date(p.workflow_data.start_time).getTime();
        const permitEnd = new Date(p.workflow_data.end_time).getTime();
        return permitStart <= end && permitEnd >= start;
      });
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
  }, [permits, searchQuery, sortKey, sortDir, permitTypeMap, locationMap, applicantMap, applicantDataMap, selectedStatus, selectedCompanyId, selectedPermitTypeId, selectedLocationId, startDate, endDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedCompanyId, selectedPermitTypeId, selectedLocationId, startDate, endDate]);

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

  const formatWorkPeriod = (startTimeStr?: string, endTimeStr?: string) => {
    if (!startTimeStr || !endTimeStr) return '-';
    try {
      const startDate = new Date(startTimeStr);
      const endDate = new Date(endTimeStr);
      const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };

      return (
        <>
          <div>{startDate.toLocaleDateString(undefined, dateOptions)}</div>
          <div>
            {`${startDate.toLocaleTimeString([], timeOptions)} to ${endDate.toLocaleTimeString([], timeOptions)}`}
          </div>
        </>
      );
    } catch (e) {
      return '-';
    }
  };

  const formatSingleDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };

      return (
        <>
          <div>{date.toLocaleDateString(undefined, dateOptions)}</div>
          <div>{date.toLocaleTimeString([], timeOptions)}</div>
        </>
      );
    } catch (e) {
      return '-';
    }
  };

  const totalPages = Math.ceil(displayedPermits.length / itemsPerPage);
  const paginatedPermits = displayedPermits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="dashboard-container">
      <div className="table-header">
        <h3 className="table-header-title">Permits</h3>
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

          <select
            className="table-search-bar"
            style={{ width: 'auto', minWidth: 120 }}
            value={selectedPermitTypeId === null ? '' : selectedPermitTypeId}
            onChange={(e) => setSelectedPermitTypeId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All Types</option>
            {permitTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
          </select>

          <select
            className="table-search-bar"
            style={{ width: 'auto', minWidth: 120 }}
            value={selectedLocationId === null ? '' : selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All Locations</option>
            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
          </select>

          <div className="date-range-picker">
            <label>Period:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-range-input"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-range-input"
              min={startDate}
            />
          </div>

          <input
            placeholder="Search permits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="table-search-bar"
          />
          <button className="icon-btn refresh" onClick={onRefresh} disabled={loading} title="Refresh">
            <FontAwesomeIcon icon={faSync} spin={loading} />
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div className="table-header" style={{ marginBottom: 8 }}>
          <strong className="table-header-title">Filter by Company (Applicant)</strong>
          <input
            placeholder="Search companies..."
            value={companySearchQuery}
            onChange={(e) => setCompanySearchQuery(e.target.value)}
            className="table-search-bar"
            style={{ width: 200 }}
          />
        </div>
        <div className="companies-list">
          <div className="permit-status-item">
            <span>All Companies</span>
            <button className="manage-btn view" onClick={() => setSelectedCompanyId(null)}>Select</button>
          </div>
          {filteredCompanies.map(c => (
            <div key={c.id} className="permit-status-item">
              <span>{c.name}</span>
              <button className="manage-btn view" onClick={() => setSelectedCompanyId(c.id)}>Select</button>
            </div>
          ))}
          {filteredCompanies.length === 0 && <div className="permit-status-item" style={{ justifyContent: 'center' }}>No companies found.</div>}
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
                <tr><td colSpan={11} className="table-message-cell">Loading permits...</td></tr>
              ) : error ? (
                <tr><td colSpan={11} className="table-error-cell">Error: {error}</td></tr>
              ) : paginatedPermits.length === 0 ? (
                <tr><td colSpan={11} className="table-message-cell">No permits found.</td></tr>
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
                    <td className="users-td" style={{ fontSize: '0.85em' }}>{formatSingleDate(p.created_time)}</td>
                    <td className="users-td" style={{ fontSize: '0.85em' }}>
                      {p.workflow_data?.start_time ? (
                        formatWorkPeriod(p.workflow_data.start_time, p.workflow_data.end_time)
                      ) : '-'}
                    </td>
                    <td className="users-td">
                      {p.document ? (
                        <div className="actions-cell" style={{ alignItems: 'center' }}>
                          <span style={{ fontSize: '0.9em' }}>{p.document.name}</span>
                          <button className="icon-btn edit" onClick={() => handleViewDocument(p)} title="View Document">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="users-td">
                      <div className="actions-cell-vertical">
                        <button 
                          className="manage-btn" 
                          onClick={() => setViewApprovalsPermit(p)}
                          disabled={!p.workflow_data?.id}
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
                      <div className="actions-cell">
                        {/* Comment out edit for now */}
                        {/* <button className="icon-btn edit" onClick={() => onEdit(p)} title="Edit">
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </button> */}
                        <button className="icon-btn delete" onClick={() => onDelete(p.id)} title="Delete">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Modals for some column data */}

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