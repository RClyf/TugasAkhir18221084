import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('Gagal logout!');
    }
  };

  return (
    <nav
      className="px-4 py-3 mb-3"
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '0 0 12px 12px',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <h5 className="m-0 fw-bold" style={{ fontSize: '1.4rem' }}>
          <span className="text-info">Ads</span>
          <span className="text-white">Marketplace</span>
        </h5>

        <button
          className="btn btn-outline-danger btn-sm"
          onClick={handleLogout}
          style={{
            borderRadius: '8px',
            fontWeight: 600,
            padding: '4px 12px',
            border: '1px solid #dc3545'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
