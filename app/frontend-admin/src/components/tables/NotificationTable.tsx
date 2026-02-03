import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import TablePagination from './TablePagination';

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  [key: string]: any;
}

interface User {
    id: number;
    name: string;
}

interface Props {
  notifications: Notification[];
  users: User[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const NotificationTable: React.FC<Props> = ({
  notifications,
  users,
  loading,
  error,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReadStatus, setSelectedReadStatus] = useState<string>('');

  const [sortKey, setSortKey] = useState<'id' | 'user' | 'title' | 'created_at' | 'is_read'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);
  const getUserName = (n: Notification) => userMap.get(n.user_id) || `User ID: ${n.user_id}`;

  const handleSort = (key: typeof sortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const displayedNotifications = useMemo(() => {
    let list = [...notifications];

    if (selectedReadStatus !== '') {
        const isRead = selectedReadStatus === 'true';
        list = list.filter(n => n.is_read === isRead);
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(n => 
        (n.title || '').toLowerCase().includes(q) ||
        (n.message || '').toLowerCase().includes(q) ||
        getUserName(n).toLowerCase().includes(q)
      );
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      switch (sortKey) {
        case 'id': return (a.id - b.id) * dir;
        case 'user': return getUserName(a).localeCompare(getUserName(b)) * dir;
        case 'title': return (a.title || '').localeCompare(b.title || '') * dir;
        case 'is_read': return (a.is_read === b.is_read ? 0 : a.is_read ? -1 : 1) * dir;
        case 'created_at': return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
        default: return 0;
      }
    });

    return list;
  }, [notifications, searchQuery, sortKey, sortDir, userMap, selectedReadStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedReadStatus]);

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

  const totalPages = Math.ceil(displayedNotifications.length / itemsPerPage);
  const paginatedNotifications = displayedNotifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="dashboard-container">
      <div className="table-header">
        <h3 className="table-header-title">Notifications</h3>
        <div className="users-toolbar">
          <select 
            className="table-search-bar" 
            style={{ width: 'auto', minWidth: 120 }}
            value={selectedReadStatus}
            onChange={(e) => setSelectedReadStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>

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
                <th onClick={() => handleSort('user')}>User {sortKey === 'user' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('title')}>Title {sortKey === 'title' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th>Message</th>
                <th onClick={() => handleSort('is_read')}>Status {sortKey === 'is_read' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('created_at')}>Created {sortKey === 'created_at' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="table-message-cell">Loading notifications...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="table-error-cell">Error: {error}</td></tr>
              ) : paginatedNotifications.length === 0 ? (
                <tr><td colSpan={6} className="table-message-cell">No notifications found.</td></tr>
              ) : (
                paginatedNotifications.map((n) => (
                  <tr key={n.id}>
                    <td className="users-td">{n.id}</td>
                    <td className="users-td">{getUserName(n)}</td>
                    <td className="users-td">{n.title}</td>
                    <td className="users-td">{n.message}</td>
                    <td className="users-td">
                      <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: '0.85em', backgroundColor: n.is_read ? '#d1fae5' : '#fef3c7', color: n.is_read ? '#065f46' : '#92400e' }}>
                        {n.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="users-td" style={{ fontSize: '0.85em' }}>{formatSingleDate(n.created_at)}</td>
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