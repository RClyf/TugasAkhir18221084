import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NewOrder = () => {
  const [displays, setDisplays] = useState([]);
  const [selectedDisplays, setSelectedDisplays] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/displays')
      .then(res => setDisplays(res.data))
      .catch(() => setMessage('Gagal memuat data display.'));
  }, []);

  const handleCheckboxChange = (display) => {
    const exists = selectedDisplays.find(d => d.ID_Display === display.ID_Display);
    if (exists) {
      setSelectedDisplays(selectedDisplays.filter(d => d.ID_Display !== display.ID_Display));
    } else {
      setSelectedDisplays([...selectedDisplays, display]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !userId || selectedDisplays.length === 0) {
      return setMessage('Semua field wajib diisi!');
    }

    try {
      const res = await axios.post('http://localhost:3000/order', {
        StartDate: startDate,
        EndDate: endDate,
        Displays: selectedDisplays,
        UserID: userId
      });
      setMessage(`Order berhasil ditambahkan. ID: ${res.data.OrderID}`);
      setStartDate('');
      setEndDate('');
      setUserId('');
      setSelectedDisplays([]);
    } catch {
      setMessage('Gagal menambahkan order.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Form Order Publik</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Start Date</label>
          <input type="date" className="form-control" value={startDate}
            onChange={e => setStartDate(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>End Date</label>
          <input type="date" className="form-control" value={endDate}
            onChange={e => setEndDate(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>User ID</label>
          <input type="text" className="form-control" value={userId}
            onChange={e => setUserId(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Pilih Display</label>
          <div className="row">
            {displays.map(display => (
              <div className="col-md-4" key={display.ID_Display}>
                <div className="form-check">
                  <input type="checkbox" className="form-check-input"
                    checked={selectedDisplays.some(d => d.ID_Display === display.ID_Display)}
                    onChange={() => handleCheckboxChange(display)} />
                  <label className="form-check-label">
                    {display.Nama_Display} ({display.ID_CMS})
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="btn btn-success mt-3">Submit Order</button>
      </form>
    </div>
  );
};

export default NewOrder;
