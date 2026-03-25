import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('jwt_token', token);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, []);
  return (
    <div className="spinner-overlay">
      <div className="spinner"><div className="spinner-ring"></div></div>
      <p className="spinner-text">Authenticating...</p>
    </div>
  );
}
