import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate('/dashboard', { replace: true });
      return;
    }

    if (localStorage.getItem('token')) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (urlParams.get('error') === 'login_failed') {
      setErrorMessage('GitHub login failed. Please try again.');
    }
  }, [navigate]);

  const handleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/github';
  };

  return (
    <div>
      <h1>Login</h1>
      {errorMessage && <p>{errorMessage}</p>}
      <button onClick={handleLogin}>Login with GitHub</button>
    </div>
  );
};

export default Login;
