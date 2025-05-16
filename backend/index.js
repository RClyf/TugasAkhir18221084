const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: ''
  }
});

const session = require('express-session');

app.use(session({
  secret: 'rahasia-aman-banget',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));


app.use(bodyParser.json());

const USERS_FILE = 'users.json';
let users = [];
if (fs.existsSync(USERS_FILE)) {
  users = JSON.parse(fs.readFileSync(USERS_FILE));
}

const ORDERS_FILE = 'orders.json';
let orders = [];
if (fs.existsSync(ORDERS_FILE)) {
  orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
}

function saveOrdersToFile() {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

const DISPLAY_FILE = 'display.json';
let displays = [];

if (fs.existsSync(DISPLAY_FILE)) {
  displays = JSON.parse(fs.readFileSync(DISPLAY_FILE));
}

const multer = require('multer');
const path = require('path');

if (!fs.existsSync('videos')) {
  fs.mkdirSync('videos');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'videos/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

if (!fs.existsSync('reports')) {
  fs.mkdirSync('reports');
}
app.use('/reports', express.static('reports'));

const REPORTS_FILE = 'reports.json';
let reports = [];

if (fs.existsSync(REPORTS_FILE)) {
  reports = JSON.parse(fs.readFileSync(REPORTS_FILE));
}

function saveReportsToFile() {
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
}

const { Storage } = require('@google-cloud/storage');
const cloudstorage = new Storage({
  keyFilename: path.join(__dirname, 'service-account.json'),
  projectId: 'voucherinc-01'
});
const bucketName = 'storage-reiz';

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.Email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Email tidak ditemukan' });
  }

  if (user.Password !== password) {
    return res.status(401).json({ error: 'Password salah' });
  }

  req.session.user = {
    UserID: user.UserID,
    Email: user.Email,
    ID_CMS: user.ID_CMS,
    Tipe: user.Tipe
  };

  res.json({ success: true, message: 'Login berhasil', user: req.session.user });
});

app.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json({ user: req.session.user });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout berhasil' });
  });
});

app.get('/displays', (req, res) => {
  res.status(200).json(displays);
});

app.post('/order', (req, res) => {
  const { StartDate, EndDate, Displays, UserID } = req.body;

  if (!StartDate || !EndDate || !Array.isArray(Displays) || Displays.length === 0 || !UserID) {
    return res.status(400).json({ error: 'Data tidak lengkap atau Displays kosong!' });
  }

  const isValid = Displays.every(d => d.ID_Display && d.Nama_Display && d.ID_CMS);
  if (!isValid) {
    return res.status(400).json({ error: 'Semua display harus memiliki ID_Display, Nama_Display, dan ID_CMS' });
  }

  const newOrder = {
    OrderID: uuidv4(),
    StartDate,
    EndDate,
    Displays,
    UserID
  };

  orders.push(newOrder);
  saveOrdersToFile();

  res.status(201).json({ message: 'Order berhasil ditambahkan!', OrderID: newOrder.OrderID });
});

app.get('/order/:userId', (req, res) => {
  const { userId } = req.params;

  const userOrders = orders.filter(order => order.UserID === userId);

  if (userOrders.length === 0) {
    return res.status(404).json({ message: 'Order tidak ditemukan untuk user ini.' });
  }

  res.status(200).json(userOrders);
});

app.get('/order-by-id/:orderId', (req, res) => {
  const { orderId } = req.params;

  const order = orders.find(o => o.OrderID === orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order tidak ditemukan.' });
  }

  res.json(order);
});


app.get('/my-orders', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Belum login' });
  }

  const user = req.session.user;

  const pesananSaya = orders.filter(order => order.UserID === user.UserID);
  const orderMasukCMS = orders.filter(order =>
    order.Displays.some(display => display.ID_CMS === user.ID_CMS)
  );

  res.json({
    pesananSaya,
    orderMasukCMS,
    ID_CMS: user.ID_CMS,
    Tipe: user.Tipe
  });
  
});

