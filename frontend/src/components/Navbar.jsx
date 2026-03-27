import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { logout as logoutApi } from '../services/authService';
import Icon from './Icon';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['learner', 'instructor', 'admin'] },
    // { path: '/access', label: 'Access', icon: 'shield', roles: ['learner', 'instructor', 'admin'] },
    { path: '/courses', label: 'Courses', icon: 'courses', roles: ['learner', 'instructor', 'admin'] },
    { path: '/my-courses', label: 'My Courses', icon: 'enrollments', roles: ['learner'] },
    { path: '/performance', label: 'Performance', icon: 'performance', roles: ['learner'] },
    { path: '/instructor', label: 'Instructor', icon: 'instructor', roles: ['instructor'] },
    { path: '/admin', label: 'Admin', icon: 'admin', roles: ['admin'] },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <Icon name="brand" size={18} className="brand-icon-svg" />
          <span className="brand-text">Sigverse</span>
        </Link>
        <div className="navbar-links">
          {navLinks.filter(l => l.roles.includes(user.role)).map(link => (
            <Link key={link.path} to={link.path} className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}>
              <Icon name={link.icon} size={15} />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
        <div className="navbar-user">
          <button type="button" className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} />
          </button>
          <Link to="/profile" className="user-avatar-link">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="user-avatar" />
            ) : (
              <div className="user-avatar-placeholder">{user.name?.[0]?.toUpperCase() || '?'}</div>
            )}
            <span className="user-name">{user.name}</span>
          </Link>
          <span className="role-badge" data-role={user.role}>{user.role}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
