import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import OrdersRequested from './pages/OrdersRequested';
import OrdersReceived from './pages/OrdersReceived';
import NewOrder from './pages/NewOrder';
import RequireAuth from './components/RequireAuth';
import PlaylistRequested from './pages/PlaylistRequested';
import 'bootstrap/dist/css/bootstrap.min.css';
import PlaylistReceived from './pages/PlaylistReceived';
import PlaylistReceivedSemiManual from './pages/PlaylistReceivedSemiManual';

function App() {
  return (
    <div className="overlay-container">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/orders/new" element={<NewOrder />} />

          {/* Protected Routes */}
          <Route path="/orders/requested" element={
            <RequireAuth>
              <OrdersRequested />
            </RequireAuth>
          } />
          <Route path="/orders/received" element={
            <RequireAuth>
              <OrdersReceived />
            </RequireAuth>
          } />
          <Route path="/playlist/requested/:orderId" element={
            <RequireAuth>
              <PlaylistRequested />
            </RequireAuth>
          } />
          <Route path="/playlist/received/:orderId" element={
            <RequireAuth>
              <PlaylistReceived />
            </RequireAuth>
          } />
          <Route path="/playlist/received-semi/:orderId" element={
            <RequireAuth>
              <PlaylistReceivedSemiManual />
            </RequireAuth>
          } />

          {/* Default redirect to orders/requested */}
          <Route path="/" element={<Navigate to="/orders/requested" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
