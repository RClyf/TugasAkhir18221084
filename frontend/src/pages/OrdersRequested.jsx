import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import OrderCard from '../components/OrderCard';
import Navbar from '../components/Navbar';

const OrdersRequested = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/my-orders', { withCredentials: true })
      .then(res => {
        setOrders(res.data.pesananSaya);
      })
      .catch(err => {
        if (err.response?.status === 401) navigate('/login');
      });
  }, []);

  const filtered = orders.filter(order =>
    order.OrderID.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid p-0">
      <Navbar />
      <div className="container mt-3">
        <h4 className="text-center fw-bold text-white mb-4">📝 ORDER</h4>

        <div className="d-flex justify-content-center mb-4">
          <Link to="/orders/requested" className="btn btn-primary btn-sm mx-1 px-4">PLACED</Link>
          <Link to="/orders/received" className="btn btn-outline-primary btn-sm mx-1 px-4">RECEIVE</Link>
        </div>

        <input
          type="text"
          placeholder="Search Order ID..."
          className="form-control mb-4 text-white"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filtered.length > 0 ? (
          filtered.map(order => (
            <OrderCard key={order.OrderID} order={order} type="requested" />
          ))
        ) : (
          <p className="text-center text-light">No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default OrdersRequested;
