import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Modal, Button, Form, Alert } from 'react-bootstrap';  // tambahkan Alert
import Navbar from '../components/Navbar';

const PlaylistRequested = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [dateWarning, setDateWarning] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/order-by-id/${orderId}`, {
        withCredentials: true
      });
      setOrder(res.data);
    } catch (err) {
      console.error('Gagal fetch order:', err);
      alert('Gagal memuat playlist');
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const filteredVideos = order?.Playlist?.filter(v =>
    (v.Judul || '').toLowerCase().includes(search.toLowerCase())
  ) || [];

  useEffect(() => {
    if (date && order) {
      const start = new Date(order.StartDate);
      const end = new Date(order.EndDate);
      const selected = new Date(date);

      if (selected < start || selected > end) {
        setDateWarning(`Tanggal tayang harus di antara ${order.StartDate} dan ${order.EndDate}`);
      } else {
        setDateWarning('');
      }
    } else {
      setDateWarning('');
    }
  }, [date, order]);

  const handleUpload = async () => {
    if (!title || !date || !file) {
      return alert('Lengkapi semua field!');
    }

    if (dateWarning) {
      return alert('Tanggal tayang tidak valid!');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('date', date);
    formData.append('file', file);
    formData.append('orderId', orderId);

    setIsUploading(true);

    try {
      await axios.post('http://localhost:3000/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Upload berhasil!');
      setShowModal(false);
      setTitle('');
      setDate('');
      setFile(null);
      fetchOrder();
    } catch (err) {
      console.error(err);
      alert('Gagal upload video.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (mediaId) => {
    const confirm = window.confirm('Yakin ingin menghapus video ini?');
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:3000/order/${orderId}/video/${mediaId}`, {
        withCredentials: true
      });
      alert('Video berhasil dihapus');
      fetchOrder();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus video');
    }
  };

  const handleDownloadReports = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/download-reports/${orderId}`, {
        responseType: 'blob',
        withCredentials: true
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reports-${orderId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh report ZIP');
    }
  };

  return (
    <div className="container-fluid p-0">
      <Navbar />
      <div className="container mt-2">
        <h4 className="text-center fw-bold">PLAYLIST</h4>

        {order && (
          <>
            <div className="mb-2">
              <p className="text-light mb-1">
                <span className="fw-bold">📦 Order ID:</span> <span className="text-info">{order.OrderID}</span>
              </p>
              <p className="text-light">
                🗓️ <span className="text-warning fw-semibold">{order.StartDate}</span> - <span className="text-warning fw-semibold">{order.EndDate}</span>
              </p>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <input
                type="text"
                placeholder="search"
                className="form-control input-dark me-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button className="btn btn-dark" onClick={() => setShowModal(true)}>＋</Button>
            </div>

            {filteredVideos.map(video => (
              <div key={video.MediaID} className="card mb-3 p-3 video-card">
                <div className="row g-0 w-100">
                  <div className="col-6 pe-3">
                    <video controls width="100%" style={{ borderRadius: '10px' }}>
                      <source src={video.VideoLink} type="video/mp4" />
                    </video>
                  </div>
                  <div className="col-6 d-flex flex-column justify-content-between">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="video-title">{video.Judul}</h6>
                        <small className="text-info">Tayang: {video.StartTayang}</small>
                      </div>
                      <button
                        onClick={() => handleDelete(video.MediaID)}
                        className="btn btn-link text-danger p-0"
                        style={{ fontSize: '1.25rem' }}
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="mt-3">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleDownloadReports}
                      >
                        REPORT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>UPLOAD</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Judul</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  className="border input-dark"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tanggal Tayang</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  className="border input-dark"
                  onChange={(e) => setDate(e.target.value)}
                />
              </Form.Group>

              {dateWarning && (
                <Alert variant="warning">
                  {dateWarning}
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label>File</Form.Label>
                <Form.Control
                  type="file"
                  accept="video/mp4"
                  className="border input-dark"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleUpload} disabled={isUploading || !!dateWarning}>
              {isUploading ? 'Uploading…' : 'Upload'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default PlaylistRequested;
