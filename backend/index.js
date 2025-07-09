// backend/index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress'); // YENİ: Progress rotasını import et

const app = express();
const PORT = process.env.PORT || 3001; // Port'u 3001 olarak bırakabiliriz, sorun değil

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Ana endpoint
app.get('/', (req, res) => {
  res.json({ message: 'MiniCoder AI Backend Çalışıyor!' });
});

// Test endpoint
app.get('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth routes çalışıyor!' });
});

// PostgreSQL bağlantı testi
app.get('/api/test-db', async (req, res) => {
  try {
    const pool = require('./config/database');
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      message: 'PostgreSQL bağlantısı başarılı!',
      time: result.rows[0].current_time
    });
  } catch (error) {
    console.error('PostgreSQL bağlantı hatası:', error);
    res.status(500).json({ 
      error: 'PostgreSQL bağlantı hatası',
      details: error.message 
    });
  }
});

// Rotalar
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes); // YENİ: Progress rotasını uygulamaya ekle

app.listen(PORT, () => {
  console.log(`Backend sunucusu ${PORT} portunda çalışıyor.`);
});