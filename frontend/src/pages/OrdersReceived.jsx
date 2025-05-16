import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import OrderCard from '../components/OrderCard';
import Navbar from '../components/Navbar';

const OrdersReceived = () => {
  const [orders, setOrders] = useState([]);
  const [idCms, setIdCms] = useState('');
  const [userTipe, setUserTipe] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  

  useEffect(() => {
    axios.get('http://localhost:3000/my-orders', { withCredentials: true })
      .then(res => {
        setOrders(res.data.orderMasukCMS);
        setIdCms(res.data.ID_CMS);
        setUserTipe(res.data.Tipe);
      })
      .catch(err => {
        if (err.response?.status === 401) navigate('/login');
      });
  }, []);

  const filtered = orders
    .map(order => ({
      ...order,
      Displays: order.Displays.filter(d => d.ID_CMS === idCms)
    }))
    .filter(order =>
      order.OrderID.toLowerCase().includes(search.toLowerCase()) &&
      order.Displays.length > 0
    );

  return (
    <div className="container-fluid p-0">
      <Navbar />
      <div className="container mt-2">
        <h4 className="text-center fw-bold mt-2">ORDER</h4>

        <div className="d-flex justify-content-center my-3">
          <Link to="/orders/requested" className="btn btn-outline-primary btn-sm mx-1">PLACED</Link>
          <Link to="/orders/received" className="btn btn-primary btn-sm mx-1">RECEIVE</Link>
        </div>

        <input
          type="text"
          placeholder="search"
          className="form-control mb-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filtered.map(order => (
          <OrderCard
            key={order.OrderID}
            order={order}
            type="received"
            userTipe={userTipe}
          />
        ))}
      </div>
    </div>
  );
};

export default OrdersReceived;
