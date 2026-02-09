import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { downloadDocumentById } from '../../../../shared/services/api';
import type { Report } from '../tables/ReportTable';

interface Props {
  open: boolean;
  onClose: () => void;
  report: Report | null;
}

const ReportModal: React.FC<Props> = ({ open, onClose, report }) => {
  if (!open || !report) return null;

  const handleDownload = async () => {
    if (!report.document?.id) return;
    try {
      const blob = await downloadDocumentById(report.document.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.document.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Download failed", e);
      alert("Failed to download document");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-header">Report Details</h3>
        
        <div className="modal-grid" style={{ gridTemplateColumns: '1fr 1fr', maxHeight: '60vh', overflowY: 'auto', paddingRight: '5px' }}>
          <div>
            <label className="form-label">Report Name</label>
            <div className="form-input" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>{report.name}</div>
          </div>
          <div>
            <label className="form-label">Reported By</label>
            <div className="form-input" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>{report.user?.name || 'Unknown'}</div>
          </div>
          <div>
            <label className="form-label">Location</label>
            <div className="form-input" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>{report.location?.name || 'Unknown'}</div>
          </div>
          <div>
            <label className="form-label">Department</label>
            <div className="form-input" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>{report.department?.name || '-'}</div>
          </div>
          <div>
            <label className="form-label">Incident Time</label>
            <div className="form-input" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              {report.incident_timestamp ? new Date(report.incident_timestamp).toLocaleString() : '-'}
            </div>
          </div>
          <div>
            <label className="form-label">Submission Time</label>
            <div className="form-input" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              {report.submission_timestamp ? new Date(report.submission_timestamp).toLocaleString() : '-'}
            </div>
          </div>
          <div>
            <label className="form-label">Condition</label>
            <div className="form-input" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>{report.condition || '-'}</div>
          </div>
          <div>
            <label className="form-label">Concern</label>
            <div className="form-input" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>{report.concern || '-'}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <div className="form-input" style={{ minHeight: '80px', whiteSpace: 'pre-wrap', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              {report.description || '-'}
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Immediate Action Taken</label>
            <div className="form-input" style={{ minHeight: '60px', whiteSpace: 'pre-wrap', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              {report.immediate_action || '-'}
            </div>
          </div>
          
          {report.document && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Attachment</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="form-input" style={{ flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb' }}>{report.document.name}</span>
                <button className="manage-btn" onClick={handleDownload}>
                  <FontAwesomeIcon icon={faFileDownload} style={{ marginRight: 5 }} />
                  Download
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="manage-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;