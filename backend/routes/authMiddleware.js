// backend/routes/authMiddleware.js

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'bu_cok_onemli_gizli_bir_anahtar_olmalı_123!';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.error("JWT Doğrulama Hatası:", err.message);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;