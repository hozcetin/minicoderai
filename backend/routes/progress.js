// backend/routes/progress.js

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('./authMiddleware');

// Seviye hedeflerini merkezi bir yerden yönetelim.
const levelData = {
    1: { optimalBlockCount: 2, penaltyPoint: 5 },
    2: { optimalBlockCount: 2, penaltyPoint: 5 }
};

function calculateScoreAndStars(attempts, blockCount, levelConfig) {
    let score = 100;

    const attemptPenalty = (attempts - 1) * levelConfig.penaltyPoint;
    score -= attemptPenalty;

    if (blockCount > levelConfig.optimalBlockCount) {
        const blockPenalty = (blockCount - levelConfig.optimalBlockCount) * levelConfig.penaltyPoint;
        score -= blockPenalty;
    }

    score = Math.max(0, score);

    let stars = 1;
    if (score >= 95) stars = 5;
    else if (score >= 85) stars = 4;
    else if (score >= 70) stars = 3;
    else if (score >= 50) stars = 2;

    return { score, stars };
}

// Kullanıcının ilerleme verisini getirir (Bu rota zaten doğru çalışıyordu)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const progress = await pool.query(
            'SELECT level_id, first_score, first_stars FROM user_progress WHERE user_id = $1',
            [req.user.id]
        );
        res.json(progress.rows);
    } catch (err) {
        console.error("GET /progress hatası:", err.message);
        res.status(500).json({ msg: "Sunucu hatası: İlerleme verileri alınamadı." });
    }
});

// Kullanıcının ilerlemesini kaydeder veya günceller
router.post('/save', authMiddleware, async (req, res) => {
    // 1. DÜZELTME: Gerekli tüm bilgilerin geldiğinden emin oluyoruz.
    const { levelId, attempts, timeSpentSeconds, blockCount } = req.body;
    
    // 2. DÜZELTME: Middleware'den gelen kullanıcı ID'sinin varlığını kontrol ediyoruz.
    // Bu, "null value in column" hatasını kökünden çözer.
    if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'Yetkilendirme başarısız, kullanıcı ID bulunamadı.' });
    }
    const userId = req.user.id;

    if (levelId === undefined || attempts === undefined || timeSpentSeconds === undefined || blockCount === undefined) {
        return res.status(400).json({ msg: 'Eksik bilgi gönderildi (levelId, attempts, timeSpentSeconds, blockCount).' });
    }

    const levelConfig = levelData[levelId];
    if (!levelConfig) {
        return res.status(400).json({ msg: `Geçersiz seviye ID'si: ${levelId}` });
    }

    const { score, stars } = calculateScoreAndStars(attempts, blockCount, levelConfig);

    try {
        const existingProgress = await pool.query(
            'SELECT * FROM user_progress WHERE user_id = $1 AND level_id = $2',
            [userId, levelId]
        );

        if (existingProgress.rows.length > 0) {
            // KAYIT VARSA: Sadece 'last_' alanlarını güncelle
            const updateQuery = `
                UPDATE user_progress 
                SET last_attempts = $1, last_time_spent_seconds = $2, last_block_count = $3, last_score = $4, last_stars = $5, last_completed_at = CURRENT_TIMESTAMP
                WHERE user_id = $6 AND level_id = $7
            `;
            await pool.query(updateQuery, [attempts, timeSpentSeconds, blockCount, score, stars, userId, levelId]);
        
        } else {
            // KAYIT YOKSA: 'first_' alanlarını doldurarak yeni bir kayıt oluştur
            const insertQuery = `
                INSERT INTO user_progress (user_id, level_id, first_attempts, first_time_spent_seconds, first_block_count, first_score, first_stars) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            await pool.query(insertQuery, [userId, levelId, attempts, timeSpentSeconds, blockCount, score, stars]);
        }

        // Frontend'e yeni hesaplanan puanı ve yıldızı gönder
        res.status(201).json({ score, stars });

    } catch (err) {
        console.error("POST /progress/save Veritabanı Hatası:", err.message);
        // 3. DÜZELTME: Artık her durumda JSON formatında hata gönderiyoruz.
        // Bu, frontend'deki 'SyntaxError' hatasını çözer.
        res.status(500).json({ msg: 'Sunucu hatası: İlerleme kaydedilemedi.'});
    }
});

module.exports = router;