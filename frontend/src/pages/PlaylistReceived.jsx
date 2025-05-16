import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Modal, Button, Form } from 'react-bootstrap';

const PlaylistReceived = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const [showReportModal, setShowReportModal] = useState(false);
  const [currentMediaId, setCurrentMediaId] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [reports, setReports] = useState([]);
  const [namaLaporan, setNamaLaporan] = useState('');

  const [isUploading, setIsUploading] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/order-by-id/${orderId}`, {
        withCredentials: true
      });
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      alert('Gagal memuat data playlist');
      navigate('/orders/received');
    }
  };

  const openReportModal = async (mediaId) => {
    setCurrentMediaId(mediaId);
    setShowReportModal(true);
    try {
      const res = await axios.get(`http://localhost:3000/reports/${order.OrderID}/${mediaId}`);
      setReports(res.data);
    } catch {
      setReports([]);
    }
  };

  const handleReportUpload = async () => {
    if (!reportFile || !namaLaporan) return alert('Lengkapi nama laporan dan file!');

    const formData = new FormData();
    formData.append('file', reportFile);
    formData.append('orderId', order.OrderID);
    formData.append('mediaId', currentMediaId);
    formData.append('namaLaporan', namaLaporan);

    setIsUploading(true);

    try {
      await axios.post('http://localhost:3000/upload-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Report berhasil diupload!');
      setNamaLaporan('');
      setReportFile(null);
      setShowReportModal(false);
    } catch (err) {
      alert('Gagal upload report!');
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const filteredVideos = order?.Playlist?.filter(v =>
    (v.Judul || '').toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="container-fluid p-0">
      <Navbar />
      <div className="container mt-3">
        <h4 className="text-center fw-bold text-white mb-4">📺 PLAYLIST RECEIVED</h4>

        {order && (
          <>
            <div className="mb-3 p-3 bg-glass rounded">
              <h6 className="mb-1 text-white"><strong>ID ORDER:</strong> <span className="text-info">{order.OrderID}</span></h6>
              <p className="mb-0 text-warning">{order.StartDate} - {order.EndDate}</p>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <input
                type="text"
                placeholder="Search video title..."
                className="form-control input-dark me-2"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
                    <div>
                      <h6 className="video-title">{video.Judul}</h6>
                      <small className="text-info">Tayang: {video.StartTayang}</small>
                    </div>
                    <div className="mt-3">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => openReportModal(video.MediaID)}
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
      </div>

      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>UPLOAD REPORT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nama Laporan</Form.Label>
            <Form.Control
              type="text"
              value={namaLaporan}
              className="border input-dark"
              onChange={(e) => setNamaLaporan(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>File Report (PDF/Excel)</Form.Label>
            <Form.Control
              type="file"
              accept=".pdf,.xls,.xlsx"
              className="border input-dark"
              onChange={(e) => setReportFile(e.target.files[0])}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>
            Tutup
          </Button>
          <Button variant="primary" onClick={handleReportUpload} disabled={isUploading}>
              {isUploading ? 'Uploading…' : 'Upload'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PlaylistReceived;
