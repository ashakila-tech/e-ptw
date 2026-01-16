import React from 'react';
import type { Feedback } from '../../hooks/useFeedbacks';

interface Props {
  open: boolean;
  onClose: () => void;
  feedback: Feedback | null;
}

const FeedbackModal: React.FC<Props> = ({ open, onClose, feedback }) => {
  if (!open || !feedback) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-header">Feedback Details</h3>
        
        <div className="modal-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <label className="form-label">User</label>
            <div className="form-input" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              {feedback.user_name} <span style={{ color: '#6b7280', fontSize: '0.9em' }}>(ID: {feedback.user_id})</span>
            </div>
          </div>
          <div>
            <label className="form-label">Title</label>
            <div className="form-input" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              {feedback.title}
            </div>
          </div>
          <div>
            <label className="form-label">Date</label>
            <div className="form-input" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              {new Date(feedback.created_at).toLocaleString()}
            </div>
          </div>
          <div>
            <label className="form-label">Message</label>
            <textarea className="form-input" readOnly value={feedback.message} style={{ minHeight: '120px', background: '#f9fafb' }} />
          </div>
        </div>

        <div className="modal-actions">
          <button className="manage-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;