app.use('/videos', express.static('videos'));

app.post('/upload-video', upload.single('file'), async (req, res) => {
  const { title, date, orderId } = req.body;
  const localPath = req.file.path;
  const safeFileName = req.file.originalname.replace(/\s+/g, '_');
  const destinationPath = `videos/${Date.now()}-${safeFileName}`;

  try {
    await cloudstorage.bucket(bucketName).upload(localPath, {
      destination: destinationPath,
      resumable: false,
      predefinedAcl: 'publicRead'
    });

    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      console.log('🗑️ File lokal dihapus:', localPath);
    }

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destinationPath}`;

    const order = orders.find(o => o.OrderID === orderId);
    if (!order) return res.status(404).json({ error: 'Order tidak ditemukan' });
    if (!order.Playlist) order.Playlist = [];

    // 🔥 Validasi tanggal
    const inputDate = new Date(date);
    const startDate = new Date(order.StartDate);
    const endDate = new Date(order.EndDate);

    if (inputDate < startDate || inputDate > endDate) {
      return res.status(400).json({
        error: `Tanggal tayang harus berada di antara ${order.StartDate} dan ${order.EndDate}`
      });
    }

    const newMedia = {
      MediaID: uuidv4(),
      Judul: title,
      StartTayang: date,
      VideoLink: publicUrl
    };

    order.Playlist.push(newMedia);
    saveOrdersToFile();

    const sentCMS = new Set();
    order.Displays.forEach(display => {
      const userCMS = users.find(u => u.ID_CMS === display.ID_CMS);
      if (!userCMS || sentCMS.has(userCMS.ID_CMS)) return;

      // --- BEGIN: HANDLE CMS SEAMLESS ---
      // Jika userCMS.Tipe === 'seamless', artinya video seharusnya dikirim langsung ke CMS tersebut.
      // Contoh CMS seamless misalnya:
      // - CMS001 
      // - CMS003 
      //
      // Pada kondisi produksi sebenarnya (integrasi nanti),
      // di sini seharusnya dibuat logic untuk mengirim video otomatis ke API CMS masing-masing
      // sesuai dengan ID_CMS mereka.
      //
      // Contoh (hanya gambaran, belum diimplementasikan):
      //
      // if (userCMS.ID_CMS === 'CMS001') {
      //   // Kirim ke CMS001
      // } else if (userCMS.ID_CMS === 'CMS003') {
      //   // Kirim ke CMS003
      // }
      //
      // Namun, untuk prototype ini belum bisa dilakukan karena tidak mendapat izin, jadi dilewat saja.
      // --- END: HANDLE CMS SEAMLESS ---

      if (userCMS.Tipe === 'semi-manual') {
        const mailOptions = {
          from: 'arclyf@gmail.com',
          to: userCMS.Email,
          subject: `📢 Notifikasi Upload Video - ${title}`,
          html: `
            <p>Halo,</p>
            <p>Video baru telah diupload untuk CMS <strong>${userCMS.ID_CMS}</strong>:</p>
            <ul>
              <li><strong>Judul:</strong> ${title}</li>
              <li><strong>Tayang:</strong> ${date}</li>
              <li><strong>Link:</strong> <a href="${publicUrl}">${publicUrl}</a></li>
            </ul>
            <p>Silakan review dan proses selanjutnya.</p>
          `
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) console.error('Email gagal:', err);
          else console.log('📨 Email terkirim ke:', userCMS.Email);
        });
      }

      sentCMS.add(userCMS.ID_CMS);
    });

    res.json({ message: 'Video berhasil diupload!', media: newMedia });

  } catch (error) {
    console.error('❌ Gagal upload ke cloud storage:', error);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    res.status(500).json({ error: 'Upload gagal' });
  }
});


app.delete('/order/:orderId/video/:mediaId', async (req, res) => {
  const { orderId, mediaId } = req.params;

  const order = orders.find(o => o.OrderID === orderId);
  if (!order || !order.Playlist) {
    return res.status(404).json({ error: 'Order tidak ditemukan' });
  }

  const videoIndex = order.Playlist.findIndex(video => video.MediaID === mediaId);
  if (videoIndex === -1) {
    return res.status(404).json({ error: 'Video tidak ditemukan' });
  }

  const video = order.Playlist[videoIndex];

  try {
    const gcsPrefix = `https://storage.googleapis.com/${bucketName}/`;
    if (video.VideoLink.startsWith(gcsPrefix)) {
      const gcsPath = video.VideoLink.replace(gcsPrefix, '');
      await cloudstorage.bucket(bucketName).file(gcsPath).delete();
      console.log(`🗑️ File dihapus dari GCS: ${gcsPath}`);
    }
  } catch (err) {
    console.error('⚠️ Gagal menghapus file dari GCS:', err.message);
  }

  order.Playlist.splice(videoIndex, 1);
  saveOrdersToFile();

  res.json({ message: 'Video berhasil dihapus' });
});


