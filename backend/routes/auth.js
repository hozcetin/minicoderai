// backend/routes/auth.js

const express = require('express');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = 'bu_cok_onemli_gizli_bir_anahtar_olmalı_123!';

// Kullanıcı Kaydı (Bu kısımda bir değişiklik yok)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, age, gender } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Ad, e-posta ve şifre alanları zorunludur.' });
        }

        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1 OR name = $2", [email, name]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: "Bu e-posta veya kullanıcı adı zaten kullanılıyor." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const ageValue = age === '' ? null : parseInt(age, 10);
        const genderValue = gender === '' ? null : gender;

        const newUserQuery = await pool.query(
            "INSERT INTO users (name, email, password, role, age, gender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, age, gender",
            [name, email, hashedPassword, role || 'student', ageValue, genderValue]
        );
        
        const userPayload = newUserQuery.rows[0];

        const token = jwt.sign(
            { user: { id: userPayload.id, role: userPayload.role } },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, user: userPayload });

    } catch (err) {
        console.error("Kayıt sırasında hata:", err.message);
        res.status(500).send("Sunucu Hatası");
    }
});

// Kullanıcı Girişi
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Kullanıcı bulunamadı veya şifre yanlış." });
        }

        const user = userResult.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: "Kullanıcı bulunamadı veya şifre yanlış." });
        }
        
        // --- YENİ EKLENEN KISIM ---
        // Kullanıcının ilerleme verilerini yeni tablodan çekiyoruz.
        // Frontend'in öğrenciye göstereceği "ilk" başarı verilerini seçiyoruz.
        const progressResult = await pool.query(
            'SELECT level_id, first_score, first_stars FROM user_progress WHERE user_id = $1',
            [user.id]
        );
        // -------------------------

        const userPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            age: user.age,
            gender: user.gender,
            // --- YENİ EKLENEN KISIM ---
            // Çektiğimiz ilerleme verisini kullanıcı bilgisine ekliyoruz.
            progress: progressResult.rows
            // -------------------------
        };
        
        const token = jwt.sign(
            { user: { id: userPayload.id, role: userPayload.role } },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.json({ token, user: userPayload });

    } catch (err) {
        console.error("Giriş sırasında hata:", err.message);
        res.status(500).send("Sunucu Hatası");
    }
});

module.exports = router;