import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faEye } from '@fortawesome/free-solid-svg-icons';
import TablePagination from './TablePagination';
import { CONDITION_ITEMS } from '../../../../shared/constants/Conditions';
import { CONCERN_ITEMS } from '../../../../shared/constants/Concerns';

export interface Report {
  id: number;
  name: string;
  condition?: string;
  concern?: string;
  description?: string;
  immediate_action?: string;
  incident_timestamp?: string;
  submission_timestamp?: string;
  user?: { id: number; name: string };
  location?: { id: number; name: string };
  department?: { id: number; name: string };
  document?: { id: number; name: string; path: string };
}

interface Props {
  reports: Report[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onView: (report: Report) => void;
}

const ReportTable: React.FC<Props> = ({
  reports,
  loading,
  error,
  onRefresh,
  onView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedConcern, setSelectedConcern] = useState('');
  const [sortKey, setSortKey] = useState<'id' | 'name' | 'condition' | 'concern' | 'date'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleSort = (key: typeof sortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const displayedReports = useMemo(() => {
    let list = [...reports];

    if (selectedCondition) {
      list = list.filter(r => r.condition === selectedCondition);
    }

    if (selectedConcern) {
      list = list.filter(r => r.concern === selectedConcern);
    }

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(new Date(endDate).setHours(23, 59, 59, 999)).getTime();
      list = list.filter(r => {
        const created = new Date(r.submission_timestamp || 0).getTime();
        return created >= start && created <= end;
      });
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(r =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.condition || '').toLowerCase().includes(q) ||
        (r.concern || '').toLowerCase().includes(q) ||
        (r.user?.name || '').toLowerCase().includes(q)
      );
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      switch (sortKey) {
        case 'id': return (a.id - b.id) * dir;
        case 'name': return (a.name || '').localeCompare(b.name || '') * dir;
        case 'condition': return (a.condition || '').localeCompare(b.condition || '') * dir;
        case 'concern': return (a.concern || '').localeCompare(b.concern || '') * dir;
        case 'date': return (new Date(a.submission_timestamp || 0).getTime() - new Date(b.submission_timestamp || 0).getTime()) * dir;
        default: return 0;
      }
    });

    return list;
  }, [reports, searchQuery, sortKey, sortDir, startDate, endDate, selectedCondition, selectedConcern]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate, selectedCondition, selectedConcern]);

  const totalPages = Math.ceil(displayedReports.length / itemsPerPage);
  const paginatedReports = displayedReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="dashboard-container">
      <div className="table-header">
        <h3 className="table-header-title">All Reports</h3>
        <div className="users-toolbar">
          <select
            className="table-search-bar"
            style={{ width: 'auto', minWidth: 120 }}
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
          >
            <option value="">All Conditions</option>
            {CONDITION_ITEMS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          <select
            className="table-search-bar"
            style={{ width: 'auto', minWidth: 120 }}
            value={selectedConcern}
            onChange={(e) => setSelectedConcern(e.target.value)}
          >
            <option value="">All Concerns</option>
            {CONCERN_ITEMS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          <div className="date-range-picker">
            <label>Period:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-range-input" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-range-input" min={startDate} />
          </div>
          <input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="table-search-bar"
          />
          <button className="icon-btn refresh" onClick={onRefresh} disabled={loading} title="Refresh">
            <FontAwesomeIcon icon={faSync} spin={loading} />
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
                <th onClick={() => handleSort('date')}>Date {sortKey === 'date' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('condition')}>Condition {sortKey === 'condition' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('concern')}>Concern {sortKey === 'concern' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="table-message-cell">Loading reports...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="table-error-cell">Error: {error}</td></tr>
              ) : paginatedReports.length === 0 ? (
                <tr><td colSpan={6} className="table-message-cell">No reports found.</td></tr>
              ) : (
                paginatedReports.map((r) => (
                  <tr key={r.id}>
                    <td className="users-td">{r.id}</td>
                    <td className="users-td">{r.name}</td>
                    <td className="users-td">{r.submission_timestamp ? new Date(r.submission_timestamp).toLocaleDateString() : '-'}</td>
                    <td className="users-td" style={{ textTransform: 'capitalize' }}>{r.condition || '-'}</td>
                    <td className="users-td" style={{ textTransform: 'capitalize' }}>{r.concern || '-'}</td>
                    <td className="users-td">
                      <button className="icon-btn edit" onClick={() => onView(r)} title="View Details">
                        <FontAwesomeIcon icon={faEye} />
                      </button>
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
    </div>
  );
};

export default ReportTable;