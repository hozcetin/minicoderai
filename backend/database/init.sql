-- =================================================================
-- MEVCUT TABLOLARI TEMİZLEME
-- =================================================================
-- Yeni şemayı kurmadan önce, eski ilerleme tablosunu (varsa) kaldırıyoruz.
-- Bu, temiz bir başlangıç yapmamızı sağlar.
DROP TABLE IF EXISTS user_progress;


-- =================================================================
-- KULLANICI TABLOSU VE TRIGGER'I
-- (Bu kısımda bir değişiklik yok, mevcut yapın korunuyor)
-- =================================================================

-- Kullanıcı tablosu
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(10),
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Otomatik updated_at güncellemesi için trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- users tablosu için trigger'ın zaten var olup olmadığını kontrol ederek oluşturma
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON users 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;


-- =================================================================
-- YENİ VE GELİŞMİŞ KULLANICI İLERLEME TABLOSU
-- (İstediğin "ilk" ve "son" kayıt mantığını içeren tablo)
-- =================================================================

CREATE TABLE user_progress (
    progress_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_id INTEGER NOT NULL,

    -- --- İlk Başarı Verileri (Öğrencinin Gördüğü ve Değişmeyen Alanlar) ---
    first_attempts INTEGER NOT NULL,
    first_time_spent_seconds INTEGER NOT NULL,
    first_block_count INTEGER NOT NULL,
    first_score INTEGER NOT NULL,
    first_stars INTEGER NOT NULL,
    first_completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- --- Son Deneme Verileri (Öğretmenin Gördüğü ve Sürekli Güncellenen Alanlar) ---
    last_attempts INTEGER,
    last_time_spent_seconds INTEGER,
    last_block_count INTEGER,
    last_score INTEGER,
    last_stars INTEGER,
    last_completed_at TIMESTAMPTZ,

    -- Her kullanıcının her seviye için sadece BİR tane kaydı olabilir.
    UNIQUE (user_id, level_id)
);

-- Veritabanı performansını artırmak için sık kullanılacak sütunlara index ekleyelim.
CREATE INDEX IF NOT EXISTS idx_user_progress_user_level ON user_progress(user_id, level_id);