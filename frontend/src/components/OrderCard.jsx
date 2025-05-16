import React from 'react';
import { Link } from 'react-router-dom';

const OrderCard = ({ order, type, userTipe }) => {
  return (
    <div
      className="card mb-4 shadow-sm"
      style={{
        borderRadius: '15px',
        background: 'rgba(255,255,255,0.85)',
        color: '#222',
        border: 'none'
      }}
    >
      <div className="d-flex flex-column flex-md-row align-items-md-center p-3">
        <div
          className="flex-shrink-0 bg-light rounded me-3 d-flex align-items-center justify-content-center"
          style={{ width: '70px', height: '70px' }}
        >
          <span role="img" aria-label="display" style={{ fontSize: '2rem' }}>🖥️</span>
        </div>
        <div className="flex-grow-1">
          <p className="mb-1 fw-bold">ID: {order.OrderID}</p>
          <p className="mb-2 text-secondary" style={{ fontSize: '0.9em' }}>
            {order.StartDate} - {order.EndDate}
          </p>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-outline-secondary btn-sm">DETAIL</button>
            <Link
              to={
                type === 'received'
                  ? userTipe === 'semi-manual'
                    ? `/playlist/received-semi/${order.OrderID}`
                    : `/playlist/received/${order.OrderID}`
                  : `/playlist/requested/${order.OrderID}`
              }
              className="btn btn-primary btn-sm"
            >
              PLAYLIST
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
