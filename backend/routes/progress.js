const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('./authMiddleware');
const router = express.Router();

// GET /api/progress - Giriş yapmış kullanıcının tüm ilerlemesini getirir
router.get('/', authenticateToken, async (req, res) => {
    const user_id = req.user?.user?.id;
    if (!user_id) {
        return res.status(403).json({ error: 'Token içinden kullanıcı kimliği alınamadı.' });
    }

    try {
        const userProgress = await pool.query(
            "SELECT level_id, score FROM user_progress WHERE user_id = $1",
            [user_id]
        );
        res.json(userProgress.rows);
    } catch (err) {
        console.error("Kullanıcı ilerlemesi alınırken hata:", err.message);
        res.status(500).send('Sunucu Hatası');
    }
});

// POST /api/progress/save - Bir seviye tamamlama bilgisini kaydeder
router.post('/save', authenticateToken, async (req, res) => {
  const { level_id, score } = req.body;
  const user_id = req.user?.user?.id;

  if (!user_id) {
    return res.status(403).json({ error: 'Token içinden kullanıcı kimliği alınamadı.' });
  }

  if (level_id === undefined || score === undefined) {
    return res.status(400).json({ error: 'Level ID ve Puan bilgisi gerekli.' });
  }

  try {
    const newProgress = await pool.query(
      `INSERT INTO user_progress (user_id, level_id, score)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, level_id)
       DO UPDATE SET score = EXCLUDED.score, completed_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [user_id, level_id, score]
    );

    res.status(201).json(newProgress.rows[0]);
  } catch (err) {
    console.error("Veritabanı hatası:", err.message);
    res.status(500).json({ error: 'Sunucu tarafında veritabanı hatası oluştu.' });
  }
});

module.exports = router;
