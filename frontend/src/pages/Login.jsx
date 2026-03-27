import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDemoUsers, loginWithEmail, loginWithGithub, signupWithEmail } from '../services/authService';
import Icon from '../components/Icon';

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'learner'
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('success');
  const [demoUsers, setDemoUsers] = useState([]);

  useEffect(() => {
    getDemoUsers()
      .then((res) => setDemoUsers(res.data.data || []))
      .catch(() => {});
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const getAuthErrorMessage = (err) => {
    if (err.response?.status === 404) {
      return 'Login and signup routes are not available on the running backend yet. Restart the backend server and try again.';
    }

    if (!err.response) {
      return 'Cannot reach the backend. Make sure the backend is running on http://localhost:5000 and try again.';
    }

    return err.response?.data?.message || 'Authentication failed';
  };

  const handleLocalSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (mode === 'login') {
        const res = await loginWithEmail({
          email: form.email,
          password: form.password
        });
        await login(res.data.data.token);
        navigate('/dashboard', { replace: true });
        return;
      }

      const res = await signupWithEmail(form);
      const payload = res.data.data;

      if (payload?.requiresApproval) {
        setMessageTone('success');
        setMessage('Instructor signup request sent to admin. You can log in after approval.');
        setMode('login');
        setForm(INITIAL_FORM);
        return;
      }

      if (payload?.token) {
        await login(payload.token);
        navigate('/dashboard', { replace: true });
        return;
      }

      setMessageTone('success');
      setMessage('Account created successfully. Please log in.');
      setMode('login');
      setForm(INITIAL_FORM);
    } catch (err) {
      setMessageTone('error');
      setMessage(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-effects">
        <div className="login-orb login-orb-1"></div>
        <div className="login-orb login-orb-2"></div>
        <div className="login-orb login-orb-3"></div>
      </div>
      <div className="login-card login-card-wide">
        <div className="login-card-inner">
          <span className="login-kicker">Professional learning workspace</span>
          <div className="login-logo sigverse-logo">
            <Icon name="brand" size={38} className="logo-icon-svg" />
          </div>
          <h1 className="login-title">Sigverse</h1>
          <p className="login-subtitle">OAuth plus local sign in for learners, instructors, and admins.</p>

          <div className="login-mode-switch">
            <button
              type="button"
              className={`login-mode-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={`login-mode-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
          </div>

          {message && (
            <div className={`toast ${messageTone === 'error' ? 'toast-error' : 'toast-success'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleLocalSubmit} className="login-form">
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                required
              />
            </div>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Register As</label>
                <select
                  className="form-input"
                  value={form.role}
                  onChange={(event) => updateField('role', event.target.value)}
                >
                  <option value="learner">Learner</option>
                  <option value="instructor">Instructor Request</option>
                </select>
              </div>
            )}
            <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Login with Email' : 'Create Account'}
            </button>
          </form>

          <div className="login-divider"></div>

          <button className="btn-github" onClick={loginWithGithub}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>

          {/* <div className="login-trust-grid">
            <div className="login-trust-card">
              <strong>Structured catalog</strong>
              <span>Browse category-based programs with approvals, embedded resources, quizzes, and certificates.</span>
            </div>
            <div className="login-trust-card">
              <strong>Approval-aware access</strong>
              <span>Instructor registrations and content changes now move through admin approval before going live.</span>
            </div>
          </div> */}

          {demoUsers.length > 0 && (
            <div className="demo-login-grid">
              {demoUsers.map((demo) => (
                <div key={demo.role} className="demo-login-card">
                  <strong>{demo.role}</strong>
                  <span>{demo.email}</span>
                  <code>{demo.password}</code>
                </div>
              ))}
            </div>
          )}
          <p className="login-footer-text">Use GitHub OAuth or the demo local accounts above for role testing.</p>
        </div>
      </div>
    </div>
  );
}
