import React from 'react';
import type { Notification } from '../tables/NotificationTable';

interface Props {
  open: boolean;
  onClose: () => void;
  notification: Notification | null;
}

const NotificationModal: React.FC<Props> = ({ open, onClose, notification }) => {
  if (!open || !notification) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-header">Notification Details</h3>
        
        <div className="modal-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <label className="form-label">Title</label>
            <div className="form-input" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              {notification.title}
            </div>
          </div>
          <div>
            <label className="form-label">Date</label>
            <div className="form-input" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              {new Date(notification.created_at).toLocaleString()}
            </div>
          </div>
          <div>
            <label className="form-label">Message</label>
            <div className="form-input" style={{ minHeight: '120px', background: '#f9fafb', border: '1px solid #e5e7eb', overflowY: 'auto' }} dangerouslySetInnerHTML={{ __html: notification.message }}>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="manage-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;