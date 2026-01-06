import React, { useEffect, useState } from 'react';
import { fetchApprovalDataByWorkflow } from '../../../../shared/services/api';

interface ModalProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const BaseModal: React.FC<ModalProps> = ({ onClose, title, children }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 className="modal-header" style={{ margin: 0 }}>{title}</h3>
          <button className="manage-btn" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
};

interface ApprovalsModalProps {
  workflowDataId: number;
  onClose: () => void;
}

export const ApprovalsModal: React.FC<ApprovalsModalProps> = ({ workflowDataId, onClose }) => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchApprovalDataByWorkflow(workflowDataId);
        setApprovals(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workflowDataId]);

  return (
    <BaseModal title="Approvals Status" onClose={onClose}>
      {loading ? (
        <p>Loading approvals...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : approvals.length === 0 ? (
        <p>No approval data found.</p>
      ) : (
        <div className="card-scroll">
          <table className="users-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Approver</th>
                <th>Status</th>
                <th>Time</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((a) => (
                <tr key={a.id}>
                  <td>{a.role_name || '-'}</td>
                  <td>{a.approver_name || '-'}</td>
                  <td>
                    <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: 4, 
                      fontSize: '0.85em', 
                      backgroundColor: a.status === 'APPROVED' ? '#d1fae5' : a.status === 'REJECTED' ? '#fee2e2' : '#f3f4f6',
                      color: a.status === 'APPROVED' ? '#065f46' : a.status === 'REJECTED' ? '#991b1b' : '#374151'
                    }}>
                      {a.status}
                    </span>
                  </td>
                  <td>{a.time ? new Date(a.time).toLocaleString() : '-'}</td>
                  <td>{a.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BaseModal>
  );
};

interface WorkersModalProps {
  workers: any[];
  onClose: () => void;
}

export const WorkersModal: React.FC<WorkersModalProps> = ({ workers, onClose }) => {
  return (
    <BaseModal title="Application Workers" onClose={onClose}>
      {workers.length === 0 ? (
        <p>No workers assigned.</p>
      ) : (
        <div className="card-scroll">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>IC/Passport</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.id}>
                  <td>{w.name}</td>
                  <td>{w.ic_passport}</td>
                  <td>{w.position || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BaseModal>
  );
};

interface SafetyEquipmentModalProps {
  equipment: any[];
  onClose: () => void;
}

export const SafetyEquipmentModal: React.FC<SafetyEquipmentModalProps> = ({ equipment, onClose }) => {
  return (
    <BaseModal title="Safety Equipment" onClose={onClose}>
      {equipment.length === 0 ? (
        <p>No safety equipment listed.</p>
      ) : (
        <ul className="location-list">
          {equipment.map((e) => (
            <li key={e.id} className="location-item">
              <span className="location-name">{e.name}</span>
            </li>
          ))}
        </ul>
      )}
    </BaseModal>
  );
};