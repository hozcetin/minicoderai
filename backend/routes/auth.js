const express = require('express');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = 'bu_cok_onemli_gizli_bir_anahtar_olmalı_123!';

// Kullanıcı Kaydı
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
        
        // DÜZELTME: Dönen veriyi userPayload olarak alıyoruz.
        const userPayload = newUserQuery.rows[0];

        const token = jwt.sign(
            { user: { id: userPayload.id, role: userPayload.role } },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        // Frontend'e hem token'ı hem de TÜM kullanıcı verisini gönderiyoruz.
        res.status(201).json({ token, user: userPayload });

    } catch (err) {
        console.error("Kayıt sırasında hata:", err.message);
        res.status(500).send("Sunucu Hatası");
    }
});

// Kullanıcı Girişi (Bu rotanın zaten doğru veri döndürdüğünden emin oluyoruz)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Kullanıcı bulunamadı veya şifre yanlış." });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ error: "Kullanıcı bulunamadı veya şifre yanlış." });
        }
        
        const userPayload = {
            id: user.rows[0].id,
            name: user.rows[0].name,
            email: user.rows[0].email,
            role: user.rows[0].role,
            age: user.rows[0].age,
            gender: user.rows[0].gender
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
