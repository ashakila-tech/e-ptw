import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faEnvelope, faEnvelopeOpen, faEye } from '@fortawesome/free-solid-svg-icons';
import TablePagination from './TablePagination';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Props {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onView: (notification: Notification) => void;
  onMarkAsRead: (id: number) => void;
}

const NotificationTable: React.FC<Props> = ({
  notifications,
  loading,
  error,
  onRefresh,
  onView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<'id' | 'title' | 'created_at' | 'is_read'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleSort = (key: typeof sortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const displayedNotifications = useMemo(() => {
    let list = [...notifications];

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(n =>
        (n.title || '').toLowerCase().includes(q)
      );
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      switch (sortKey) {
        case 'id': return (a.id - b.id) * dir;
        case 'title': return (a.title || '').localeCompare(b.title || '') * dir;
        case 'is_read': return (Number(a.is_read) - Number(b.is_read)) * dir;
        case 'created_at': return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
        default: return 0;
      }
    });

    return list;
  }, [notifications, searchQuery, sortKey, sortDir]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(displayedNotifications.length / itemsPerPage);
  const paginatedNotifications = displayedNotifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="table-header">
        <h3 className="table-header-title">All Notifications</h3>
        <div className="users-toolbar">
          <input
            placeholder="Search notifications..."
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
                <th onClick={() => handleSort('title')}>Title {sortKey === 'title' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('is_read')}>Status {sortKey === 'is_read' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('created_at')}>Created At {sortKey === 'created_at' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="table-message-cell">Loading notifications...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="table-error-cell">Error: {error}</td></tr>
              ) : paginatedNotifications.length === 0 ? (
                <tr><td colSpan={5} className="table-message-cell">No notifications found.</td></tr>
              ) : (
                paginatedNotifications.map((n) => (
                  <tr key={n.id} className={!n.is_read ? 'font-bold' : ''}>
                    <td className="users-td">{n.id}</td>
                    <td className="users-td">{n.title}</td>
                    <td className="users-td">
                      {n.is_read ? (
                        <span style={{ color: '#6b7280' }}><FontAwesomeIcon icon={faEnvelopeOpen} /> Read</span>
                      ) : (
                        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}><FontAwesomeIcon icon={faEnvelope} /> Unread</span>
                      )}
                    </td>
                    <td className="users-td">{formatDateTime(n.created_at)}</td>
                    <td className="users-td">
                      <button className="icon-btn edit" onClick={() => onView(n)} title="View Details">
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

export default NotificationTable;