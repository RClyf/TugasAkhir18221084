import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/login', {
        email,
        password
      }, {
        withCredentials: true
      });
  
      if (res.data.success) {
        navigate('/orders/requested'); // langsung ke requested
      }
    } catch (err) {
      setError('Login gagal. Periksa kembali email dan password.');
    }
  };
  

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-4">Login</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label text-black">Email</label>
            <input
              type="email"
              className="form-control text-black border"
              style={{
                backgroundColor: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px'
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label text-black">Password</label>
            <input
              type="password"
              className="form-control text-black border"
              style={{
                backgroundColor: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px'
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 fw-semibold">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
