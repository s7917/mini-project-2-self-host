import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logout as logoutApi } from '../services/authService';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navLinks = [
    { path: '/dashboard', label: '✦ Dashboard', roles: ['learner', 'instructor', 'admin'] },
    { path: '/courses', label: '📚 Courses', roles: ['learner', 'instructor', 'admin'] },
    { path: '/my-courses', label: '🎯 My Courses', roles: ['learner'] },
    { path: '/performance', label: '📊 Performance', roles: ['learner'] },
    { path: '/instructor', label: '🎓 Instructor', roles: ['instructor'] },
    { path: '/admin', label: '⚙ Admin', roles: ['admin'] },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">◈</span>
          <span className="brand-text">EduVerse</span>
        </Link>
        <div className="navbar-links">
          {navLinks.filter(l => l.roles.includes(user.role)).map(link => (
            <Link key={link.path} to={link.path} className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="navbar-user">
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
