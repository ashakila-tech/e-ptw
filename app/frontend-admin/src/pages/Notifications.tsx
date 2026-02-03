import React, { useState } from 'react';
import { useNotificationsData } from '../hooks/useNotifications';
import NotificationTable from '../components/tables/NotificationTable';
import NotificationModal from '../components/modals/NotificationModal';
import type { Notification } from '../components/tables/NotificationTable';

const Notifications: React.FC = () => {
  const { loading, error, data, refetch, markAsRead } = useNotificationsData();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const errorBanner = error ? <div className="form-error-text" style={{ marginBottom: 10 }}>{error}</div> : null;
  
  const handleView = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  return (
    <div className="content-area">
      <h1 className="page-title">Notifications</h1>
      {errorBanner}
      <NotificationTable 
        notifications={data}
        loading={loading}
        error={error}
        onRefresh={refetch}
        onView={handleView}
        onMarkAsRead={markAsRead}
      />
      
      <NotificationModal 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notification={selectedNotification}
      />
    </div>
  );
};

export default Notifications;