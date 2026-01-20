import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSync } from '@fortawesome/free-solid-svg-icons';
import type { Feedback } from '../../hooks/useFeedbacks';
import TablePagination from './TablePagination';
import { FEEDBACK_TYPES } from '../../../../shared/constants/FeedbackTypes';

interface Props {
  feedbacks: Feedback[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onView: (feedback: Feedback) => void;
}

const FeedbackTable: React.FC<Props> = ({ feedbacks, loading, error, onRefresh, onView }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortKey, setSortKey] = useState<'id' | 'user' | 'title' | 'date'>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  const handleSort = (key: typeof sortKey) => {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const displayedFeedbacks = useMemo(() => {
    let list = [...feedbacks];

    if (selectedType) {
      list = list.filter(f => f.title === selectedType);
    }

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(new Date(endDate).setHours(23, 59, 59, 999)).getTime();
      list = list.filter(f => {
        const created = new Date(f.created_at).getTime();
        return created >= start && created <= end;
      });
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(f =>
        f.title.toLowerCase().includes(q) ||
        f.message.toLowerCase().includes(q) ||
        f.user_name.toLowerCase().includes(q)
      );
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      switch (sortKey) {
        case 'id':
          return (a.id - b.id) * dir;
        case 'user':
          return a.user_name.localeCompare(b.user_name) * dir;
        case 'title':
          return a.title.localeCompare(b.title) * dir;
        case 'date':
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
        default:
          return 0;
      }
    });

    return list;
  }, [feedbacks, searchQuery, startDate, endDate, selectedType, sortKey, sortDir]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate, selectedType]);

  const totalPages = Math.ceil(displayedFeedbacks.length / itemsPerPage);
  const paginatedFeedbacks = displayedFeedbacks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="dashboard-container">
      <div className="table-header">
        <h3 className="table-header-title">Feedbacks List</h3>
        <div className="users-toolbar">
          <select
            className="table-search-bar"
            style={{ width: 'auto', minWidth: 120 }}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Types</option>
            {FEEDBACK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="date-range-picker">
            <label>Period:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-range-input" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-range-input" min={startDate} />
          </div>
          <input
            placeholder="Search feedbacks..."
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
                <th onClick={() => handleSort('user')}>User (ID) {sortKey === 'user' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('title')}>Title {sortKey === 'title' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('date')}>Date {sortKey === 'date' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="table-message-cell">Loading feedbacks...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="table-error-cell">Error: {error}</td></tr>
              ) : paginatedFeedbacks.length === 0 ? (
                <tr><td colSpan={5} className="table-message-cell">No feedbacks found.</td></tr>
              ) : (
                paginatedFeedbacks.map((item) => (
                  <tr key={item.id}>
                    <td className="users-td">{item.id}</td>
                    <td className="users-td">
                      <div style={{ fontWeight: 500 }}>{item.user_name}</div>
                      <div style={{ fontSize: '0.85em', color: '#6b7280' }}>ID: {item.user_id}</div>
                    </td>
                    <td className="users-td">{item.title}</td>
                    <td className="users-td">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="users-td">
                      <button className="icon-btn edit" onClick={() => onView(item)} title="View Message">
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
      <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default FeedbackTable;