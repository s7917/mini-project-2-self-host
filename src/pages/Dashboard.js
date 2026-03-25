import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/me'); // Assume endpoint for current user
        setUser(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {user && <p>Welcome, {user.name} ({user.role})</p>}
      <nav>
        <Link to="/courses"><button>View Courses</button></Link>
        <Link to="/profile"><button>Profile</button></Link>
      </nav>
    </div>
  );
};

export default Dashboard;