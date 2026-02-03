import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationTable from '../components/tables/NotificationTable';

const NotificationsPage: React.FC = () => {
  const { notifications, users, loading, error, refetch } = useNotifications();

  return (
    <div className="content-area">
      <h1 className="page-title">Notifications</h1>
      <NotificationTable
        notifications={notifications}
        users={users}
        loading={loading}
        error={error}
        onRefresh={refetch}
      />
    </div>
  );
};

export default NotificationsPage;