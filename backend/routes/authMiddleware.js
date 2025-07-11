// backend/routes/authMiddleware.js

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'bu_cok_onemli_gizli_bir_anahtar_olmalı_123!';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        // Yetkisiz durumu için JSON formatında net bir mesaj gönder
        return res.status(401).json({ msg: 'Yetki reddedildi, token bulunamadı.' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error("JWT Doğrulama Hatası:", err.message);
            // Geçersiz token durumu için JSON formatında net bir mesaj gönder
            return res.status(403).json({ msg: 'Token geçerli değil veya süresi dolmuş.' });
        }
        
        // KESİN DÜZELTME:
        // Token'ın içindeki 'user' objesini doğrudan req.user'a atıyoruz.
        // Böylece diğer dosyalarda req.user.id diyerek ID'ye ulaşabiliriz.
        req.user = decoded.user;
        
        next(); // Her şey yolunda, bir sonraki işleme devam et
    });
}

module.exports = authenticateToken;