import React from "react";
import { useSettings } from "../hooks/useSettings";

const Settings: React.FC = () => {
  const { 
    name, email, password, confirmPassword,
    setName, setEmail, setPassword, setConfirmPassword,
    isPasswordMismatch,
    saveDetails, savePassword,
  } = useSettings();

  return (
    <div className="content-area">
      <h1 className="page-title">Settings</h1>
      <div className="dashboard-container">
        <div className="modal-grid">
          <h3 className="modal-full-width" style={{ margin: 0, alignItems: 'flex-start' }}>Change Admin Details</h3>
          <div>
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="modal-full-width modal-actions">
            <button className="manage-btn" onClick={saveDetails}>
              Save Details
            </button>
          </div>

          <h3 className="modal-full-width" style={{ margin: '20px 0 0 0', alignItems: 'flex-start' }}>Change Admin Password</h3>
          <div>
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Confirm New Password</label>
            <input 
              className="form-input" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ borderColor: isPasswordMismatch ? 'var(--color-status-rejected)' : undefined }}
            />
            {isPasswordMismatch && (
              <div className="form-error-text">
                Passwords do not match
              </div>
            )}
          </div>
          <div className="modal-full-width modal-actions">
            <button 
              className="manage-btn" 
              onClick={savePassword} 
              disabled={!password || password !== confirmPassword}
            >
              Save Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;