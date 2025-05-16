import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const RequireAuth = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:3000/me', { withCredentials: true })
      .then(() => setAuthorized(true))
      .catch(() => setAuthorized(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!authorized) return <Navigate to="/login" replace />;

  return children;
};

export default RequireAuth;
