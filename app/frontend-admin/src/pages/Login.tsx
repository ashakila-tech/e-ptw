import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getCurrentUser, logout } from '../../../shared/services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login(email, password); 
      const user = await getCurrentUser();
      // Assuming '9' is the user_type for admins based on backend schema
      if (user.user_type !== 9) {
        await logout(); // Log them out immediately
        throw new Error("Access to this portal is restricted to administrators.");
      }
      navigate('/dashboard');
    } catch (err: any) {
      await logout(); // Ensure any partial login state is cleared
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Admin Portal Login</h2>

        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@email.com"
          />
        </div>
        <div style={{ marginTop: '10px', textAlign: 'left' }}>
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
        </div>

        {error && <div className="form-error-text" style={{ marginTop: '15px' }}>{error}</div>}

        <button onClick={handleLogin} className="login-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default Login;