const multerReport = multer({ dest: 'temp_reports/' });

app.post('/upload-report', multerReport.single('file'), async (req, res) => {
  const { orderId, mediaId, namaLaporan } = req.body;
  const file = req.file;

  if (!orderId || !mediaId || !file || !namaLaporan) {
    return res.status(400).json({ error: 'Semua field wajib diisi!' });
  }

  const reportId = uuidv4();
  const extension = path.extname(file.originalname);
  const sanitized = namaLaporan.toLowerCase().replace(/\s+/g, '-');
  const newFileName = `${sanitized}-${reportId}${extension}`;
  const destinationPath = `reports/${newFileName}`;

  try {
    await cloudstorage.bucket(bucketName).upload(file.path, {
      destination: destinationPath,
      resumable: false,
      predefinedAcl: 'publicRead'
    });

    const fileUrl = `https://storage.googleapis.com/${bucketName}/${destinationPath}`;

    const newReport = {
      ReportID: reportId,
      OrderID: orderId,
      MediaID: mediaId,
      FilePath: fileUrl
    };

    reports.push(newReport);
    saveReportsToFile();

    fs.unlinkSync(file.path);

    res.status(201).json({ message: 'Report berhasil diupload', report: newReport });

  } catch (err) {
    console.error('❌ Gagal upload report ke cloud storage:', err);
    res.status(500).json({ error: 'Upload report gagal' });
  }
});


const archiver = require('archiver');
const https = require('https');
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);

app.get('/download-reports/:orderId', async (req, res) => {
  const { orderId } = req.params;

  const reportsForOrder = reports.filter(r => r.OrderID === orderId);
  if (reportsForOrder.length === 0) {
    return res.status(404).json({ error: 'Tidak ada report untuk order ini.' });
  }

  res.attachment(`reports-${orderId}.zip`);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);

  archive.on('error', (err) => {
    console.error('❌ Gagal saat proses ZIP:', err);
    res.status(500).send('Gagal membuat ZIP file');
  });

  try {
    for (const report of reportsForOrder) {
      const url = report.FilePath;
      const nameInZip = path.basename(url);

      const fileBuffer = await new Promise((resolve, reject) => {
        https.get(url, (fileRes) => {
          const chunks = [];

          fileRes.on('data', (chunk) => {
            chunks.push(chunk);
          });

          fileRes.on('end', () => {
            resolve(Buffer.concat(chunks));
          });

          fileRes.on('error', reject);
        }).on('error', reject);
      });

      archive.append(fileBuffer, { name: nameInZip });
    }

    await archive.finalize();
  } catch (err) {
    console.error('❌ Error saat proses download dan zip:', err);
    if (!res.headersSent) {
      res.status(500).send('Gagal membuat ZIP file');
    }
  }
});


app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});